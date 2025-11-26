import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/apiService';
import { CapturedPage } from '../types';
import { Buffer } from 'buffer';
import { PdfSettings } from '../components/CustomPdfSettingsModal';
import { BookSettings } from '../components/BookExportSettingsModal';

interface PdfGenerationOptions {
  customPdfSettings?: PdfSettings;
  bookSettings?: BookSettings;
}

interface UsePdfGenerationReturn {
  isGenerating: boolean;
  generatePdf: (projectName: string, description: string, pages: CapturedPage[], options?: PdfGenerationOptions) => Promise<void>;
}

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'project';

export default function usePdfGeneration(projectId: string): UsePdfGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const { getAccessToken } = useAuth();

  const generatePdf = async (projectName: string, _description: string, pages: CapturedPage[], options?: PdfGenerationOptions) => {
    if (pages.length === 0) {
      throw new Error('No pages available to export.');
    }
    if (!projectId) {
      throw new Error('Missing project ID for PDF export.');
    }

    setIsGenerating(true);

    try {
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          console.log('Haptics impact failed', error);
        }
      }

      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error('You must be signed in to export this project.');
      }

      const baseUrl = apiService.getBaseURL();

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options?.customPdfSettings) {
        queryParams.append('customPdfSettings', JSON.stringify(options.customPdfSettings));
      }
      if (options?.bookSettings) {
        queryParams.append('bookSettings', JSON.stringify(options.bookSettings));
      }

      const downloadUrl = `${baseUrl}/projects/${projectId}/export/book/pdf${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const fileName = `${sanitizeFileName(projectName)}-book.pdf`;

      if (Platform.OS === 'web') {
        const response = await fetch(downloadUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await fetch(downloadUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
        }
        const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

        if (!baseDir) {
          throw new Error('File storage is not available on this device.');
        }

        const filePath = `${baseDir}${fileName}`;
        let fileUri: string | null = null;

        try {
          const { uri } = await FileSystem.downloadAsync(downloadUrl, filePath, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/pdf',
            },
          });
          fileUri = uri;
        } catch (downloadError) {
          console.log('Direct download failed, attempting manual write', downloadError);

          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/pdf',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
          }

          const base64 = Buffer.from(await response.arrayBuffer()).toString('base64');
          await FileSystem.writeAsStringAsync(filePath, base64, { encoding: 'base64' });
          fileUri = filePath;
        }

        if (!fileUri) {
          throw new Error('Failed to save PDF to device.');
        }

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share ${projectName}`,
          });
        } else {
          Alert.alert('PDF Ready', `Saved to: ${fileUri}`);
        }
      }

      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.log('Haptics success failed', error);
        }
      }
    } catch (error) {
      console.error('PDF export failed', error);
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (hError) {
          console.log('Haptics error feedback failed', hError);
        }
      }
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePdf,
  };
}
