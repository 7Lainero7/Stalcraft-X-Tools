import prisma from './database/database.service';

interface ArtefactFilters {
  category?: string;
  artefactClass?: string;
  color?: string;
  state?: string;
  freshness?: string;
  lang?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function getArtefactList(filters: ArtefactFilters) {
  const {
    category,
    artefactClass,
    color,
    state,
    freshness,
    lang = 'ru',
    limit = 1000,
    offset = 0,
    sort,
    order = 'asc',
  } = filters;

  return await prisma.artefact.findMany({
    where: {
      ...(category && { category }),
      ...(artefactClass && { artefactClass }),
      ...(color && { color }),
      ...(state && { state }),
      ...(freshness && { freshness }),
    },
    include: {
      names: {
        where: { lang },
        select: { name: true },
      },
      effects: {
        select: {
          effectKey: true,
          minValue: true,
          maxValue: true,
          isThreshold: true
        }
      },
    },
    take: limit,
    skip: offset,
    orderBy: sort ? { [sort]: order } : { category: 'asc' },
  });
}