import { Request, Response } from 'express';
import { supabase } from '../config/database';
import bcrypt from 'bcryptjs';

export const createTestUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.id,
        email: data.email,
        created_at: data.created_at
      }
    });
  } catch (error) {
    console.error('Error in createTestUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTestUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getTestUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTestUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('Error fetching user by email:', error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getTestUserByEmail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
