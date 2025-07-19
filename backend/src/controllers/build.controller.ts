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
import prisma from '../services/database/database.service';

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

export async function createBuildHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    // Простая валидация
    if (!req.body.armorId || !req.body.containerId || !req.body.artefactIds?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const build = await createBuild({
      userId: user.id,
      name: req.body.name || 'Новая сборка',
      description: req.body.description,
      armorId: req.body.armorId,
      containerId: req.body.containerId,
      artefactIds: req.body.artefactIds,
      tags: req.body.tags || []
    });

    res.status(201).json(build);
  } catch (error) {
    console.error('Build creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create build',
      error: error.message
    });
  }
}

export async function updateBuildHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  const buildId = Number(req.params.id);
  
  if (isNaN(buildId)) {
    return res.status(400).json({ message: 'Некорректный ID билда' });
  }

  const parsed = buildUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Ошибка валидации',
      errors: parsed.error.flatten()
    });
  }

  try {
    // Проверка прав доступа
    const existingBuild = await prisma.build.findUnique({
      where: { id: buildId },
      select: { userId: true }
    });

    if (!existingBuild) {
      return res.status(404).json({ message: 'Билд не найден' });
    }

    if (existingBuild.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Нет прав для редактирования' });
    }

    const updateData = {
      name: parsed.data.name,
      description: parsed.data.description,
      armorId: parsed.data.armorId,
      containerId: parsed.data.containerId,
      artefactIds: parsed.data.artefactIds,
      tags: parsed.data.tags
      // totalStats убрано
    };

    const build = await updateBuild(buildId, updateData);
    res.json(build);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении билда',
      error: error.message
    });
  }
}

export async function deleteBuildHandler(req: Request, res: Response): Promise<void> {
  const user = (req as any).user;
  const buildId = Number(req.params.id);
  
  if (isNaN(buildId)) {
    res.status(400).json({ message: 'Некорректный ID билда' });
    return;
  }

  try {
    // Проверяем, что пользователь владелец
    const build = await getBuildById(buildId);
    if (!build) {
      return res.status(404).json({ message: 'Билд не найден' });
    }
    if (build.userId !== user.id) {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }

    await deleteBuild(buildId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении билда', error });
  }
}

export async function cloneBuildHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const buildId = Number(req.params.id);
    
    if (isNaN(buildId)) {
      return res.status(400).json({ message: 'Некорректный ID билда' });
    }

    const clonedBuild = await cloneBuild(buildId, user.id);
    res.status(201).json(clonedBuild);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при клонировании сборки', error });
  }
}

export async function getPopularBuildsHandler(req: Request, res: Response): Promise<void> {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'ru';
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const builds = await getPopularBuilds(lang, limit);
  res.json(builds);
}

export async function likeBuildHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const buildId = Number(req.params.id);
    
    if (isNaN(buildId)) {
      return res.status(400).json({ message: 'Некорректный ID билда' });
    }

    const result = await toggleLike(buildId, user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении лайка', error });
  }
}

export async function favoriteBuildHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const buildId = Number(req.params.id);
    
    if (isNaN(buildId)) {
      return res.status(400).json({ message: 'Некорректный ID билда' });
    }

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
