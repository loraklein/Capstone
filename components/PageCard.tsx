import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';
import PagePhoto from './PagePhoto';

const IS_WEB = Platform.OS === 'web';
const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768;

interface PageCardProps {
  page: CapturedPage;
  onView: (page: CapturedPage) => void;
  onDelete: (pageId: string) => void;
  onProcessAI?: (pageId: string) => Promise<void>;
  onEditText?: (page: CapturedPage) => void;
  isBatchProcessing?: boolean;
}

export default function PageCard({ page, onView, onDelete, onProcessAI, onEditText, isBatchProcessing = false }: PageCardProps) {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const handleView = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onView(page);
  };

  const handleTextPress = () => {
    if (page.extracted_text) {
      setShowFullText(!showFullText);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDelete(page.id);
  };

  const handleProcessAI = async () => {
    if (!onProcessAI || isProcessing) return;

    setIsProcessing(true);
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await onProcessAI(page.id);
    } catch (error) {
      console.log('Error processing page with AI:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getReviewStatusIcon = () => {
    const reviewStatus = page.review_status || 'unreviewed';
    switch (reviewStatus) {
      case 'reviewed':
        return {
          icon: 'check-circle',
          color: theme.success || '#4CAF50',
        };
      case 'needs_attention':
        return {
          icon: 'warning',
          color: theme.warning || '#FF9800',
        };
      default: // unreviewed
        return {
          icon: 'radio-button-unchecked',
          color: theme.textTertiary,
        };
    }
  };

  const reviewIcon = getReviewStatusIcon();

  return (
    <Pressable
      style={[styles.pageCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={handleView}
    >
      <View style={[styles.pageHeader, { backgroundColor: theme.card }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.pageNumber, { color: theme.text }]}>
            Page {page.pageNumber}
          </Text>
          {/* Review Status Icon */}
          <View style={styles.reviewIconContainer}>
            <Icon name={reviewIcon.icon} size={16} color={reviewIcon.color} />
          </View>
        </View>
        <Pressable
          style={styles.deletePageButton}
          onPress={handleDelete}
          accessibilityLabel="Delete page"
        >
          <Icon name="delete" size={16} color={theme.error} />
        </Pressable>
      </View>
      
      <PagePhoto page={page} height={120} />
      
      {/* AI Processing Section */}
      <View style={[styles.aiSection, { backgroundColor: theme.surface }]}>
        {page.extracted_text ? (
          <View style={styles.extractedTextContainer}>
            <View style={styles.extractedTextHeader}>
              <Text style={[styles.extractedTextLabel, { color: theme.textSecondary }]}>
                Extracted Text:
              </Text>
              {onEditText && page.extracted_text && (
                <Pressable
                  style={[styles.editButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    onEditText(page);
                  }}
                >
                  <Icon name="edit" size={14} color="white" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={handleTextPress}
              style={styles.textPressableArea}
            >
              <Text
                style={[
                  IS_LARGE_SCREEN ? styles.extractedTextLarge : styles.extractedText,
                  { color: theme.text }
                ]}
                numberOfLines={showFullText ? undefined : (IS_LARGE_SCREEN ? 5 : 3)}
              >
                {page.edited_text || page.extracted_text || ''}
              </Text>
              {page.edited_text && (
                <View style={styles.editedBadge}>
                  <Icon name={IS_LARGE_SCREEN ? "check-circle" : "check-circle"} size={IS_LARGE_SCREEN ? 12 : 10} color={theme.success} />
                  <Text style={[IS_LARGE_SCREEN ? styles.editedTextLarge : styles.editedTextSmall, { color: theme.success }]}>Edited</Text>
                </View>
              )}
              {((page.edited_text || page.extracted_text || '').length > 100) && (
                <Text style={[IS_LARGE_SCREEN ? styles.expandTextLarge : styles.expandText, { color: theme.primary }]}>
                  {showFullText ? (IS_WEB ? 'Click to collapse' : 'Tap to collapse') : (IS_WEB ? 'Click to expand' : 'Tap to expand')}
                </Text>
              )}
            </Pressable>
            {(page.ai_confidence !== null && page.ai_confidence !== undefined) && (
              <Text style={[styles.confidenceText, { color: theme.textTertiary }]}>
                Confidence: {Math.round(page.ai_confidence * 100)}%
              </Text>
            )}
          </View>
        ) : (
          <Pressable
            style={[
              styles.processButton,
              { 
                backgroundColor: (isProcessing || isBatchProcessing) ? theme.textTertiary : theme.primary,
                opacity: (isProcessing || isBatchProcessing) ? 0.6 : 1
              }
            ]}
            onPress={handleProcessAI}
            disabled={isProcessing || isBatchProcessing || !onProcessAI}
          >
            <MaterialIcons 
              name={(isProcessing || isBatchProcessing) ? "hourglass-empty" : "auto-awesome"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.processButtonText}>
              {isBatchProcessing ? 'Batch Processing...' : (isProcessing ? 'Processing...' : 'Process with AI')}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    flex: 1,
    margin: 6,
    minHeight: 280,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewIconContainer: {
    marginLeft: 8,
  },
  deletePageButton: {
    padding: 4,
  },
  aiSection: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  extractedTextContainer: {
    flex: 1,
  },
  extractedTextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  extractedTextLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  textPressableArea: {
    paddingVertical: 4,
  },
  editedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  editedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  extractedText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  extractedTextLarge: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  editedTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  editedTextLarge: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  expandTextLarge: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  processButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 