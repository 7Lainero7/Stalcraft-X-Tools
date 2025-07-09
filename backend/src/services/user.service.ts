import prisma from './database/database.service';

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
    }
  });
};
