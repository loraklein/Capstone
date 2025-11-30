import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface ExportOptionsModalProps {
  visible: boolean;
  projectId: string;
  projectName: string;
  onQuickExport: () => void;
  onCustomPdf?: () => void;
  onPrintBook?: () => void;
  onDismiss: () => void;
}

const IS_WEB = Platform.OS === 'web';
const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_TABLET = SCREEN_WIDTH >= 768;

export default function ExportOptionsModal({
  visible,
  projectId,
  projectName,
  onQuickExport,
  onCustomPdf,
  onPrintBook,
  onDismiss,
}: ExportOptionsModalProps) {
  const { theme } = useTheme();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Generate web URL for this project
  const getProjectWebUrl = () => {
    // In development, use localhost; in production, use deployed URL
    const baseUrl = __DEV__
      ? 'http://localhost:8081'
      : window.location.origin; // Use current deployment URL

    return `${baseUrl}/project/${projectId}?name=${encodeURIComponent(projectName)}`;
  };

  const handleCopyLink = async () => {
    try {
      setIsGeneratingLink(true);
      const url = getProjectWebUrl();
      await Clipboard.setStringAsync(url);
      Alert.alert('Link Copied!', 'Paste the link in your web browser to design your book.');
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleOpenInBrowser = () => {
    const url = getProjectWebUrl();

    if (IS_WEB) {
      // Already on web, just navigate
      window.location.href = url;
    } else {
      // On mobile, open in external browser
      Linking.openURL(url).catch((err) => {
        console.error('Failed to open URL:', err);
        Alert.alert('Error', 'Failed to open browser. Please copy the link instead.');
      });
    }
  };

  const handleEmailLink = () => {
    const url = getProjectWebUrl();
    const subject = encodeURIComponent(`Design ${projectName}`);
    const body = encodeURIComponent(
      `Open this link in a web browser to design and customize your book:\n\n${url}\n\nDesign features:\n- Custom cover design\n- Professional formatting\n- Font customization\n- Print-ready export`
    );

    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    Linking.openURL(mailtoUrl).catch((err) => {
      console.error('Failed to open email:', err);
      Alert.alert('Error', 'Failed to open email app. Please copy the link instead.');
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Export Options</Text>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Quick Export Option */}
          <Pressable
            style={[styles.option, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => {
              onDismiss();
              onQuickExport();
            }}
          >
            <View style={[styles.optionIcon, { backgroundColor: theme.primary }]}>
              <Icon name="file-download" size={28} color={theme.primaryText} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Quick Export</Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                Export a basic PDF now with all your pages
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.textTertiary} />
          </Pressable>

          {/* Create Printable Book Option */}
          {onPrintBook && (
            <Pressable
              style={[styles.option, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => {
                onDismiss();
                onPrintBook();
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.secondary }]}>
                <Icon name="menu-book" size={28} color={theme.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Create Printable Book</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  Generate a print-ready book with cover and professional formatting
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.textTertiary} />
            </Pressable>
          )}

          {/* Design Mode Option - Mobile Only */}
          {!IS_WEB && (
            <View style={[styles.designSection, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.designHeader}>
                <View style={[styles.optionIcon, { backgroundColor: theme.secondary }]}>
                  <Icon name="palette" size={28} color={theme.primary} />
                </View>
                <View style={styles.designHeaderText}>
                  <Text style={[styles.optionTitle, { color: theme.text }]}>Design Mode</Text>
                  <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                    Open in a web browser on devices with larger screen sizes for professional features
                  </Text>
                </View>
              </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color={theme.success || theme.primary} />
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                  Design custom book covers
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color={theme.success || theme.primary} />
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                  Choose fonts and formatting
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color={theme.success || theme.primary} />
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                  Export print-ready PDFs
                </Text>
              </View>
            </View>

            {/* Transition Options */}
            <View style={styles.transitionOptions}>
              <Text style={[styles.transitionLabel, { color: theme.textSecondary }]}>
                Open on web:
              </Text>

              {!IS_WEB && (
                <Pressable
                  style={[styles.transitionButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                  onPress={handleEmailLink}
                >
                  <Icon name="email" size={18} color={theme.text} />
                  <Text style={[styles.transitionButtonText, { color: theme.text }]}>
                    Email Link
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.transitionButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                onPress={handleCopyLink}
                disabled={isGeneratingLink}
              >
                {isGeneratingLink ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <>
                    <Icon name="link" size={18} color={theme.text} />
                    <Text style={[styles.transitionButtonText, { color: theme.text }]}>
                      Copy Link
                    </Text>
                  </>
                )}
              </Pressable>

              {!IS_WEB && IS_TABLET && (
                <Pressable
                  style={[styles.transitionButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                  onPress={handleOpenInBrowser}
                >
                  <Icon name="open-in-browser" size={18} color={theme.text} />
                  <Text style={[styles.transitionButtonText, { color: theme.text }]}>
                    Open Browser
                  </Text>
                </Pressable>
              )}
            </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  designSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  designHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  designHeaderText: {
    flex: 1,
    gap: 4,
  },
  featuresList: {
    gap: 8,
    paddingLeft: 4,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  transitionOptions: {
    gap: 8,
  },
  transitionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transitionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  transitionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  webNotice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  webNoticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
