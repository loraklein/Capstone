import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface WebFeaturesBannerProps {
  onLearnMore: () => void;
  onDismiss: () => void;
}

export default function WebFeaturesBanner({ onLearnMore, onDismiss }: WebFeaturesBannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: theme.primary }]}>
      <View style={styles.iconContainer}>
        <Icon name="web" size={24} color={theme.primaryText} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Design Mode Available!
        </Text>
        <Text style={[styles.message, { color: theme.primaryText, opacity: 0.9 }]}>
          Open in a web browser to design custom covers and format your book professionally
        </Text>
        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primaryText }]}
            onPress={onLearnMore}
          >
            <Text style={[styles.buttonText, { color: theme.primary }]}>Learn More</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.dismissButton]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    padding: 16,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
