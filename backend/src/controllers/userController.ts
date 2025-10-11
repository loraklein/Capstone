import { Request, Response } from 'express';
import { supabase } from '../config/database';

// Sign up new user
export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({ 
        error: error.message || 'Failed to create account' 
      });
    }

    if (!data.user) {
      return res.status(500).json({ 
        error: 'Failed to create user account' 
      });
    }

    // Also create user record in our users table
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id, // Use the same ID as auth.users
          email: data.user.email,
          created_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      console.error('Error creating user record:', dbError);
      // Don't fail signup if user record creation fails - auth user still exists
    }

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    });
  } catch (error) {
    console.error('Error in signUp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Sign in existing user
export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    res.json({
      message: 'Signed in successfully',
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    });
  } catch (error) {
    console.error('Error in signIn:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Sign out user
export const signOut = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No authorization token provided' 
      });
    }

    const token = authHeader.substring(7);

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error);
      return res.status(500).json({ 
        error: 'Failed to sign out' 
      });
    }

    res.json({
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Error in signOut:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user data from our users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
