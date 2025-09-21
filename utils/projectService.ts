import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { apiService } from './apiService';

export interface Project {
  id: string;
  name: string;
  description: string;
  pageCount: number;
  lockOrientation?: boolean;
  // Backend fields
  title?: string;
  page_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  lockOrientation?: boolean;
}

class ProjectService {
  private readonly STORAGE_KEY = 'projects';

  async getAllProjects(): Promise<Project[]> {
    try {
      // Try to get projects from backend first
      const backendProjects = await apiService.getProjects();
      
      // Transform backend data to match frontend interface
      const projects = backendProjects.map((project: any) => ({
        id: project.id,
        name: project.title,
        description: project.description || '',
        pageCount: project.page_count || 0,
        lockOrientation: false,
        title: project.title,
        page_count: project.page_count,
        created_at: project.created_at,
        updated_at: project.updated_at,
      }));

      return projects;
    } catch (error) {
      console.log('Error loading projects from backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const storedProjects = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedProjects) {
        return JSON.parse(storedProjects);
      }
      return [];
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      // Create project in backend
      const backendProject = await apiService.createProject(
        data.name.trim(),
        data.description?.trim()
      );

      // Transform backend data to match frontend interface
      const newProject: Project = {
        id: backendProject.id,
        name: backendProject.title,
        description: backendProject.description || '',
        pageCount: backendProject.page_count || 0,
        lockOrientation: false,
        title: backendProject.title,
        page_count: backendProject.page_count,
        created_at: backendProject.created_at,
        updated_at: backendProject.updated_at,
      };

      return newProject;
    } catch (error) {
      console.log('Error creating project in backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const newProject: Project = {
        id: Date.now().toString(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        pageCount: 0,
        lockOrientation: false,
      };

      const projects = await this.getAllProjects();
      projects.push(newProject);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      return newProject;
    }
  }

  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    try {
      // Update project in backend
      const backendProject = await apiService.updateProject(projectId, {
        title: data.name?.trim(),
        description: data.description?.trim(),
      });

      // Transform backend data to match frontend interface
      const updatedProject: Project = {
        id: backendProject.id,
        name: backendProject.title,
        description: backendProject.description || '',
        pageCount: backendProject.page_count || 0,
        lockOrientation: data.lockOrientation || false,
        title: backendProject.title,
        page_count: backendProject.page_count,
        created_at: backendProject.created_at,
        updated_at: backendProject.updated_at,
      };

      return updatedProject;
    } catch (error) {
      console.log('Error updating project in backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const projects = await this.getAllProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const updatedProject = {
        ...projects[projectIndex],
        ...data,
        name: data.name?.trim() || projects[projectIndex].name,
        description: data.description?.trim() ?? projects[projectIndex].description,
      };

      projects[projectIndex] = updatedProject;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      return updatedProject;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      // Delete project from backend
      await apiService.deleteProject(projectId);
    } catch (error) {
      console.log('Error deleting project from backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      await this.deleteProjectPages(projectId);
      
      const projects = await this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const projects = await this.getAllProjects();
      
      for (const project of projects) {
        await this.deleteProject(project.id);
      }
    } catch (error) {
      console.log('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  private async deleteProjectPages(projectId: string): Promise<void> {
    try {
      // This will be handled by the backend when deleting a project
      // For local fallback, we'll clean up local storage
      const storedPages = await AsyncStorage.getItem(`project_pages_${projectId}`);
      if (storedPages) {
        const pages = JSON.parse(storedPages);
        
        for (const page of pages) {
          if (page.photoUri && page.photoUri.startsWith('file://')) {
            try {
              // Check if file exists before trying to delete it
              const fileInfo = await FileSystem.getInfoAsync(page.photoUri);
              if (fileInfo.exists) {
                await FileSystem.deleteAsync(page.photoUri);
              }
            } catch (error) {
              console.log('Error deleting image file:', error);
            }
          }
        }
        
        await AsyncStorage.removeItem(`project_pages_${projectId}`);
      }
    } catch (error) {
      console.log('Error deleting project pages:', error);
    }
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      // Try to get project from backend first
      const backendProject = await apiService.getProject(projectId);
      
      // Transform backend data to match frontend interface
      const project: Project = {
        id: backendProject.id,
        name: backendProject.title,
        description: backendProject.description || '',
        pageCount: backendProject.page_count || 0,
        lockOrientation: false,
        title: backendProject.title,
        page_count: backendProject.page_count,
        created_at: backendProject.created_at,
        updated_at: backendProject.updated_at,
      };

      return project;
    } catch (error) {
      console.log('Error getting project from backend, falling back to local storage:', error);
      
      // Fallback to local storage if backend fails
      const projects = await this.getAllProjects();
      return projects.find(p => p.id === projectId) || null;
    }
  }

  async updateProjectPageCount(projectId: string, pageCount: number): Promise<void> {
    try {
      // Page count is managed by the backend automatically
      // This method is kept for compatibility but doesn't need to do anything
      console.log('Page count is managed by backend automatically');
    } catch (error) {
      console.log('Error updating project page count:', error);
    }
  }
}

export const projectService = new ProjectService();