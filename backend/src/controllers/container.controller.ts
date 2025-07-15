import { Request, Response } from 'express';
import { getContainerList } from '../services/container.service';

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

export async function getContainers(req: Request, res: Response): Promise<void> {
  const filters: ContainerFilters = {
    rank: typeof req.query.rank === 'string' ? req.query.rank : undefined,
    containerClass: typeof req.query.containerClass === 'string' ? req.query.containerClass : undefined,
    color: typeof req.query.color === 'string' ? req.query.color : undefined,
    state: typeof req.query.state === 'string' ? req.query.state : undefined,
    lang: typeof req.query.lang === 'string' ? req.query.lang : 'ru',
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    order: req.query.order === 'desc' ? 'desc' : 'asc',
  };

  const containers = await getContainerList(filters);
  res.json(containers);
}
