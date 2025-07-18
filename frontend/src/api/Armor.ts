import { api } from "./BaseApi";

export interface Armor {
  id: string;
  name?: string;
  type?: string;
  rank?: string;
  imageUrl?: string;
  stats?: Record<string, number>;
}

export const fetchArmor = async () => {
  const response = await api.get('/armor');
  return response.data.map((item: any) => ({
    ...item,
    stats: item.stats.reduce((acc, stat) => {
      acc[stat.statKey] = stat.value;
      return acc;
    }, {} as Record<string, number>)
  }));
};