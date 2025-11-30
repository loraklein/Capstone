import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseCameraManagementProps {
  addPage: (photoUri: string) => Promise<number>;
}

interface UploadProgress {
  current: number;
  total: number;
}

export function useCameraManagement({ addPage }: UseCameraManagementProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const handleAddPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCamera(true);
  };

  const handleCameraCapture = async (photoUri: string | string[]) => {
    try {
      // Close the photo selector immediately
      setShowCamera(false);

      // Handle both single and multiple image uploads
      if (Array.isArray(photoUri)) {
        // Multiple images: upload sequentially with progress tracking
        const total = photoUri.length;
        console.log(`Uploading ${total} images...`);

        for (let i = 0; i < total; i++) {
          setUploadProgress({ current: i + 1, total });
          await addPage(photoUri[i]);
          console.log(`Uploaded ${i + 1}/${total}`);
        }

        setUploadProgress(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Single image - upload silently without progress modal
        await addPage(photoUri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error adding page:', error);
      setUploadProgress(null);
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
    uploadProgress,
  };
}

export type { UploadProgress }; 