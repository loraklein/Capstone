import { useState } from 'react';

interface UseDeleteConfirmationProps {
  deletePage: (pageId: string) => Promise<number>;
  refreshProjects: () => void;
}

export function useDeleteConfirmation({ deletePage, refreshProjects }: UseDeleteConfirmationProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const handleDeletePage = (pageId: string) => {
    setPageToDelete(pageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (pageToDelete) {
      await deletePage(pageToDelete);
      await refreshProjects();
    }
    setShowDeleteModal(false);
    setPageToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPageToDelete(null);
  };

  return {
    showDeleteModal,
    pageToDelete,
    handleDeletePage,
    confirmDelete,
    cancelDelete,
  };
} 