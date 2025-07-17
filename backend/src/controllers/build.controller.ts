import { Request, Response } from 'express';
import {
  getBuildList,
  getBuildById,
  createBuild,
  updateBuild,
  deleteBuild,
  cloneBuild,
  getPopularBuilds,
  toggleLike,
  toggleFavorite,
  getFavoriteBuilds,
  getPopularTags,
  getBuildsByTag
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
  
  const formattedBuilds = builds.map(build => ({
    ...build,
    tags: build.buildTags.map(bt => bt.tag.name)
  }));
  
  res.json(formattedBuilds);
}

export async function getBuild(req: Request, res: Response): Promise<void> {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'ru';
  const buildId = Number(req.params.id);
  
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  const build = await getBuildById(buildId, lang);
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

  try {
    const build = await createBuild({
      userId: user.id,
      armorId: parsed.data.armorId, // уже string
      containerId: parsed.data.containerId, // уже string
      artefactIds: parsed.data.artefactIds, // уже string[]
      isPublic: parsed.data.isPublic,
      isTemplate: parsed.data.isTemplate,
      tags: parsed.data.tags,
    });

    res.status(201).json(build);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при создании билда', error });
  }
}

export async function updateBuildHandler(req: Request, res: Response): Promise<void> {
  const parsed = buildUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(parsed.error.format());
    return;
  }

  const buildId = Number(req.params.id);
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  try {
    const updateData = {
      ...parsed.data,
      armorId: parsed.data.armorId,
      containerId: parsed.data.containerId,
      artefactIds: parsed.data.artefactIds,
    };

    const build = await updateBuild(buildId, updateData);
    res.json(build);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении билда', error });
  }
}

export async function deleteBuildHandler(req: Request, res: Response): Promise<void> {
  const buildId = Number(req.params.id);
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  try {
    await deleteBuild(buildId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении билда', error });
  }
}

export async function cloneBuildHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  const buildId = Number(req.params.id);
  
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  try {
    const cloned = await cloneBuild(buildId, user.id);
    res.status(201).json(cloned);
  } catch (error) {
    res.status(404).json({ message: 'Билд не найден' });
  }
}

export async function getPopularBuildsHandler(req: Request, res: Response): Promise<void> {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'ru';
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const builds = await getPopularBuilds(lang, limit);
  res.json(builds);
}

export async function likeBuildHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  const buildId = Number(req.params.id);
  
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  try {
    const result = await toggleLike(buildId, user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении лайка', error });
  }
}

export async function favoriteBuildHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  const buildId = Number(req.params.id);
  
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  try {
    const result = await toggleFavorite(buildId, user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении избранного', error });
  }
}

export async function getFavoritesHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'ru';
  
  try {
    const builds = await getFavoriteBuilds(user.id, lang);
    res.json(builds);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении избранных билдов', error });
  }
}

export async function getPopularTagsHandler(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const tags = await getPopularTags(limit);
  res.json(tags);
}

export async function getBuildsByTagHandler(req: Request, res: Response) {
  const tagName = req.params.tag;
  const filters = {
    // ... аналогично getBuilds
  };
  
  const builds = await getBuildsByTag(tagName, filters);
  res.json(builds);
}
