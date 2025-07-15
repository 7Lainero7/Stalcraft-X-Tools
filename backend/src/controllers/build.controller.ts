import { Request, Response } from 'express';
import {
  getBuildList,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
} from '../services/build.service';
import { buildCreateSchema, buildUpdateSchema } from '../validators/build.schema';

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

export async function getBuilds(req: Request, res: Response): Promise<void> {
  const filters: BuildFilters = {
    userId: req.query.userId ? Number(req.query.userId) : undefined,
    isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
    isTemplate: req.query.isTemplate === 'true' ? true : req.query.isTemplate === 'false' ? false : undefined,
    tags: typeof req.query.tags === 'string' ? req.query.tags : undefined,
    lang: typeof req.query.lang === 'string' ? req.query.lang : 'ru',
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    order: req.query.order === 'asc' ? 'asc' : 'desc',
  };

  const builds = await getBuildList(filters);
  res.json(builds);
}

export async function getBuild(req: Request, res: Response): Promise<void> {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'ru';
  const build = await getBuildById(req.params.id, lang);
  if (!build) {
    res.status(404).json({ message: 'Билд не найден' });
    return;
  }
  res.json(build);
}

export async function createBuildHandler(req: Request, res: Response): Promise<void> {
  const parsed = buildCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.format());
    return;
  }

  const user = (req as any).user;
  const build = await createBuild({ ...parsed.data, userId: user.id });
  res.status(201).json(build);
}

export async function updateBuildHandler(req: Request, res: Response): Promise<void> {
  const parsed = buildUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.format());
    return;
  }

  const build = await updateBuild(req.params.id, parsed.data);
  res.json(build);
}

export async function deleteBuildHandler(req: Request, res: Response): Promise<void> {
  await deleteBuild(req.params.id);
  res.status(204).send();
}
