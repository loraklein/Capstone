import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmStyle?: 'default' | 'destructive';
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmStyle = 'default',
}: ConfirmationDialogProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: theme.card }]}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          </View>
          
          <View style={[styles.buttonContainer, { borderTopColor: theme.divider }]}>
            <Pressable
              style={[styles.button, styles.cancelButton, { borderRightColor: theme.divider }]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>{cancelText}</Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                { borderLeftColor: theme.divider },
                confirmStyle === 'destructive' && { backgroundColor: theme.error + '20' },
              ]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
            >
              <Text style={[
                styles.confirmButtonText,
                { color: confirmStyle === 'destructive' ? theme.error : theme.primary },
              ]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    padding: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRightWidth: 0.5,
  },
  confirmButton: {
    borderLeftWidth: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 