import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';
import PagePhoto from './PagePhoto';

interface PageCardProps {
  page: CapturedPage;
  onView: (page: CapturedPage) => void;
  onDelete: (pageId: string) => void;
  onProcessAI?: (pageId: string) => Promise<void>;
  isBatchProcessing?: boolean;
}

export default function PageCard({ page, onView, onDelete, onProcessAI, isBatchProcessing = false }: PageCardProps) {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const handleView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onView(page);
  };

  const handleTextPress = () => {
    if (page.extracted_text) {
      setShowFullText(!showFullText);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete(page.id);
  };

  const handleProcessAI = async () => {
    if (!onProcessAI || isProcessing) return;
    
    setIsProcessing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onProcessAI(page.id);
    } catch (error) {
      console.log('Error processing page with AI:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getProcessingStatus = () => {
    if (isProcessing || (isBatchProcessing && !page.extracted_text)) return 'processing';
    return page.processing_status || 'pending';
  };

  const getStatusColor = () => {
    const status = getProcessingStatus();
    switch (status) {
      case 'completed': return theme.success || '#4CAF50';
      case 'processing': return theme.warning || '#FF9800';
      case 'failed': return theme.error;
      default: return theme.textTertiary;
    }
  };

  const getStatusIcon = () => {
    const status = getProcessingStatus();
    switch (status) {
      case 'completed': return 'check-circle';
      case 'processing': return 'hourglass-empty';
      case 'failed': return 'error';
      default: return 'radio-button-unchecked';
    }
  };

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
          <View style={styles.statusIndicator}>
            <MaterialIcons 
              name={getStatusIcon()} 
              size={12} 
              color={getStatusColor()} 
            />
          </View>
        </View>
        <Pressable
          style={styles.deletePageButton}
          onPress={handleDelete}
          accessibilityLabel="Delete page"
        >
          <MaterialIcons name="delete" size={16} color={theme.error} />
        </Pressable>
      </View>
      
      <PagePhoto page={page} height={120} />
      
      {/* AI Processing Section */}
      <View style={[styles.aiSection, { backgroundColor: theme.surface }]}>
        {page.extracted_text ? (
          <View style={styles.extractedTextContainer}>
            <Text style={[styles.extractedTextLabel, { color: theme.textSecondary }]}>
              Extracted Text:
            </Text>
            <Pressable 
              onPress={handleTextPress}
              style={styles.textPressableArea}
            >
              <Text 
                style={[styles.extractedText, { color: theme.text }]} 
                numberOfLines={showFullText ? undefined : 3}
              >
                {page.extracted_text}
              </Text>
              {page.extracted_text.length > 100 && (
                <Text style={[styles.expandText, { color: theme.primary }]}>
                  {showFullText ? 'Tap to collapse' : 'Tap to expand'}
                </Text>
              )}
            </Pressable>
            {page.ai_confidence && (
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
  statusIndicator: {
    marginLeft: 6,
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
  textPressableArea: {
    paddingVertical: 4,
  },
  extractedTextLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  extractedText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  expandText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
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