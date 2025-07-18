import { api } from "./BaseApi";

export interface Artifact {
  id: string;
  name: string;
  type: string; // artefactClass
  category: string;
  color: string;
  state: string;
  freshness?: string;
  imageUrl: string; // iconUrl
  stats: Record<string, number>; // effects
  effects: {
    name: string; // effectKey
    description: string;
    minValue: number;
    maxValue: number;
    isThreshold: boolean;
  }[];
}

export const fetchArtifacts = async (filters: {
  category?: string;
  type?: string; // artefactClass
  color?: string;
  state?: string;
  freshness?: string;
} = {}): Promise<Artifact[]> => {
  const response = await api.get('/artefacts', { 
    params: {
      ...filters,
      artefactClass: filters.type // преобразуем type в artefactClass для бэкенда
    }
  });
  
  return response.data.map((item: any) => ({
    id: item.id,
    name: item.names[0]?.name || 'Без названия',
    type: item.artefactClass, // преобразуем artefactClass в type
    category: item.category,
    color: item.color,
    state: item.state,
    freshness: item.freshness,
    imageUrl: item.iconUrl,
    stats: item.effects.reduce((acc: Record<string, number>, effect: any) => {
      // Используем среднее значение между min и max
      acc[effect.effectKey] = (effect.minValue + effect.maxValue) / 2;
      return acc;
    }, {} as Record<string, number>),
    effects: item.effects.map((effect: any) => ({
      name: effect.effectKey,
      description: `${effect.effectKey}: ${effect.minValue}-${effect.maxValue}`,
      minValue: effect.minValue,
      maxValue: effect.maxValue,
      isThreshold: effect.isThreshold
    }))
  }));
};