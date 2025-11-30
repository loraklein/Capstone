import { useState } from 'react';

interface UseDeleteConfirmationProps {
  deletePage: (pageId: string) => Promise<number>;
  refreshProjects: () => void;
}

export function useDeleteConfirmation({ deletePage, refreshProjects }: UseDeleteConfirmationProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePage = (pageId: string) => {
    setPageToDelete(pageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (pageToDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        await deletePage(pageToDelete);
        await refreshProjects();
        setShowDeleteModal(false);
        setPageToDelete(null);
      } catch (error) {
        console.error('Error deleting page:', error);
        // Keep modal open on error so user can try again
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setPageToDelete(null);
    }
  };

  return {
    showDeleteModal,
    pageToDelete,
    handleDeletePage,
    confirmDelete,
    cancelDelete,
    isDeleting,
  };
} 