import { Request, Response } from 'express';
import { getArmorList } from '../services/armor.service';

export async function getArmor(req: Request, res: Response): Promise<void> {
  try {
    const filters = {
      rank: req.query.rank as string,
      class: req.query.class as string,
      color: req.query.color as string,
      state: req.query.state as string,
      lang: (req.query.lang as string) || 'ru',
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };

    console.log('Fetching armor with filters:', filters); // Логирование для отладки
    
    const armor = await getArmorList(filters);
    
    if (!armor || armor.length === 0) {
      console.warn('No armor found with filters:', filters);
    } else {
      console.log(`Found ${armor.length} armor items`);
    }

    res.json(armor);
  } catch (error) {
    console.error('Error fetching armor:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}