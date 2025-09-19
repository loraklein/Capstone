import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface DeletePageModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeletePageModal({ visible, onConfirm, onCancel }: DeletePageModalProps) {
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
          <Text style={[styles.modalTitle, { color: theme.text }]}>Delete Page</Text>
          <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
            Are you sure you want to delete this page? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={onCancel}
            >
              <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
            
            <Pressable
              style={[styles.modalButton, styles.deleteButton, { backgroundColor: theme.error + '20' }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { color: theme.error }]}>Delete</Text>
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
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
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
  deleteButton: {
    borderRadius: 8,
    padding: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 