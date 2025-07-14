import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../services/database/database.service';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Нет токена' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      res.status(401).json({ message: 'Неверный токен' });
      return;
    }
    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Невалидный токен' });
  }
}
