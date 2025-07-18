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
  try {
    const filters: ArtefactFilters = {
      category: req.query.category as string | undefined,
      artefactClass: req.query.artefactClass as string | undefined,
      color: req.query.color as string | undefined,
      state: req.query.state as string | undefined,
      freshness: req.query.freshness as string | undefined,
      lang: (req.query.lang as string) || 'ru',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order === 'desc' ? 'desc' : 'asc',
    };

    const artefacts = await getArtefactList(filters);
    
    // Форматируем данные для фронтенда
    const formattedArtefacts = artefacts.map(artefact => ({
      id: artefact.id,
      names: artefact.names,
      artefactClass: artefact.artefactClass,
      category: artefact.category,
      color: artefact.color,
      state: artefact.state,
      freshness: artefact.freshness,
      iconUrl: artefact.iconUrl,
      effects: artefact.effects.map(effect => ({
        effectKey: effect.effectKey,
        minValue: effect.minValue,
        maxValue: effect.maxValue,
        isThreshold: effect.isThreshold
      })),
      weight: artefact.weight,
      durability: artefact.durability,
      maxDurability: artefact.maxDurability,
      price: artefact.price,
      description: artefact.description,
      createdAt: artefact.createdAt,
      updatedAt: artefact.updatedAt
    }));

    res.json(formattedArtefacts);
  } catch (error) {
    console.error('Error fetching artefacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}