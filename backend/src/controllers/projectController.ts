import { Request, Response } from 'express';
import { supabase } from '../config/database';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, lockOrientation } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name: title, // Map title to name field in database
          description,
          lock_orientation: lockOrientation || false,
          page_count: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    // Transform the response to match frontend expectations
    const transformedData = {
      id: data.id,
      title: data.name, // Map name back to title for frontend
      name: data.name,
      description: data.description,
      page_count: data.page_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    res.status(201).json(transformedData);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Transform the response to match frontend expectations
    const transformedData = data.map((project: any) => ({
      id: project.id,
      title: project.name, // Map name to title for frontend
      name: project.name,
      description: project.description,
      page_count: project.page_count,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Error fetching project:', error);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getProjectById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, lockOrientation } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        name,
        description,
        lock_orientation: lockOrientation
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Error updating project:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First, delete all pages associated with this project
    const { error: pagesError } = await supabase
      .from('pages')
      .delete()
      .eq('project_id', id);

    if (pagesError) {
      console.error('Error deleting project pages:', pagesError);
      return res.status(500).json({ error: 'Failed to delete project pages' });
    }

    // Then delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
