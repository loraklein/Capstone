import { Request, Response, NextFunction } from 'express';

// Temporary auth middleware - we'll implement proper Supabase auth later
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // For now, we'll use a temporary user ID for testing
  // In production, this would verify JWT tokens or Supabase session
  req.user = {
    id: 'temp-user-id' // This will be replaced with real auth later
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
