import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import { apiService } from '../utils/apiService';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface LineByLineTextEditorProps {
  visible: boolean;
  page: {
    id: string;
    photo_url?: string;
    extracted_text: string;
    edited_text?: string;
    rotation?: number;
  };
  onClose: () => void;
  onSave: (pageId: string, editedText: string) => Promise<void>;
}

const IS_WEB = Platform.OS === 'web';

export default function LineByLineTextEditor({
  visible,
  page,
  onClose,
  onSave,
}: LineByLineTextEditorProps) {
  const { theme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Dynamically calculate based on current window size
  const isLargeScreen = windowWidth > 768;
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [showCorrectionPreview, setShowCorrectionPreview] = useState(false);
  const [correctedText, setCorrectedText] = useState('');

  // Gesture values for zoom and pan
  const scale = useSharedValue(3); // Start at 3x zoom
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(3); // Start at 3x zoom
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Initialize with edited or extracted text
  useEffect(() => {
    setEditedText(page.edited_text || page.extracted_text || '');
  }, [page.edited_text, page.extracted_text]);

  // Initialize zoom when modal opens
  useEffect(() => {
    if (visible) {
      scale.value = withTiming(3); // Start zoomed in at 3x
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedScale.value = 3;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  }, [visible]);

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      // Limit while pinching for smoother experience
      scale.value = Math.max(1, Math.min(newScale, 10));
    })
    .onEnd(() => {
      // Ensure we stay within limits
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 10) {
        scale.value = withSpring(10);
      }
      savedScale.value = scale.value;
    });

  // Pan gesture for moving zoomed image
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Adjust translation based on rotation angle
      const rotationRad = ((page.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(-rotationRad);
      const sin = Math.sin(-rotationRad);

      // Apply inverse rotation to translation deltas
      const adjustedX = event.translationX * cos - event.translationY * sin;
      const adjustedY = event.translationX * sin + event.translationY * cos;

      translateX.value = savedTranslateX.value + adjustedX;
      translateY.value = savedTranslateY.value + adjustedY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to reset zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, pinchGesture),
    panGesture
  );

  // Animated style for the image
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${page.rotation || 0}deg` },
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(page.id, editedText);
      onClose();
    } catch (error) {
      console.error('Error saving edited text:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedText(page.edited_text || page.extracted_text || '');
    setShowCorrectionPreview(false);
    setCorrectedText('');
    onClose();
  };

  const handleZoomIn = () => {
    const newScale = Math.min(savedScale.value + 0.5, 10); // Increased max to 10x for tiny handwriting
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
  };

  const handleZoomOut = () => {
    const newScale = Math.max(savedScale.value - 0.5, 1);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
    
    // Reset position if zooming all the way out
    if (newScale === 1) {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  };

  const handleResetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const handleFixText = async () => {
    try {
      setFixing(true);
      const result = await apiService.correctPageText(page.id);
      setCorrectedText(result.corrected);

      // On large screens, show preview modal. On mobile, apply directly
      if (isLargeScreen) {
        setShowCorrectionPreview(true);
      } else {
        // Automatically apply correction on mobile
        setEditedText(result.corrected);
        setCorrectedText('');
      }
    } catch (error) {
      console.error('Error correcting text:', error);
      // TODO: Show error message to user
    } finally {
      setFixing(false);
    }
  };

  const handleAcceptCorrection = () => {
    setEditedText(correctedText);
    setShowCorrectionPreview(false);
    setCorrectedText('');
  };

  const handleRejectCorrection = () => {
    setShowCorrectionPreview(false);
    setCorrectedText('');
  };

  if (!page.extracted_text) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              No Text Detected
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              AI hasn't processed this page yet or no text was detected.
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Extracted Text
          </Text>
          <Pressable onPress={handleCancel} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: isLargeScreen ? 0 : 20 }}
        >
          <View style={[
            isLargeScreen ? styles.twoColumnLayout : styles.singleColumnLayout,
            isLargeScreen && { minHeight: windowHeight * 0.7 }
          ]}>
            {/* Photo Section */}
            <View style={isLargeScreen ? styles.photoSectionWide : styles.photoSection}>
              <View style={styles.photoHeader}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Reference Image
                </Text>
                <View style={styles.zoomControls}>
                  <Pressable
                    style={[styles.zoomButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                    onPress={handleZoomOut}
                  >
                    <Icon name="remove" size={20} color={theme.text} />
                  </Pressable>
                  <Pressable
                    style={[styles.zoomButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                    onPress={handleResetZoom}
                  >
                    <Icon name="fit-screen" size={20} color={theme.text} />
                  </Pressable>
                  <Pressable
                    style={[styles.zoomButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                    onPress={handleZoomIn}
                  >
                    <Icon name="add" size={20} color={theme.text} />
                  </Pressable>
                </View>
              </View>
              <View style={[
                isLargeScreen ? styles.photoContainerWide : styles.photoContainer,
                {
                  borderColor: theme.border,
                  height: isLargeScreen ? windowHeight * 0.6 : windowHeight * 0.15
                }
              ]}>
                <GestureDetector gesture={composedGesture}>
                  <Animated.View style={styles.photoWrapper}>
                    <Animated.Image
                      source={{ uri: page.photo_url }}
                      style={[styles.photo, animatedImageStyle]}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
              <Text style={[styles.hint, { color: theme.textTertiary }]}>
                {IS_WEB ? 'Use +/- buttons • Click and drag to pan' : 'Pinch to zoom, drag to pan, double-tap to reset'}
              </Text>
            </View>

            {/* Text Editor Section */}
            <View style={isLargeScreen ? styles.editorSectionWide : styles.editorSection}>
              <View style={styles.photoHeader}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Extracted Text
                </Text>
                <View style={styles.zoomControls}>
                  {/* Empty space to match photo header height */}
                </View>
              </View>
              <TextInput
                style={[
                  isLargeScreen ? styles.textInputWide : styles.textInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    paddingBottom: 12,
                    height: isLargeScreen ? undefined : windowHeight * 0.15,
                    minHeight: isLargeScreen ? windowHeight * 0.6 : undefined,
                  },
                ]}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                numberOfLines={15}
                textAlignVertical="top"
                placeholder="Edit the extracted text..."
                placeholderTextColor={theme.textTertiary}
                scrollEnabled={true}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <Text style={[styles.charCount, { color: theme.textTertiary }]}>
                {editedText.length} characters
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { borderTopColor: theme.divider }]}>
          <Text style={[styles.footerHint, { color: theme.textTertiary }]}>
            You can manually compare and edit the text or use AI Auto Correct to fix spelling and formatting
          </Text>
          <View style={isLargeScreen ? styles.buttonContainerWide : styles.buttonContainerMobile}>
            <Pressable
              style={[
                isLargeScreen ? styles.footerButtonWide : styles.footerButton,
                { backgroundColor: theme.secondary, borderColor: theme.border }
              ]}
              onPress={handleCancel}
            >
              <Text style={[styles.footerButtonText, { color: theme.text }]}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                isLargeScreen ? styles.footerButtonWide : styles.footerButton,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: (fixing || !editedText.trim()) ? theme.textTertiary : theme.primary,
                  opacity: (fixing || !editedText.trim()) ? 0.5 : 1,
                }
              ]}
              onPress={handleFixText}
              disabled={fixing || !editedText.trim()}
            >
              {fixing ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <View style={styles.buttonWithIcon}>
                  <Icon name="auto-awesome" size={18} color={theme.primary} />
                  <Text style={[styles.footerButtonText, { color: theme.primary, marginLeft: 6 }]}>
                    {isLargeScreen ? 'Auto Correct' : 'Fix'}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={[
                isLargeScreen ? styles.footerButtonWide : styles.footerButton,
                styles.saveButton,
                { backgroundColor: theme.primary }
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.primaryText} />
              ) : (
                <Text style={[styles.footerButtonText, { color: theme.primaryText }]}>
                  {isLargeScreen ? 'Save Changes' : 'Save'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Correction Preview Modal - Web only */}
        {isLargeScreen && showCorrectionPreview && (
          <Modal
            visible={showCorrectionPreview}
            transparent={true}
            animationType="fade"
            onRequestClose={handleRejectCorrection}
          >
            <View style={styles.correctionOverlay}>
              <View style={[styles.correctionModal, { backgroundColor: theme.background }]}>
                <View style={[styles.correctionHeader, { borderBottomColor: theme.divider }]}>
                  <Text style={[styles.correctionTitle, { color: theme.text }]}>
                    Text Correction Preview
                  </Text>
                  <Pressable onPress={handleRejectCorrection} style={styles.correctionCloseButton}>
                    <Icon name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <ScrollView style={styles.correctionContent}>
                  <View style={[styles.correctionComparison, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
                    <View style={styles.correctionColumn}>
                      <Text style={[styles.correctionColumnTitle, { color: theme.textSecondary }]}>
                        Original Text
                      </Text>
                      <View style={[styles.correctionTextBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.correctionText, { color: theme.text }]}>
                          {editedText}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.correctionColumn}>
                      <Text style={[styles.correctionColumnTitle, { color: theme.textSecondary }]}>
                        Corrected Text
                      </Text>
                      <View style={[styles.correctionTextBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.correctionText, { color: theme.text }]}>
                          {correctedText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.correctionHint, { color: theme.textTertiary }]}>
                    Review the changes and choose to accept or reject the corrections
                  </Text>
                </ScrollView>

                <View style={[styles.correctionFooter, { borderTopColor: theme.divider }]}>
                  <Pressable
                    style={[styles.correctionButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                    onPress={handleRejectCorrection}
                  >
                    <Text style={[styles.correctionButtonText, { color: theme.text }]}>Reject</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.correctionButton, styles.acceptButton, { backgroundColor: theme.primary }]}
                    onPress={handleAcceptCorrection}
                  >
                    <Text style={[styles.correctionButtonText, { color: theme.primaryText }]}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: 60, // Account for status bar
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    padding: 16,
    gap: 24,
    alignItems: 'flex-start',
  },
  singleColumnLayout: {
    flexDirection: 'column',
  },
  photoSection: {
    padding: 16,
  },
  photoSectionWide: {
    flex: 1,
    paddingRight: 12,
    paddingTop: 0,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  editorLabel: {
    marginBottom: 12, // Extra spacing like the photo section
  },
  zoomControls: {
    flexDirection: 'row',
    gap: 8,
    minHeight: 32,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoContainerWide: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // @ts-ignore - web-only styles
    cursor: IS_WEB ? 'grab' : undefined, // Hand cursor on web
    userSelect: IS_WEB ? 'none' : undefined, // Prevent text selection on drag
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  editorSection: {
    padding: 16,
    paddingTop: 0,
  },
  editorSectionWide: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 0,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  textInputWide: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  buttonContainerMobile: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonContainerWide: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    maxWidth: 500,
    alignSelf: 'center',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerButtonWide: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 140,
  },
  saveButton: {
    borderWidth: 0,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  correctionModal: {
    width: '100%',
    maxWidth: 900,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  correctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  correctionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  correctionCloseButton: {
    padding: 4,
  },
  correctionContent: {
    padding: 16,
  },
  correctionComparison: {
    gap: 16,
  },
  correctionColumn: {
    flex: 1,
  },
  correctionColumnTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  correctionTextBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
  },
  correctionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  correctionHint: {
    fontSize: 12,
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  correctionFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  correctionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptButton: {
    borderWidth: 0,
  },
  correctionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

