
export interface Build {
  id: number;
  name: string;
  description?: string;
  armorId?: string;
  containerId?: string;
  artifacts: Artifact[];
  tags: string[];
  stats: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}