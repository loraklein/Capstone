import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface FormButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  isValidForm: boolean;
  isSaving: boolean;
  saveButtonText: string;
  cancelButtonText?: string;
  isKeyboardVisible?: boolean;
}

export default function FormButtons({
  onCancel,
  onSave,
  isValidForm,
  isSaving,
  saveButtonText,
  cancelButtonText = 'Cancel',
  isKeyboardVisible = false,
}: FormButtonsProps) {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.buttonContainer, 
      { 
        backgroundColor: theme.surface, 
        borderTopColor: theme.divider 
      }, 
      isKeyboardVisible && styles.buttonContainerKeyboard
    ]}>
      <Pressable 
        style={[styles.cancelButton, { 
          borderColor: theme.border, 
          backgroundColor: theme.surface 
        }]} 
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel and go back"
      >
        <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
          {cancelButtonText}
        </Text>
      </Pressable>
      
      <Pressable 
        style={[
          styles.saveButton, 
          { backgroundColor: theme.primary },
          !isValidForm && [styles.saveButtonDisabled, { 
            backgroundColor: theme.background, 
            borderColor: theme.border 
          }]
        ]} 
        onPress={onSave}
        disabled={!isValidForm || isSaving}
        accessibilityRole="button"
        accessibilityLabel="Save changes"
      >
        <MaterialIcons 
          name="check" 
          size={20} 
          color={isValidForm ? theme.primaryText : theme.textTertiary} 
        />
        <Text style={[
          styles.saveButtonText, 
          { color: theme.primaryText },
          !isValidForm && { color: theme.textTertiary }
        ]}>
          {saveButtonText}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  buttonContainerKeyboard: {
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 