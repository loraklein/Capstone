import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CapturedPage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../utils/projectService';
import { pageService } from '../utils/pageService';

export function useProjectPages(projectId: string) {
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadProjectPages = async () => {
    try {
      setIsLoading(true);
      const pages = await pageService.getProjectPages(projectId);
      setCapturedPages(pages);
    } catch (error) {
      console.log('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjectPages = async (pages: CapturedPage[]) => {
    try {
      // Skip AsyncStorage on web to prevent hydration issues
      if (Platform.OS === 'web') {
        return;
      }
      await AsyncStorage.setItem(`project_pages_${projectId}`, JSON.stringify(pages));
    } catch (error) {
      console.log('Error saving pages:', error);
    }
  };

  const updateProjectPageCount = async (newPageCount: number) => {
    try {
      await projectService.updateProjectPageCount(projectId, newPageCount);
    } catch (error) {
      console.log('Error updating project page count:', error);
    }
  };

  const updatePageRotation = async (pageId: string, rotation: number) => {
    try {
      // Update in database first
      await pageService.updatePage(pageId, { rotation });

      // Then update local state
      const updatedPages = capturedPages.map(page =>
        page.id === pageId ? { ...page, rotation } : page
      );
      setCapturedPages(updatedPages);
      await saveProjectPages(updatedPages);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Error updating page rotation:', error);
      throw error;
    }
  };

  const addPage = async (photoUri: string) => {
    try {
      if (!user?.id) {
        throw new Error('User must be signed in to add pages');
      }
      const newPage = await pageService.addPage(projectId, { photoUri }, user.id);

      // Use functional setState to avoid stale state issues during rapid uploads
      let newLength = 0;
      setCapturedPages(prevPages => {
        const updatedPages = [...prevPages, newPage];
        newLength = updatedPages.length;
        return updatedPages;
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return newLength;
    } catch (error) {
      console.log('Error adding page:', error);
      throw error;
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      await pageService.deletePage(pageId, projectId);
      
      const updatedPages = capturedPages.filter(page => page.id !== pageId);
      setCapturedPages(updatedPages);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return updatedPages.length;
    } catch (error) {
      console.log('Error deleting page:', error);
      throw error;
    }
  };

  const reorderPagesWithArray = async (reorderedPages: CapturedPage[]) => {
    // Update page numbers to reflect new order
    const updatedPages = reorderedPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1
    }));
    
    setCapturedPages(updatedPages);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    saveProjectPages(updatedPages).catch(error => {
      console.log('Error saving reordered pages:', error);
    });
  };

  useEffect(() => {
    loadProjectPages();
  }, [projectId]);

  // AI processing functions
  const processPageWithAI = async (pageId: string, provider: string = 'google_vision') => {
    try {
      const result = await pageService.processPageWithAI(pageId, provider);
      
      // Reload pages to get updated AI data
      await loadProjectPages();
      
      return result;
    } catch (error) {
      console.log('Error processing page with AI:', error);
      throw error;
    }
  };

  const getPageText = async (pageId: string) => {
    try {
      return await pageService.getPageText(pageId);
    } catch (error) {
      console.log('Error getting page text:', error);
      throw error;
    }
  };

  const batchProcessProject = async (provider: string = 'google_vision') => {
    try {
      const result = await pageService.batchProcessProject(projectId, provider);
      
      // Reload pages to get updated AI data
      await loadProjectPages();
      
      return result;
    } catch (error) {
      console.log('Error batch processing project:', error);
      throw error;
    }
  };

  return {
    capturedPages,
    isLoading,
    addPage,
    deletePage,
    updatePageRotation,
    reorderPagesWithArray,
    reloadPages: loadProjectPages,
    // AI functions
    processPageWithAI,
    getPageText,
    batchProcessProject,
  };
} 