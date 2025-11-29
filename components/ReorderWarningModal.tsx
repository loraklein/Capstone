import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface ReorderWarningModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReorderWarningModal({ visible, onConfirm, onCancel }: ReorderWarningModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Icon name="warning" size={24} color={theme.warning || '#FF9800'} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Clear Organized Sections?</Text>
          </View>
          <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
            You have organized sections for this project. Reordering pages will clear all sections because the page numbers will change.
          </Text>
          <Text style={[styles.modalHint, { color: theme.textTertiary }]}>
            You can re-run "Organize Sections" after reordering if needed.
          </Text>

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={onCancel}
            >
              <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.warning || '#FF9800' }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { color: 'white' }]}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  modalHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
