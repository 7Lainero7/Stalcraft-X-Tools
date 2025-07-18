import prisma from "./database/database.service";

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
    limit = 1000,
    offset = 0,
  } = filters;

  const armors = await prisma.armor.findMany({
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
      stats: {
        select: {
          statKey: true,
          value: true
        }
      },
    },
    take: limit,
    skip: offset,
    orderBy: { rank: 'asc' },
  });

  return armors.map(armor => ({
    id: armor.id,
    names: armor.names,
    class: armor.class,
    rank: armor.rank,
    iconUrl: armor.iconUrl,
    stats: armor.stats
  }));
}