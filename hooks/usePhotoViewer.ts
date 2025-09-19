import { useState } from 'react';
import { CapturedPage } from '../types';

export function usePhotoViewer() {
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CapturedPage | null>(null);

  const handleViewPage = (page: CapturedPage) => {
    if (page.photoUri) {
      setSelectedPage(page);
      setShowPhotoViewer(true);
    }
  };

  const handleClosePhotoViewer = () => {
    setShowPhotoViewer(false);
    setSelectedPage(null);
  };

  return {
    showPhotoViewer,
    selectedPage,
    handleViewPage,
    handleClosePhotoViewer,
  };
} 