import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CapturedPage } from '../types';

interface PagePhotoProps {
  page: CapturedPage;
  height?: number;
}

export default function PagePhoto({ page, height = 120 }: PagePhotoProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.pageContent}>
      {page.photoUri ? (
        <View style={[styles.photoContainer, { height }]}>
          <Image
            source={{ uri: page.photoUri }}
            style={[
              styles.photoThumbnail,
              { transform: [{ rotate: `${page.rotation || 0}deg` }] }
            ]}
            resizeMode="cover"
          />
          <View style={styles.photoOverlay}>
            <MaterialIcons name="photo" size={24} color="white" />
          </View>
        </View>
      ) : (
        <View style={[styles.photoPlaceholder, { height }]}>
          <MaterialIcons name="camera-alt" size={32} color={theme.textTertiary} />
          <Text style={[styles.photoText, { color: theme.textTertiary }]}>No photo</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    padding: 6,
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  photoText: {
    fontSize: 12,
    marginTop: 8,
  },
  photoContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 