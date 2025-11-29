import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';
import PagePhoto from './PagePhoto';

const IS_WEB = Platform.OS === 'web';

interface DraggablePageCardProps {
  page: CapturedPage;
  drag: () => void;
  isActive: boolean;
  onView: (page: CapturedPage) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function DraggablePageCard({
  page,
  drag,
  isActive,
  onView,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: DraggablePageCardProps) {
  const { theme } = useTheme();

  const handleView = () => {
    if (!isActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onView(page);
    }
  };

  const handleMoveUp = () => {
    if (onMoveUp && !isFirst) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoveUp();
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown && !isLast) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoveDown();
    }
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    drag();
  };

  return (
    <Pressable
      style={[
        styles.pageCard, 
        { 
          backgroundColor: isActive ? theme.primary : theme.card, 
          borderColor: theme.border,
          opacity: isActive ? 0.8 : 1,
          transform: [{ scale: isActive ? 1.02 : 1 }],
        }
      ]}
      onPress={handleView}
      onLongPress={handleLongPress}
      delayLongPress={300}
    >
      <View style={[styles.pageHeader, { backgroundColor: isActive ? theme.primary : theme.card }]}>
        <View style={styles.pageInfo}>
          <Text style={[styles.pageNumber, { color: isActive ? 'white' : theme.text }]}>
            Page {page.pageNumber}
          </Text>
          <Text style={[styles.timestamp, { color: isActive ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
            {formatDate(page.timestamp)}
          </Text>
        </View>
        
        {!isActive && (
          <View style={styles.controls}>
            {IS_WEB ? (
              <View style={styles.webControls}>
                <Pressable
                  style={[styles.arrowButton, isFirst && styles.arrowButtonDisabled]}
                  onPress={handleMoveUp}
                  disabled={isFirst}
                >
                  <Icon name="arrow-upward" size={20} color={isFirst ? theme.border : theme.textTertiary} />
                </Pressable>
                <Pressable
                  style={[styles.arrowButton, isLast && styles.arrowButtonDisabled]}
                  onPress={handleMoveDown}
                  disabled={isLast}
                >
                  <Icon name="arrow-downward" size={20} color={isLast ? theme.border : theme.textTertiary} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.reorderIcon}>
                <Icon name="drag-handle" size={24} color={theme.textTertiary} />
              </View>
            )}
          </View>
        )}

        {isActive && (
          <View style={styles.dragIndicator}>
            <Icon name="drag-handle" size={20} color="white" />
          </View>
        )}
      </View>
      
      <PagePhoto page={page} height={80} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    margin: 6,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  pageInfo: {
    flex: 1,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webControls: {
    flexDirection: 'column',
    gap: 4,
  },
  arrowButton: {
    padding: 4,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  deleteButton: {
    padding: 4,
  },
  dragIndicator: {
    padding: 4,
  },
  reorderIcon: {
    padding: 4,
  },
}); 