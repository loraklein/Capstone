import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface AccessRestrictedModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AccessRestrictedModal({
  visible,
  onClose,
}: AccessRestrictedModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay || 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.dialog, { backgroundColor: theme.card || theme.surface }]}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Icon name="lock" size={32} color={theme.primary} />
            </View>
            
            <Text style={[styles.title, { color: theme.text }]}>
              Access Restricted
            </Text>
            
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              This application is currently in portfolio mode. Special permission is required to create an account and use the service.
            </Text>
            
            <Text style={[styles.contactMessage, { color: theme.textSecondary }]}>
              Please contact the owner for more information.
            </Text>
          </View>
          
          <View style={[styles.buttonContainer, { borderTopColor: theme.divider }]}>
            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.primary },
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>
                Understood
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
    maxWidth: 400,
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  contactMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
