import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { CapturedPage } from '../types';
import { projectService } from '../utils/projectService';

interface RecentPage extends CapturedPage {
  projectId: string;
  projectName: string;
  projectDescription: string;
}

export function useRecentPages() {
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecentPages = useCallback(async (limit: number = 30) => {
    try {
      setIsLoading(true);
      
      const projects = await projectService.getAllProjects();
      
      const allPages: RecentPage[] = [];
      
      for (const project of projects) {
        try {
          const storedPages = await AsyncStorage.getItem(`project_pages_${project.id}`);
          if (storedPages) {
            const pages = JSON.parse(storedPages);
            const pagesWithDates = pages.map((page: any) => ({
              ...page,
              timestamp: new Date(page.timestamp),
              projectId: project.id,
              projectName: project.name,
              projectDescription: project.description,
            }));
            
            allPages.push(...pagesWithDates);
          }
        } catch (error) {
          console.log(`Error loading pages for project ${project.id}:`, error);
        }
      }
      
      // Sort by timestamp (most recent first) and limit
      const sortedPages = allPages
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
      
      setRecentPages(sortedPages);
    } catch (error) {
      console.log('Error loading recent pages:', error);
      setRecentPages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshRecentPages = useCallback(async (limit: number = 30) => {
    await loadRecentPages(limit);
  }, [loadRecentPages]);

  return {
    recentPages,
    isLoading,
    loadRecentPages,
    refreshRecentPages,
  };
} 