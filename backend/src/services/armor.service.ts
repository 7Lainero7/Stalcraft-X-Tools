import prisma from './database/database.service';

interface ArmorFilters {
  rank?: string;
  class?: string;
  color?: string;
  state?: string;
  lang?: string;
  limit?: number;
  offset?: number;
}

export async function getArmorList(filters: ArmorFilters) {
  const {
    rank,
    class: armorClass,
    color,
    state,
    lang = 'ru',
    limit = 20,
    offset = 0,
  } = filters;

  return prisma.armor.findMany({
    where: {
      ...(rank && { rank }),
      ...(armorClass && { class: armorClass }),
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
    orderBy: { rank: 'asc' },
  });
}
