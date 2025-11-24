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
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
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
  };
  onClose: () => void;
  onSave: (pageId: string, editedText: string) => Promise<void>;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_WEB = Platform.OS === 'web';
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768; // Tablet/Desktop

export default function LineByLineTextEditor({
  visible,
  page,
  onClose,
  onSave,
}: LineByLineTextEditorProps) {
  const { theme } = useTheme();
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);

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
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
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
        >
          <View style={IS_LARGE_SCREEN ? styles.twoColumnLayout : styles.singleColumnLayout}>
            {/* Photo Section */}
            <View style={IS_LARGE_SCREEN ? styles.photoSectionWide : styles.photoSection}>
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
                IS_LARGE_SCREEN ? styles.photoContainerWide : styles.photoContainer,
                { borderColor: theme.border }
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
            <View style={IS_LARGE_SCREEN ? styles.editorSectionWide : styles.editorSection}>
              <Text style={[styles.sectionLabel, styles.editorLabel, { color: theme.textSecondary }]}>
                Edit All Text
              </Text>
              <TextInput
                style={[
                  IS_LARGE_SCREEN ? styles.textInputWide : styles.textInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    paddingBottom: IS_LARGE_SCREEN ? 12 : 120, // Extra padding at bottom for scrolling past keyboard
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
              />
              <Text style={[styles.charCount, { color: theme.textTertiary }]}>
                {editedText.length} characters
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { borderTopColor: theme.divider }]}>
          <View style={IS_LARGE_SCREEN ? styles.buttonContainerWide : styles.buttonContainerMobile}>
            <Pressable
              style={[
                IS_LARGE_SCREEN ? styles.footerButtonWide : styles.footerButton,
                { backgroundColor: theme.secondary, borderColor: theme.border }
              ]}
              onPress={handleCancel}
            >
              <Text style={[styles.footerButtonText, { color: theme.text }]}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                IS_LARGE_SCREEN ? styles.footerButtonWide : styles.footerButton,
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
                  {IS_LARGE_SCREEN ? 'Save Changes' : 'Save All Changes'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
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
    minHeight: SCREEN_HEIGHT * 0.7,
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
    height: SCREEN_HEIGHT * 0.2, // Compact at 20% for mobile
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoContainerWide: {
    height: SCREEN_HEIGHT * 0.6, // Taller on web/tablet for better viewing
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
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: SCREEN_HEIGHT * 0.2, // Match photo height on mobile
    lineHeight: 22,
  },
  textInputWide: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: SCREEN_HEIGHT * 0.6, // Match photo height
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
    paddingVertical: 14,
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
    fontSize: 16,
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
});

