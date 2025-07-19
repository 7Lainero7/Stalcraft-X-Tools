import { z } from 'zod';

export const buildCreateSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional().nullable(),
  armorId: z.string().min(1, "Броня обязательна"),
  containerId: z.string().min(1, "Контейнер обязателен"),
  artefactIds: z.array(z.string()).min(1, "Хотя бы один артефакт обязателен"),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  isTemplate: z.boolean().default(false)
});

export const buildUpdateSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().nullable().optional(),
  armorId: z.string().min(1, "Броня обязательна"),
  containerId: z.string().min(1, "Контейнер обязателен"),
  artefactIds: z.array(z.string()).min(1, "Добавьте хотя бы один артефакт"),
  tags: z.array(z.string()).optional()
});

export type BuildCreateInput = z.infer<typeof buildCreateSchema>;