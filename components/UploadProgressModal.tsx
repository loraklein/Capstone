import React from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { UploadProgress } from '../hooks/useCameraManagement';

interface UploadProgressModalProps {
  progress: UploadProgress | null;
}

export default function UploadProgressModal({ progress }: UploadProgressModalProps) {
  const { theme } = useTheme();

  if (!progress) return null;

  const percentage = Math.round((progress.current / progress.total) * 100);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>
            Uploading Photos
          </Text>
          <Text style={[styles.progress, { color: theme.textSecondary }]}>
            {progress.current} of {progress.total}
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.primary, width: `${percentage}%` }
              ]}
            />
          </View>
          <Text style={[styles.percentage, { color: theme.textSecondary }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  progress: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
  },
});
