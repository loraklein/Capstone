import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface ReviewProgressBarProps {
  total: number;
  reviewed: number;
  needsAttention: number;
  unreviewed: number;
  percentComplete: number;
  onFilterChange?: (filter: 'all' | 'unreviewed' | 'needs_attention' | 'reviewed') => void;
  currentFilter?: 'all' | 'unreviewed' | 'needs_attention' | 'reviewed';
}

export default function ReviewProgressBar({
  total,
  reviewed,
  needsAttention,
  unreviewed,
  percentComplete,
  onFilterChange,
  currentFilter = 'all'
}: ReviewProgressBarProps) {
  const { theme } = useTheme();

  if (total === 0) return null;

  const successColor = theme.success || '#4CAF50';
  const warningColor = theme.warning || '#FF9800';
  const textTertiary = theme.textTertiary;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Progress Text */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Review Progress
        </Text>
        <Text style={[styles.percentage, { color: theme.primary }]}>
          {percentComplete}% Complete
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: successColor,
              width: `${percentComplete}%`
            }
          ]}
        />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={[styles.statText, { color: theme.textSecondary }]}>
          {reviewed}/{total} pages reviewed
        </Text>
        {needsAttention > 0 && (
          <Text style={[styles.warningText, { color: warningColor }]}>
            {needsAttention} need attention
          </Text>
        )}
      </View>

      {/* Filter Buttons */}
      {onFilterChange && (
        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'all' && { backgroundColor: theme.primary },
              { borderColor: theme.border }
            ]}
            onPress={() => onFilterChange('all')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: currentFilter === 'all' ? theme.primaryText : theme.text }
            ]}>
              All ({total})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'unreviewed' && { backgroundColor: textTertiary },
              { borderColor: theme.border }
            ]}
            onPress={() => onFilterChange('unreviewed')}
          >
            <Icon
              name="fiber-manual-record"
              size={14}
              color={currentFilter === 'unreviewed' ? 'white' : textTertiary}
            />
            <Text style={[
              styles.filterButtonText,
              { color: currentFilter === 'unreviewed' ? 'white' : theme.text }
            ]}>
              Unreviewed ({unreviewed})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'needs_attention' && { backgroundColor: warningColor },
              { borderColor: theme.border }
            ]}
            onPress={() => onFilterChange('needs_attention')}
          >
            <Icon
              name="warning"
              size={14}
              color={currentFilter === 'needs_attention' ? 'white' : warningColor}
            />
            <Text style={[
              styles.filterButtonText,
              { color: currentFilter === 'needs_attention' ? 'white' : theme.text }
            ]}>
              Needs Review ({needsAttention})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'reviewed' && { backgroundColor: successColor },
              { borderColor: theme.border }
            ]}
            onPress={() => onFilterChange('reviewed')}
          >
            <Icon
              name="check-circle"
              size={14}
              color={currentFilter === 'reviewed' ? 'white' : successColor}
            />
            <Text style={[
              styles.filterButtonText,
              { color: currentFilter === 'reviewed' ? 'white' : theme.text }
            ]}>
              Reviewed ({reviewed})
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    fontSize: 13,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
