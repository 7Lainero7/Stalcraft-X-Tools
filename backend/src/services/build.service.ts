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

export async function getBuildById(id: string, lang = 'ru') {
  return prisma.build.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      armor: {
        include: {
          names: { where: { lang }, select: { name: true } },
        },
      },
      container: {
        include: {
          names: { where: { lang }, select: { name: true } },
        },
      },
      artefacts: {
        include: {
          artefact: {
            include: {
              names: { where: { lang }, select: { name: true } },
              effects: true,
            },
          },
        },
      },
      likes: true,
    },
  });
}

export async function createBuild(data: {
  userId: number;
  armorId: string;
  containerId: string;
  artefactIds: string[];
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}) {
  return prisma.build.create({
    data: {
      userId: data.userId,
      armorId: data.armorId,
      containerId: data.containerId,
      isPublic: data.isPublic ?? false,
      isTemplate: data.isTemplate ?? false,
      tags: data.tags ?? [],
      artefacts: {
        create: data.artefactIds.map(id => ({ artefactId: id })),
      },
    },
  });
}

export async function updateBuild(id: string, data: Partial<{
  armorId: string;
  containerId: string;
  artefactIds: string[];
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
}>) {
  const artefactUpdate = data.artefactIds
    ? {
        deleteMany: {},
        create: data.artefactIds.map(id => ({ artefactId: id })),
      }
    : undefined;

  return prisma.build.update({
    where: { id },
    data: {
      armorId: data.armorId,
      containerId: data.containerId,
      isPublic: data.isPublic,
      isTemplate: data.isTemplate,
      tags: data.tags,
      ...(artefactUpdate && { artefacts: artefactUpdate }),
    },
  });
}

export async function deleteBuild(id: string) {
  return prisma.build.delete({ where: { id } });
}
