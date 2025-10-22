import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface ExportPdfButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  style?: any;
}

export default function ExportPdfButton({ 
  onPress, 
  disabled = false, 
  isGenerating = false,
  style 
}: ExportPdfButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable 
      style={[
        styles.exportButton,
        { backgroundColor: 'transparent' },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Export project as PDF"
    >
      <Icon 
        name={isGenerating ? "hourglass-empty" : "picture-as-pdf"} 
        size={16} 
        color={isGenerating ? theme.textSecondary : theme.primary} 
      />
      <Text style={[
        styles.exportButtonText, 
        { color: isGenerating ? theme.textSecondary : theme.primary }
      ]}>
        {isGenerating ? "Generating..." : "Export PDF"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 