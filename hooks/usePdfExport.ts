import { useMemo } from 'react';
import { Alert } from 'react-native';
import { CapturedPage } from '../types';

interface UsePdfExportProps {
  projectName: string;
  description: string;
  capturedPages: CapturedPage[];
  generatePdf: (projectName: string, description: string, pages: CapturedPage[], options?: any, onSuccess?: (exportType: 'pdf' | 'book' | 'custom') => void) => Promise<void>;
  onExportSuccess?: (exportType: 'pdf' | 'book' | 'custom') => void;
}

export function usePdfExport({ projectName, description, capturedPages, generatePdf, onExportSuccess }: UsePdfExportProps) {
  const hasContentToExport = useMemo(() => {
    return capturedPages.length > 0;
  }, [capturedPages]);

  const handleExportPdf = async () => {
    try {
      await generatePdf(projectName, description, capturedPages, undefined, onExportSuccess);
    } catch (error) {
      console.error('PDF export failed:', error);
      Alert.alert('Export Failed', 'Failed to generate PDF. Please try again.');
    }
  };

  return {
    hasPagesWithPhotos: hasContentToExport,
    handleExportPdf,
  };
} 