import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseCameraManagementProps {
  addPage: (photoUri: string) => Promise<number>;
}

export function useCameraManagement({ addPage }: UseCameraManagementProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleAddPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCamera(true);
  };

  const handleCameraCapture = async (photoUri: string) => {
    try {
      await addPage(photoUri);
      setShowCamera(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error adding page:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  return {
    showCamera,
    handleAddPage,
    handleCameraCapture,
    handleCameraClose,
  };
} 