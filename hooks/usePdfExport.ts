import { useMemo } from 'react';
import { Alert } from 'react-native';
import { CapturedPage } from '../types';

interface UsePdfExportProps {
  projectName: string;
  description: string;
  capturedPages: CapturedPage[];
  generatePdf: (projectName: string, description: string, pages: CapturedPage[]) => Promise<void>;
}

export function usePdfExport({ projectName, description, capturedPages, generatePdf }: UsePdfExportProps) {
  const hasPagesWithPhotos = useMemo(() => {
    return capturedPages.some(page => page.photoUri);
  }, [capturedPages]);

  const handleExportPdf = async () => {
    try {
      await generatePdf(projectName, description, capturedPages);
    } catch (error) {
      console.error('PDF export failed:', error);
      Alert.alert('Export Failed', 'Failed to generate PDF. Please try again.');
    }
  };

  return {
    hasPagesWithPhotos,
    handleExportPdf,
  };
} 