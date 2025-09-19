import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  position?: 'top-right' | 'bottom-right';
  label?: string;
}

export default function FloatingActionButton({ 
  onPress, 
  icon, 
  position = 'bottom-right',
  label
}: FloatingActionButtonProps) {
  const { theme } = useTheme();

  const containerStyle = [
    styles.fabContainer,
    position === 'top-right' ? styles.topRight : styles.bottomRight
  ];

  return (
    <View style={containerStyle}>
      <Pressable 
        style={({ pressed }) => [
          styles.fab, 
          {
            backgroundColor: theme.primary,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            shadowColor: theme.primary,
            shadowOpacity: pressed ? 0.3 : 0.2,
          }
        ]} 
        onPress={onPress}
      >
        <MaterialIcons name={icon} size={20} color="white" />
        {label && (
          <Text style={[styles.fabLabel, { color: 'white' }]}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    zIndex: 1003,
  },
  topRight: {
    top: 20,
    right: 20,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 8,
    minWidth: 56,
    minHeight: 56,
  },
  fabLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 