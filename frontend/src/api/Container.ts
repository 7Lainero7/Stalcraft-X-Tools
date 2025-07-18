import { api } from "./BaseApi";

export interface Container {
  id: string;
  name: string;
  class: string;
  rank: string;
  slots: number;
  imageUrl: string;
  bonuses: Record<string, number>;
}

export const fetchContainers = async (): Promise<Container[]> => {
  const response = await api.get('/containers');
  return response.data.map((item: any) => ({
    id: item.id,
    name: item.names[0]?.name || 'Без названия',
    class: item.containerClass,
    rank: item.rank,
    slots: item.slots,
    imageUrl: item.iconUrl,
    bonuses: item.stats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.statName] = stat.value;
      return acc;
    }, {})
  }));
};
