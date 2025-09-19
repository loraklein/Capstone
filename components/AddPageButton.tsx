import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AddPageButtonProps {
  onPress: () => void;
  isCapturing: boolean;
}

export default function AddPageButton({ onPress, isCapturing }: AddPageButtonProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.addPageButton,
          {
            backgroundColor: theme.primary,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.8 : 1,
          }
        ]}
        onPress={onPress}
        disabled={isCapturing}
      >
        <MaterialIcons 
          name={isCapturing ? "hourglass-empty" : "add-a-photo"} 
          size={20} 
          color="white" 
        />
        <Text style={[styles.addPageButtonText, { color: "white" }]}>
          {isCapturing ? 'Capturing...' : 'Add Page'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  addPageButton: {
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPageButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
}); 