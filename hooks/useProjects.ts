import { useCallback, useState } from 'react';
import { projectService, type CreateProjectData, type Project, type UpdateProjectData } from '../utils/projectService';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projects = await projectService.getAllProjects();
      setProjects(projects);
    } catch (error) {
      console.log('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projects = await projectService.getAllProjects();
      setProjects(projects);
    } catch (error) {
      console.log('Error refreshing projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectData): Promise<Project> => {
    try {
      const newProject = await projectService.createProject(data);
      await refreshProjects();
      return newProject;
    } catch (error) {
      console.log('Error creating project:', error);
      throw error;
    }
  }, [refreshProjects]);

  const updateProject = useCallback(async (projectId: string, data: UpdateProjectData): Promise<Project> => {
    try {
      const updatedProject = await projectService.updateProject(projectId, data);
      await refreshProjects();
      return updatedProject;
    } catch (error) {
      console.log('Error updating project:', error);
      throw error;
    }
  }, [refreshProjects]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      await projectService.deleteProject(projectId);
      await refreshProjects();
    } catch (error) {
      console.log('Error deleting project:', error);
      throw error;
    }
  }, [refreshProjects]);

  const clearStorage = async () => {
    try {
      await projectService.clearAllData();
      setProjects([]);
      console.log('Storage cleared');
    } catch (error) {
      console.log('Error clearing storage:', error);
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    loadProjects,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    clearStorage,
  };
} 