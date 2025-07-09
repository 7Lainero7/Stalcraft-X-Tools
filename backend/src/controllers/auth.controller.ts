import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../services/database/database.service';
import { signToken } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: hashed
    }
  });

  const token = signToken({ id: user.id });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Неверные данные' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Неверные данные' });

  const token = signToken({ id: user.id });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
}

export async function getMe(req: Request, res: Response) {
  const user = (req as any).user;
  res.json({ user });
}

export async function updateMe(req: Request, res: Response) {
  const user = (req as any).user;
  const { username, password } = req.body;

  const data: any = {};
  if (username) data.username = username;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data
  });

  res.json({ user: updated });
}
