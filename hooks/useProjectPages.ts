import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { CapturedPage } from '../types';
import { projectService } from '../utils/projectService';

export function useProjectPages(projectId: string) {
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjectPages = async () => {
    try {
      setIsLoading(true);
      const storedPages = await AsyncStorage.getItem(`project_pages_${projectId}`);
      if (storedPages) {
        const pages = JSON.parse(storedPages);
        const pagesWithDates = pages.map((page: any) => ({
          ...page,
          timestamp: new Date(page.timestamp)
        }));
        
        const pagesWithCorrectNumbers = pagesWithDates.map((page: any, index: number) => ({
          ...page,
          pageNumber: index + 1
        }));
        
        setCapturedPages(pagesWithCorrectNumbers);
      }
    } catch (error) {
      console.log('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjectPages = async (pages: CapturedPage[]) => {
    try {
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
    const updatedPages = capturedPages.map(page => 
      page.id === pageId ? { ...page, rotation } : page
    );
    setCapturedPages(updatedPages);
    await saveProjectPages(updatedPages);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addPage = async (photoUri: string) => {
    const newPage: CapturedPage = {
      id: Date.now().toString(),
      pageNumber: capturedPages.length + 1,
      timestamp: new Date(),
      photoUri: photoUri,
      rotation: 0,
    };
    
    const updatedPages = [...capturedPages, newPage];
    setCapturedPages(updatedPages);
    await saveProjectPages(updatedPages);
    await updateProjectPageCount(updatedPages.length);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return updatedPages.length;
  };

  const deletePage = async (pageId: string) => {
    const pageToRemove = capturedPages.find(page => page.id === pageId);
    
    // Delete the actual image file from device storage
    if (pageToRemove?.photoUri && pageToRemove.photoUri.startsWith('file://')) {
      try {
        // Check if file exists before trying to delete it
        const fileInfo = await FileSystem.getInfoAsync(pageToRemove.photoUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(pageToRemove.photoUri);
        }
      } catch (error) {
        console.log('Error deleting image file:', error);
      }
    }
    
    const updatedPages = capturedPages.filter(page => page.id !== pageId);
    
    // Update page numbers to reflect new order
    const renumberedPages = updatedPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1
    }));
    
    setCapturedPages(renumberedPages);
    await saveProjectPages(renumberedPages);
    await updateProjectPageCount(renumberedPages.length);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return renumberedPages.length;
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

  return {
    capturedPages,
    isLoading,
    addPage,
    deletePage,
    updatePageRotation,
    reorderPagesWithArray,
    reloadPages: loadProjectPages,
  };
} 