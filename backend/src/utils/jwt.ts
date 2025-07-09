import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'stalcraft-secret';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
