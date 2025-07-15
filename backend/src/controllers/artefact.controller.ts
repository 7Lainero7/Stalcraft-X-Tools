import { Request, Response } from 'express';
import { getArtefactList } from '../services/artefact.service';

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

export async function getArtefacts(req: Request, res: Response): Promise<void> {
  const filters: ArtefactFilters = {
    category: typeof req.query.category === 'string' ? req.query.category : undefined,
    artefactClass: typeof req.query.artefactClass === 'string' ? req.query.artefactClass : undefined,
    color: typeof req.query.color === 'string' ? req.query.color : undefined,
    state: typeof req.query.state === 'string' ? req.query.state : undefined,
    freshness: typeof req.query.freshness === 'string' ? req.query.freshness : undefined,
    lang: typeof req.query.lang === 'string' ? req.query.lang : 'ru',
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    order: req.query.order === 'desc' ? 'desc' : 'asc',
  };

  const artefacts = await getArtefactList(filters);
  res.json(artefacts);
}
