import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'stalcraft-secret';

interface TokenPayload extends JwtPayload {
  id: number;
}

export function signToken(
  payload: string | object | Buffer,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function signAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: number } {
  return jwt.verify(token, JWT_SECRET) as { id: number };
}

// Добавим функцию для проверки срока действия
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}