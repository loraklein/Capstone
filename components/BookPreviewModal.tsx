import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './Icon';
import { useTheme } from '../contexts/ThemeContext';
import { BookSettings } from './BookExportSettingsModal';

interface BookPreviewModalProps {
  visible: boolean;
  projectName: string;
  projectDescription?: string;
  bookSettings: BookSettings;
  onDismiss: () => void;
  onExport: () => void;
}

export default function BookPreviewModal({
  visible,
  projectName,
  projectDescription,
  bookSettings,
  onDismiss,
  onExport,
}: BookPreviewModalProps) {
  const { theme } = useTheme();
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (visible) {
      generatePreview();
    }
  }, [visible, bookSettings]);

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      // Fetch HTML preview from backend
      const { apiService } = await import('../utils/apiService');
      const html = await apiService.getBookPreviewHtml(
        bookSettings.projectId,
        bookSettings
      );

      setPreviewHtml(html);
      setTotalPages(calculateTotalPages(html));
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPages = (html: string): number => {
    // Simple estimation based on content length
    // In a real implementation, this would be more sophisticated
    const pageBreaks = (html.match(/page-break-after/g) || []).length;
    return Math.max(1, pageBreaks + 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to next page in WebView
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to previous page in WebView
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Book Preview
            </Text>
          </View>
          <Pressable
            style={[styles.exportButton, { backgroundColor: theme.primary }]}
            onPress={onExport}
          >
            <Icon name="download" size={20} color="white" />
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </Pressable>
        </View>

        {/* Preview Settings Info */}
        <View style={[styles.settingsBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.settingItem}>
            <Icon name="format-size" size={16} color={theme.textSecondary} />
            <Text style={[styles.settingText, { color: theme.textSecondary }]}>
              {bookSettings.fontSize}pt {bookSettings.fontFamily}
            </Text>
          </View>
          <View style={styles.settingItem}>
            <Icon name="aspect-ratio" size={16} color={theme.textSecondary} />
            <Text style={[styles.settingText, { color: theme.textSecondary }]}>
              {bookSettings.bookSize}
            </Text>
          </View>
          {bookSettings.includeTableOfContents && (
            <View style={styles.settingItem}>
              <Icon name="list" size={16} color={theme.textSecondary} />
              <Text style={[styles.settingText, { color: theme.textSecondary }]}>
                TOC
              </Text>
            </View>
          )}
        </View>

        {/* Preview Content */}
        <View style={styles.previewContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Generating preview...
              </Text>
            </View>
          ) : Platform.OS === 'web' ? (
            // For web, render HTML directly
            <ScrollView style={styles.scrollView}>
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                style={{
                  padding: '20px',
                  maxWidth: '800px',
                  margin: '0 auto',
                  backgroundColor: 'white',
                }}
              />
            </ScrollView>
          ) : (
            // For mobile, use WebView
            <WebView
              source={{ html: previewHtml }}
              style={styles.webView}
              scalesPageToFit={true}
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>

        {/* Page Navigation */}
        {!isLoading && (
          <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <Pressable
              style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              <Icon
                name="chevron-left"
                size={24}
                color={currentPage === 1 ? theme.textTertiary : theme.primary}
              />
            </Pressable>

            <Text style={[styles.pageIndicator, { color: theme.text }]}>
              Page {currentPage} of {totalPages}
            </Text>

            <Pressable
              style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <Icon
                name="chevron-right"
                size={24}
                color={currentPage === totalPages ? theme.textTertiary : theme.primary}
              />
            </Pressable>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingText: {
    fontSize: 13,
  },
  previewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '500',
  },
});
