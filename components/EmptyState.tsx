import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  onPress: () => void;
}

export default function EmptyState({ onPress }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.emptyState,
        {
          borderColor: theme.divider,
          backgroundColor: pressed ? theme.surface : 'transparent',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        }
      ]}
      onPress={onPress}
      accessibilityLabel="Add your first page"
      accessibilityHint="Tap to capture your first document page"
    >
      <MaterialIcons name="camera-alt" size={80} color={theme.primary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Ready to Scan</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Tap here to capture your first page
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 120,
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 280,
  },
}); 