import prisma from './database/database.service';

interface BuildFilters {
  userId?: number;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string;
  lang?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function getBuildList(filters: BuildFilters) {
  const {
    userId,
    isPublic,
    isTemplate,
    tags,
    lang = 'ru',
    limit = 20,
    offset = 0,
    sort,
    order = 'desc',
  } = filters;

  return prisma.build.findMany({
    where: {
      ...(userId && { userId }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isTemplate !== undefined && { isTemplate }),
      ...(tags && { tags: { has: tags } }),
    },
    include: {
      user: {
        select: { id: true, username: true, role: true },
      },
      armor: {
        include: {
          names: {
            where: { lang },
            select: { name: true },
          },
        },
      },
      container: {
        include: {
          names: {
            where: { lang },
            select: { name: true },
          },
        },
      },
      artefacts: {
        include: {
          artefact: {
            include: {
              names: {
                where: { lang },
                select: { name: true },
              },
              effects: true,
            },
          },
        },
      },
      likes: true,
    },
    take: limit,
    skip: offset,
    orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
  });
}
