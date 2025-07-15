import prisma from './database/database.service';

interface ContainerFilters {
  rank?: string;
  containerClass?: string;
  color?: string;
  state?: string;
  lang?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function getContainerList(filters: ContainerFilters) {
  const {
    rank,
    containerClass,
    color,
    state,
    lang = 'ru',
    limit = 20,
    offset = 0,
    sort,
    order = 'asc',
  } = filters;

  return prisma.container.findMany({
    where: {
      ...(rank && { rank }),
      ...(containerClass && { containerClass }),
      ...(color && { color }),
      ...(state && { state }),
    },
    include: {
      names: {
        where: { lang },
        select: { name: true },
      },
      stats: true,
    },
    take: limit,
    skip: offset,
    orderBy: sort ? { [sort]: order } : { rank: 'asc' },
  });
}
