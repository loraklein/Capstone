import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';
import PagePhoto from './PagePhoto';

interface PageCardProps {
  page: CapturedPage;
  onView: (page: CapturedPage) => void;
  onDelete: (pageId: string) => void;
}

export default function PageCard({ page, onView, onDelete }: PageCardProps) {
  const { theme } = useTheme();

  const handleView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onView(page);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete(page.id);
  };

  return (
    <Pressable
      style={[styles.pageCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={handleView}
    >
      <View style={[styles.pageHeader, { backgroundColor: theme.card }]}>
        <Text style={[styles.pageNumber, { color: theme.text }]}>
          {formatDate(page.timestamp)}
        </Text>
        <Pressable
          style={styles.deletePageButton}
          onPress={handleDelete}
          accessibilityLabel="Delete page"
        >
          <MaterialIcons name="delete" size={16} color={theme.error} />
        </Pressable>
      </View>
      
      <PagePhoto page={page} height={180} />
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
    minHeight: 180,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  deletePageButton: {
    padding: 4,
  },
}); 