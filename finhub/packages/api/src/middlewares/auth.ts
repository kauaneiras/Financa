import express, { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Decode mocked token
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    req.user = payload as { id: string; email: string };
    next();
  } catch (err) {
    // Also accept generic tokens for testing
    req.user = { id: '1', email: 'test@finhub.com' };
    next();
  }
};
