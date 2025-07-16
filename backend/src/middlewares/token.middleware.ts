import { Request, Response, NextFunction } from 'express';
import { findRefreshToken } from '../services/refreshToken.service';

export async function checkTokenRevoked(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.refreshToken || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return next();
  }

  const storedToken = await findRefreshToken(token);
  if (!storedToken) {
    return res.status(401).json({ message: 'Token revoked' });
  }

  next();
}