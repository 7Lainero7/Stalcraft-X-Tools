import { Router, Request, Response } from 'express';
import { register, login, getMe, updateMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { verifyToken, signAccessToken, signToken } from '../utils/jwt';
import prisma from '../services/database/database.service';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  try {
    const payload = verifyToken(token) as { id: number };
    const accessToken = signAccessToken({ id: payload.id });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Невалидный refresh токен' });
  }
});

router.post('/forgot', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  const token = signToken({ id: user.id }, '1h'); // временный токен
  // TODO: отправить email с ссылкой: /reset?token=...

  res.json({ message: 'Ссылка отправлена', token }); // временно возвращаем токен
});

router.post('/reset', async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;
  try {
    const payload = verifyToken(token) as { id: number };
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: payload.id },
      data: { passwordHash: hash },
    });
    res.json({ message: 'Пароль обновлён' });
  } catch {
    res.status(400).json({ message: 'Невалидный или истёкший токен' });
  }
});

export default router;
