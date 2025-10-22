import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

// Rate limiting configuration
const RATE_LIMITS = {
  AI_PROCESSING_PER_DAY: parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '50'), // 50 images per user per day
  AI_PROCESSING_PER_HOUR: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '20'), // 20 images per user per hour
};

export const checkAIRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check daily limit
    const dayAgo = new Date();
    dayAgo.setHours(dayAgo.getHours() - 24);

    const { count: dailyCount, error: dailyError } = await supabase
      .from('pages')
      .select(`
        id,
        projects!inner(user_id)
      `, { count: 'exact', head: true })
      .eq('projects.user_id', userId)
      .gte('ai_processed_at', dayAgo.toISOString())
      .not('ai_processed_at', 'is', null);

    if (dailyError) {
      console.error('Error checking daily rate limit:', dailyError);
      // Don't block on error, just log it
    } else if (dailyCount && dailyCount >= RATE_LIMITS.AI_PROCESSING_PER_DAY) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `You have reached your daily limit of ${RATE_LIMITS.AI_PROCESSING_PER_DAY} AI processing requests. Please try again tomorrow.`,
        limit: RATE_LIMITS.AI_PROCESSING_PER_DAY,
        resetIn: '24 hours'
      });
    }

    // Check hourly limit
    const hourAgo = new Date();
    hourAgo.setHours(hourAgo.getHours() - 1);

    const { count: hourlyCount, error: hourlyError } = await supabase
      .from('pages')
      .select(`
        id,
        projects!inner(user_id)
      `, { count: 'exact', head: true })
      .eq('projects.user_id', userId)
      .gte('ai_processed_at', hourAgo.toISOString())
      .not('ai_processed_at', 'is', null);

    if (hourlyError) {
      console.error('Error checking hourly rate limit:', hourlyError);
      // Don't block on error, just log it
    } else if (hourlyCount && hourlyCount >= RATE_LIMITS.AI_PROCESSING_PER_HOUR) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `You have reached your hourly limit of ${RATE_LIMITS.AI_PROCESSING_PER_HOUR} AI processing requests. Please try again in an hour.`,
        limit: RATE_LIMITS.AI_PROCESSING_PER_HOUR,
        resetIn: '1 hour'
      });
    }

    // Rate limit check passed
    next();
  } catch (error) {
    console.error('Error in rate limiter:', error);
    // Don't block on error, just log it and continue
    next();
  }
};

