import prisma from '../services/database/database.service';

export async function createRefreshToken(userId: number, token: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });
}

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });
}

export async function deleteRefreshToken(token: string) {
  return prisma.refreshToken.delete({
    where: { token }
  });
}

export async function deleteAllRefreshTokensForUser(userId: number) {
  return prisma.refreshToken.deleteMany({
    where: { userId }
  });
}