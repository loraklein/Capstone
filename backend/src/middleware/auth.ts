import { Request, Response, NextFunction } from 'express';

// Temporary auth middleware - we'll implement proper Supabase auth later
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // For now, we'll use the user ID from the request header or default to a test user
  // In production, this would verify JWT tokens or Supabase session
  const userId = req.headers['x-user-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
  
  req.user = {
    id: userId
  };
  
  next();
};

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}
