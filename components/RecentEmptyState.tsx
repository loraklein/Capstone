import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function RecentEmptyState() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Icon name="history" size={80} color={theme.primary} />
      <Text style={[styles.title, { color: theme.text }]}>No Recent Pages</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Start scanning pages to see them here
      </Text>
      <Text style={[styles.description, { color: theme.textTertiary }]}>
        Your recently scanned pages will appear here for quick access across all your projects.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
}); 