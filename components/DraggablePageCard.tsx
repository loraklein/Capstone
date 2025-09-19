import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';
import PagePhoto from './PagePhoto';

interface DraggablePageCardProps {
  page: CapturedPage;
  drag: () => void;
  isActive: boolean;
  onView: (page: CapturedPage) => void;
}

export default function DraggablePageCard({ 
  page, 
  drag, 
  isActive,
  onView
}: DraggablePageCardProps) {
  const { theme } = useTheme();

  const handleView = () => {
    if (!isActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onView(page);
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
            <View style={styles.reorderIcon}>
              <MaterialIcons name="drag-handle" size={24} color={theme.textTertiary} />
            </View>
          </View>
        )}
        
        {isActive && (
          <View style={styles.dragIndicator}>
            <MaterialIcons name="drag-handle" size={20} color="white" />
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