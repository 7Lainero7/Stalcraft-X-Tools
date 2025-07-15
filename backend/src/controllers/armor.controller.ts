import { Request, Response } from 'express';
import { getArmorList } from '../services/armor.service';

export async function getArmor(req: Request, res: Response): Promise<void> {
  const filters = {
    rank: req.query.rank as string,
    class: req.query.class as string,
    color: req.query.color as string,
    state: req.query.state as string,
    lang: req.query.lang as string,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  };

  const armor = await getArmorList(filters);
  res.json(armor);
}
