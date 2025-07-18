import { Request, Response } from 'express';
import { registerSchema, loginSchema, updateSchema } from '../validators/auth.schema';
import { signToken, signAccessToken, signRefreshToken } from '../utils/jwt';
import { createRefreshToken, findRefreshToken, deleteRefreshToken } from '../services/refreshToken.service';
import bcrypt from 'bcrypt';
import prisma from '../services/database/database.service';

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.format());
    return;
  }

  const { email, username, password } = parsed.data;
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: hashed
    }
  });

   const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

  await createRefreshToken(user.id, refreshToken, expiresAt);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.format());
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ message: 'Неверные данные' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Неверные данные' });
    return;
  }

  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

  await createRefreshToken(user.id, refreshToken, expiresAt);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = (req as any).user; // Получаем пользователя из middleware
  
  if (!user) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  // Получаем полные данные пользователя из БД
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true
    }
  });

  res.json(userData);
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.format());
    return;
  }

  const user = (req as any).user;
  const { username, password } = parsed.data;

  const data: Record<string, any> = {};
  if (username) data.username = username;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data
  });

  res.json({ user: updated });
}
