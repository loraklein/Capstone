import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface Project {
  id: string;
  name: string;
  description: string;
  pageCount: number;
  lockOrientation?: boolean;
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
      const storedProjects = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedProjects) {
        return JSON.parse(storedProjects);
      }
      return [];
    } catch (error) {
      console.log('Error loading projects:', error);
      return [];
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
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
    } catch (error) {
      console.log('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    try {
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
    } catch (error) {
      console.log('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      await this.deleteProjectPages(projectId);
      
      const projects = await this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
    } catch (error) {
      console.log('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const projects = await this.getAllProjects();
      
      for (const project of projects) {
        await this.deleteProjectPages(project.id);
      }
      
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.log('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  private async deleteProjectPages(projectId: string): Promise<void> {
    try {
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
      const projects = await this.getAllProjects();
      return projects.find(p => p.id === projectId) || null;
    } catch (error) {
      console.log('Error getting project by ID:', error);
      return null;
    }
  }

  async updateProjectPageCount(projectId: string, pageCount: number): Promise<void> {
    try {
      const projects = await this.getAllProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex].pageCount = pageCount;
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      }
    } catch (error) {
      console.log('Error updating project page count:', error);
    }
  }
}

export const projectService = new ProjectService(); 