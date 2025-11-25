import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjectPages } from '../../hooks/useProjectPages';
import Icon from '../../components/Icon';

const IS_WEB = Platform.OS === 'web';

export default function CombinedTextScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const projectId = params.id as string;
  const projectName = params.name as string || 'Untitled Project';

  const { capturedPages, isLoading } = useProjectPages(projectId);
  const [isCopying, setIsCopying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const combinedText = capturedPages
    .map((page) => {
      const text = page.edited_text || page.extracted_text || '';
      return text ? `Page ${page.pageNumber}\n\n${text}` : '';
    })
    .filter(Boolean)
    .join('\n\n---\n\n');

  const stats = {
    pageCount: capturedPages.length,
    pagesWithText: capturedPages.filter(p => p.edited_text || p.extracted_text).length,
    wordCount: combinedText.split(/\s+/).filter(Boolean).length,
    characterCount: combinedText.length,
  };

  const handleCopyToClipboard = async () => {
    try {
      setIsCopying(true);
      await Clipboard.setStringAsync(combinedText);
      Alert.alert('Copied!', 'All text has been copied to your clipboard.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy text to clipboard.');
    } finally {
      setIsCopying(false);
    }
  };

  const handleExportAsText = async () => {
    try {
      setIsExporting(true);

      const fileName = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;

      if (IS_WEB) {
        // Web: Create download link
        const blob = new Blob([combinedText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Mobile: Save to file system and share
        const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

        if (!baseDir) {
          throw new Error('File storage is not available on this device.');
        }

        const filePath = `${baseDir}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, combinedText, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'text/plain',
            dialogTitle: `Export ${projectName}`,
          });
        } else {
          Alert.alert('Text Saved', `Saved to: ${filePath}`);
        }
      }

      Alert.alert('Success', 'Text file exported successfully!');
    } catch (error) {
      console.error('Error exporting text:', error);
      Alert.alert('Export Failed', 'Failed to export text file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Combined Text</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading text...
            </Text>
          </View>
        </View>
      </>
    );
  }

  if (!combinedText) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Combined Text</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.emptyContainer}>
            <Icon name="description" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Text Available</Text>
            <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
              Process pages with AI to extract text, then it will appear here.
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Combined Text</Text>
          <View style={styles.placeholder} />
        </View>

      {/* Stats Section */}
      <View style={[styles.statsSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.pageCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Pages</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.pagesWithText}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>With Text</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.wordCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{stats.characterCount.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Characters</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionsSection, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.secondary, borderColor: theme.border }]}
          onPress={handleCopyToClipboard}
          disabled={isCopying}
        >
          {isCopying ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <>
              <Icon name="content-copy" size={18} color={theme.text} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Copy All</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={handleExportAsText}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={theme.primaryText} />
          ) : (
            <>
              <Icon name="download" size={18} color={theme.primaryText} />
              <Text style={[styles.actionButtonText, { color: theme.primaryText }]}>
                Export as .txt
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Combined Text Display */}
      <ScrollView
        style={styles.textContainer}
        contentContainerStyle={styles.textContent}
      >
        <Text style={[styles.combinedText, { color: theme.text }]}>
          {combinedText}
        </Text>
      </ScrollView>
      </View>
    </>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
  },
  textContent: {
    padding: 20,
  },
  combinedText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'Monaco, Consolas, monospace',
    }),
  },
});
