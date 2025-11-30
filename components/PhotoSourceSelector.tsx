import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import CameraCapture from './CameraCapture';

interface PhotoSourceSelectorProps {
  visible: boolean;
  onCapture: (uri: string | string[]) => void;
  onClose: () => void;
}

export default function PhotoSourceSelector({ visible, onCapture, onClose }: PhotoSourceSelectorProps) {
  const { theme } = useTheme();
  const [showCamera, setShowCamera] = useState(false);

  // Helper function to convert image to JPEG format
  const convertToJPEG = async (uri: string): Promise<string> => {
    try {
      // Use ImageManipulator to convert to JPEG (also handles HEIC)
      // We don't need to resize, just convert format
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [], // No transformations needed
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error converting image to JPEG:', error);
      // If conversion fails, return original URI as fallback
      return uri;
    }
  };

  const handleCameraPress = () => {
    setShowCamera(true);
  };

  const handleUploadPress = async () => {
    try {
      // Request permissions for image picker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker with multiple selection enabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        exif: false, // Reduce overhead
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Convert all images to JPEG format (handles HEIC from iPhone camera roll)
        const convertedUris = await Promise.all(
          result.assets.map(asset => convertToJPEG(asset.uri))
        );

        // If multiple images selected, pass array of URIs
        // If single image, pass single URI string
        onCapture(convertedUris.length === 1 ? convertedUris[0] : convertedUris);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCameraCapture = (uri: string) => {
    setShowCamera(false);
    onCapture(uri);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  // If camera is showing, render the camera component
  if (showCamera) {
    return (
      <CameraCapture
        visible={true}
        onCapture={handleCameraCapture}
        onClose={handleCameraClose}
      />
    );
  }

  // Otherwise, show the source selector
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Add Photo</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose how you'd like to add photos to your project
          </Text>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.optionButton, { backgroundColor: theme.primary }]}
              onPress={handleCameraPress}
            >
              <View style={styles.iconCircle}>
                <Icon name="photo-camera" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: theme.primaryText }]}>
                Take Photo
              </Text>
              <Text style={[styles.optionDescription, { color: theme.primaryText, opacity: 0.8 }]}>
                Use your camera to capture a new page
              </Text>
            </Pressable>

            <Pressable
              style={[styles.optionButton, { backgroundColor: theme.secondary }]}
              onPress={handleUploadPress}
            >
              <View style={styles.iconCircle}>
                <Icon name="photo-library" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Upload Photos
              </Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                Choose one or more photos from your library
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 16,
  },
  optionButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});
