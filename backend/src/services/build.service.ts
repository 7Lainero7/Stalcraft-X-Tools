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
      user: { select: { id: true, username: true, role: true } },
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
    take: limit,
    skip: offset,
    orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
  });
}

export async function getBuildById(id: number, lang = 'ru') {
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

interface CreateBuildData {
  userId: number;
  armorId: string;
  containerId: string;
  artefactIds: string[];
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  name?: string;
  description?: string;
}

export async function createBuild(data: CreateBuildData) {
  return prisma.build.create({
    data: {
      userId: data.userId,
      armorId: data.armorId,
      containerId: data.containerId,
      name: data.name || 'Новый билд',
      description: data.description || null,
      buildData: '{}',
      isPublic: data.isPublic ?? false,
      isTemplate: data.isTemplate ?? false,
      tags: data.tags ?? [],
      artefacts: {
        create: data.artefactIds.map((id, index) => ({
          slot: index,
          artefact: { connect: { id } },
        })),
      },
    },
    include: {
      artefacts: true,
    },
  });
}

interface UpdateBuildData {
  armorId?: string;
  containerId?: string;
  artefactIds?: string[];
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
  name?: string;
  description?: string;
}

export async function updateBuild(id: number, data: UpdateBuildData) {
  const artefactUpdate = data.artefactIds
    ? {
        deleteMany: {},
        create: data.artefactIds.map((id, index) => ({
          slot: index,
          artefact: { connect: { id } },
        })),
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
      name: data.name,
      description: data.description,
      ...(artefactUpdate && { artefacts: artefactUpdate }),
    },
    include: {
      artefacts: true,
    },
  });
}

export async function deleteBuild(id: number) {
  return prisma.build.delete({ where: { id } });
}

export async function cloneBuild(buildId: number, userId: number) {
  const original = await prisma.build.findUnique({
    where: { id: buildId },
    include: {
      artefacts: true,
    },
  });

  if (!original) throw new Error('Билд не найден');

  return prisma.build.create({
    data: {
      userId,
      armorId: original.armorId,
      containerId: original.containerId,
      name: `Клон билда ${original.name}`,
      description: original.description,
      buildData: original.buildData ?? '{}',
      isPublic: false,
      isTemplate: false,
      tags: original.tags,
      artefacts: {
        create: original.artefacts.map((a, index) => ({
          slot: index,
          artefact: { connect: { id: a.artefactId } },
        })),
      },
    },
    include: {
      artefacts: true,
    },
  });
}

export async function getPopularBuilds(lang = 'ru', limit = 10) {
  return prisma.build.findMany({
    where: { isPublic: true },
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
    orderBy: [
      { viewsCount: 'desc' },
      { likesCount: 'desc' },
    ],
    take: limit,
  });
}

export async function toggleLike(buildId: number, userId: number) {
  const existing = await prisma.buildLike.findUnique({
    where: {
      userId_buildId: { userId, buildId },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.buildLike.delete({
        where: { userId_buildId: { userId, buildId } },
      }),
      prisma.build.update({
        where: { id: buildId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  } else {
    await prisma.$transaction([
      prisma.buildLike.create({
        data: { userId, buildId },
      }),
      prisma.build.update({
        where: { id: buildId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
    return { liked: true };
  }
}

export async function toggleFavorite(buildId: number, userId: number) {
  const existing = await prisma.buildFavorite.findUnique({
    where: {
      userId_buildId: { userId, buildId },
    },
  });

  if (existing) {
    await prisma.buildFavorite.delete({
      where: { userId_buildId: { userId, buildId } },
    });
    return { favorited: false };
  } else {
    await prisma.buildFavorite.create({
      data: { userId, buildId },
    });
    return { favorited: true };
  }
}

export async function getFavoriteBuilds(userId: number, lang = 'ru') {
  const favorites = await prisma.buildFavorite.findMany({
    where: { userId },
    include: {
      build: {
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
      },
    },
  });

  return favorites.map((f: { build: any }) => f.build);
}
