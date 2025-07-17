import { z } from 'zod';

export const buildCreateSchema = z.object({
  armorId: z.string(),
  containerId: z.string(),
  artefactIds: z.array(z.string()),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(20)).optional(),
});

export const buildUpdateSchema = buildCreateSchema.partial();