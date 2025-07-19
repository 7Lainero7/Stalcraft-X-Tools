import { api } from "./BaseApi";

export interface BuildCreateData {
  name: string;
  description?: string | null;
  armorId: string;
  containerId: string;
  artefactIds: string[];
  tags?: string[];
  isPublic?: boolean;
  isTemplate?: boolean;
}

export const saveBuild = async (data: {
  buildName: string;
  description: string;
  selectedArmor: { id: string };
  selectedContainer: { id: string };
  selectedArtifacts: { id: string }[];
  tags: string[];
}) => {
  try {
    const response = await api.post('/builds', {
      name: data.buildName,
      description: data.description,
      armorId: data.selectedArmor.id,
      containerId: data.selectedContainer.id,
      artefactIds: data.selectedArtifacts.map(a => a.id),
      tags: data.tags
    });
    return response.data;
  } catch (error) {
    console.error('Error saving build:', error);
    throw error;
  }
};