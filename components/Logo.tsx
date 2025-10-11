import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import LogoSvg from '../assets/images/logo.svg';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const { theme } = useTheme();
  const colors = theme; // Use same pattern as auth screens
  
  // Size configurations
  const sizes = {
    small: { icon: 50, text: 22 },
    medium: { icon: 65, text: 30 },
    large: { icon: 90, text: 38 },
  };
  
  const currentSize = sizes[size];
  
  return (
    <View style={styles.container}>
      {/* SVG Logo */}
      <View style={{ width: currentSize.icon, height: currentSize.icon, marginBottom: 12 }}>
        <LogoSvg 
          width={currentSize.icon} 
          height={currentSize.icon}
          color={colors.primary}
          fill={colors.primary}
        />
      </View>
      
      {/* App Name */}
      {showText && (
        <Text style={[styles.appName, { fontSize: currentSize.text, color: colors.primary }]}>
          PastForward
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontWeight: 'bold',
  },
  appName: {
    fontFamily: 'Blinker-SemiBold',
    letterSpacing: 0.5,
  },
});

