import prisma from './database/database.service';

interface BuildFilters {
  userId?: number;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string;
  search?: string;
  lang?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
}

export async function getBuildList(filters: BuildFilters) {
  const {
    userId,
    isPublic,
    isTemplate,
    tags,
    search,
    lang = 'ru',
    limit = 10,
    offset = 0,
    sort = 'likesCount',
    order = 'desc',
    page = 1
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {
    ...(userId && { userId }),
    ...(isPublic !== undefined && { isPublic }),
    ...(isTemplate !== undefined && { isTemplate }),
    ...(tags && { 
      buildTags: {
        some: {
          tag: {
            name: tags
          }
        }
      }
    }),
  };

  // Добавляем поиск по названию, автору и тегам
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
      { 
        buildTags: {
          some: {
            tag: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      }
    ];
  }

  return prisma.build.findMany({
    where,
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
      buildTags: {
        include: {
          tag: true
        }
      },
      likes: true,
      favorites: true
    },
    take: limit,
    skip,
    orderBy: { 
      [sort]: order 
    },
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
          stats: true,
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
        orderBy: { slot: 'asc' }
      },
      buildTags: {
        include: {
          tag: true
        }
      },
      likes: true,
    },
  });
}

interface CreateBuildData {
  userId: number;
  name: string;
  description?: string;
  armorId: string;
  containerId: string;
  artefactIds: string[];
  totalStats?: Record<string, any>;
  totalWeight?: number;
  totalCost?: number;
  isPublic?: boolean;
  isTemplate?: boolean;
  tags?: string[];
}

export async function createBuild(data: {
    userId: number;
    name: string;
    description?: string | null;
    armorId: string;
    containerId: string;
    artefactIds: string[];
    tags?: string[];
  }) {
    return await prisma.$transaction(async (prisma) => {
      // 1. Создаем или находим теги
      const tagOperations = data.tags?.map(tagName => 
        prisma.tag.upsert({
          where: { name: tagName },
          create: { name: tagName },
          update: {}
        })
      ) || [];

      const tags = await Promise.all(tagOperations);

      // 2. Создаем сборку
      const build = await prisma.build.create({
        data: {
          userId: data.userId,
          name: data.name,
          description: data.description,
          armorId: data.armorId,
          containerId: data.containerId,
          artefacts: {
            create: data.artefactIds.map((artefactId, index) => ({
              slot: index,
              artefactId: artefactId
            }))
          },
          buildTags: {
            create: tags.map(tag => ({
              tagId: tag.id
            }))
          }
        },
        include: {
          armor: true,
          container: true,
          artefacts: {
            include: {
              artefact: true
            }
          }
        }
      });

      return build;
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
  const tags = data.tags?.length ? await findOrCreateTags(data.tags) : [];
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
      name: data.name,
      description: data.description,
      armorId: data.armorId,
      containerId: data.containerId,
      buildTags: {
        deleteMany: {},
        create: tags.map(tag => ({
          tag: { connect: { id: tag.id } }
        })),
      },
      ...(artefactUpdate && { artefacts: artefactUpdate }),
      // totalStats больше не обновляем
    },
    include: {
      artefacts: true,
      buildTags: {
        include: {
          tag: true
        }
      },
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
      buildTags: {
        include: {
          tag: true
        }
      },
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
      artefacts: {
        create: original.artefacts.map((a, index) => ({
          slot: index,
          artefact: { connect: { id: a.artefactId } },
        })),
      },
      buildTags: {
        create: original.buildTags.map(tag => ({
          tag: {
            connect: { id: tag.tag.id }
          }
        })),
      },
    },
    include: {
      artefacts: true,
      buildTags: {
        include: {
          tag: true
        }
      },
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

export async function findOrCreateTags(tagNames: string[]) {
  return Promise.all(
    tagNames.map(name =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );
}

export async function getPopularTags(limit = 10) {
  return prisma.tag.findMany({
    take: limit,
    orderBy: {
      buildTags: {
        _count: 'desc',
      },
    },
    select: {
      name: true,
      _count: {
        select: { buildTags: true },
      },
    },
  });
}

export async function getBuildsByTag(tagName: string, filters: Omit<BuildFilters, 'tags'>) {
  return prisma.build.findMany({
    where: {
      buildTags: {
        some: { 
          tag: { 
            name: tagName 
          } 
        }
      },
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
      ...(filters.isTemplate !== undefined && { isTemplate: filters.isTemplate }),
    },
    include: {
      user: { select: { id: true, username: true, role: true } },
      buildTags: {
        include: {
          tag: true
        }
      },
    },
    take: filters.limit,
    skip: filters.offset,
    orderBy: filters.sort ? { [filters.sort]: filters.order } : { createdAt: 'desc' },
  });
}