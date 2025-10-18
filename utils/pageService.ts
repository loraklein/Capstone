import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { apiService } from './apiService';
import { supabaseService } from './supabaseService';

export interface CapturedPage {
  id: string;
  projectId: string;
  pageNumber: number;
  photoUri: string;
  rotation: number;
  timestamp: Date;
  // Backend fields
  photo_url?: string;
  extracted_text?: string;
  edited_text?: string;
  ai_annotations?: any[];
  ai_processed_at?: string;
  ai_confidence?: number;
  ai_provider?: string;
  processing_status?: string;
  created_at?: string;
}

export interface AddPageData {
  photoUri: string;
  rotation?: number;
}

class PageService {
  private readonly STORAGE_KEY_PREFIX = 'project_pages_';

  async getProjectPages(projectId: string): Promise<CapturedPage[]> {
    try {
      // Try to get pages from backend first
      const backendPages = await apiService.getPages(projectId);
      
      // Transform backend data to match frontend interface
      const pages = backendPages.map((page: any) => ({
        id: page.id,
        projectId: page.project_id,
        pageNumber: page.page_number,
        photoUri: page.photo_url,
        rotation: page.rotation || 0,
        timestamp: new Date(page.created_at),
        photo_url: page.photo_url,
        extracted_text: page.extracted_text,
        edited_text: page.edited_text,
        ai_annotations: page.ai_annotations,
        ai_processed_at: page.ai_processed_at,
        ai_confidence: page.ai_confidence,
        ai_provider: page.ai_provider,
        processing_status: page.processing_status,
        created_at: page.created_at,
      }));

      return pages;
    } catch (error) {
      console.log('Error loading pages from backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const storedPages = await AsyncStorage.getItem(`${this.STORAGE_KEY_PREFIX}${projectId}`);
      if (storedPages) {
        const pages = JSON.parse(storedPages);
        return pages.map((page: any) => ({
          ...page,
          timestamp: new Date(page.timestamp)
        }));
      }
      return [];
    }
  }

  async addPage(projectId: string, data: AddPageData): Promise<CapturedPage> {
    try {
      // Upload image to Supabase Storage
      const imageUrl = await supabaseService.uploadImage(
        data.photoUri,
        `page_${Date.now()}.jpg`,
        '39fcd9b8-7c1b-41b1-8980-931a616ead82' // Temporary test user ID
      );

      // Create page in backend
      const backendPage = await apiService.addPage(
        projectId,
        imageUrl,
        data.rotation || 0
      );

      // Transform backend data to match frontend interface
      const newPage: CapturedPage = {
        id: backendPage.id,
        projectId: backendPage.project_id,
        pageNumber: backendPage.page_number,
        photoUri: backendPage.photo_url,
        rotation: backendPage.rotation || 0,
        timestamp: new Date(backendPage.created_at),
        photo_url: backendPage.photo_url,
        extracted_text: backendPage.extracted_text,
        ai_processed_at: backendPage.ai_processed_at,
        ai_confidence: backendPage.ai_confidence,
        ai_provider: backendPage.ai_provider,
        processing_status: backendPage.processing_status,
        created_at: backendPage.created_at,
      };

      return newPage;
    } catch (error) {
      console.log('Error adding page to backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const pages = await this.getProjectPages(projectId);
      const newPage: CapturedPage = {
        id: Date.now().toString(),
        projectId,
        pageNumber: pages.length + 1,
        photoUri: data.photoUri,
        rotation: data.rotation || 0,
        timestamp: new Date(),
      };

      const updatedPages = [...pages, newPage];
      await this.saveProjectPages(projectId, updatedPages);

      return newPage;
    }
  }

  async updatePage(pageId: string, updates: { rotation?: number }): Promise<CapturedPage> {
    try {
      // Update page in backend
      const backendPage = await apiService.updatePage(pageId, updates);

      // Transform backend data to match frontend interface
      const updatedPage: CapturedPage = {
        id: backendPage.id,
        projectId: backendPage.project_id,
        pageNumber: backendPage.page_number,
        photoUri: backendPage.photo_url,
        rotation: backendPage.rotation || 0,
        timestamp: new Date(backendPage.created_at),
        photo_url: backendPage.photo_url,
        extracted_text: backendPage.extracted_text,
        ai_processed_at: backendPage.ai_processed_at,
        ai_confidence: backendPage.ai_confidence,
        ai_provider: backendPage.ai_provider,
        processing_status: backendPage.processing_status,
        created_at: backendPage.created_at,
      };

      return updatedPage;
    } catch (error) {
      console.log('Error updating page in backend:', error);
      throw error;
    }
  }

  async deletePage(pageId: string, projectId: string): Promise<void> {
    try {
      // Get page details first to delete image from storage
      const page = await apiService.getPage(pageId);
      
      // Delete page from backend (this will also handle image deletion)
      await apiService.deletePage(pageId);
      
      // Delete image from Supabase Storage
      if (page.photo_url) {
        await supabaseService.deleteImage(page.photo_url);
      }
    } catch (error) {
      console.log('Error deleting page from backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const pages = await this.getProjectPages(projectId);
      const pageToDelete = pages.find(p => p.id === pageId);
      
      if (pageToDelete) {
        // Delete the actual image file from device storage
        if (pageToDelete.photoUri && pageToDelete.photoUri.startsWith('file://')) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(pageToDelete.photoUri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(pageToDelete.photoUri);
            }
          } catch (error) {
            console.log('Error deleting image file:', error);
          }
        }

        // Remove page from local storage
        const updatedPages = pages.filter(p => p.id !== pageId);
        await this.saveProjectPages(projectId, updatedPages);
      }
    }
  }

  async processPageWithAI(pageId: string, provider: string = 'google_vision'): Promise<any> {
    try {
      return await apiService.processPageWithAI(pageId, provider);
    } catch (error) {
      console.log('Error processing page with AI:', error);
      throw error;
    }
  }

  async getPageText(pageId: string): Promise<any> {
    try {
      return await apiService.getPageText(pageId);
    } catch (error) {
      console.log('Error getting page text:', error);
      throw error;
    }
  }

  async batchProcessProject(projectId: string, provider: string = 'google_vision'): Promise<any> {
    try {
      return await apiService.batchProcessProject(projectId, provider);
    } catch (error) {
      console.log('Error batch processing project:', error);
      throw error;
    }
  }

  private async saveProjectPages(projectId: string, pages: CapturedPage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.STORAGE_KEY_PREFIX}${projectId}`, JSON.stringify(pages));
    } catch (error) {
      console.log('Error saving pages:', error);
    }
  }
}

export const pageService = new PageService();
