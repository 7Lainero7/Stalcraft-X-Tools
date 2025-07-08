import { fetchJson, fetchFileList } from './github.service';
import prisma from '../database/database.service';

const ICON_BASE = 'https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/ru/icons';

const ARMOR_CATEGORIES = ['clothes', 'combat', 'combined', 'device', 'scientist'];
const ARTEFACT_CATEGORIES = ['biochemical', 'electrophysical', 'gravity', 'other_arts', 'thermal'];

function buildIconUrl(category: string, sub: string | undefined, id: string): string {
  if (sub) {
    return `${ICON_BASE}/${category}/${sub}/${id}.png`;
  }
  return `${ICON_BASE}/${category}/${id}.png`;
}

function parsePrice(raw: any): number | null {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/[^\d.,]/g, '').replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  if (typeof raw === 'object' && raw !== null && 'cost' in raw) {
    return parseFloat(String(raw.cost).replace(',', '.'));
  }
  return null;
}

function extractFromInfoBlocks(blocks: any[], opts: { key?: string, name?: string, type?: string }) {
  for (const block of blocks ?? []) {
    for (const el of block.elements ?? []) {
      if (opts.type && el.type !== opts.type) continue;
      if (opts.key && el.key?.lines?.ru === opts.key) return el.value?.lines?.ru ?? el.value?.text ?? el.value;
      if (opts.name && el.name?.lines?.ru === opts.name) return el.value;
    }
  }
  return undefined;
}

function extractNumericFromInfoBlocks(blocks: any[], name: string) {
  for (const block of blocks ?? []) {
    for (const el of block.elements ?? []) {
      if (el.type === 'numeric' && el.name?.lines?.ru === name) return el.value;
    }
  }
  return undefined;
}

function extractRangeStats(blocks: any[]) {
  const stats: { statKey: string, min: number, max: number }[] = [];
  for (const block of blocks ?? []) {
    for (const el of block.elements ?? []) {
      if (el.type === 'range') {
        stats.push({
          statKey: el.name?.lines?.ru ?? 'unknown',
          min: Number(el.min),
          max: Number(el.max),
        });
      }
    }
  }
  return stats;
}

async function resetArmorRelations(id: string) {
  await prisma.armorName.deleteMany({ where: { armorId: id } });
  await prisma.armorStat.deleteMany({ where: { armorId: id } });
}

async function resetArtefactRelations(id: string) {
  await prisma.artefactName.deleteMany({ where: { artefactId: id } });
  await prisma.artefactEffect.deleteMany({ where: { artefactId: id } });
}

async function resetContainerRelations(id: string) {
  await prisma.containerName.deleteMany({ where: { containerId: id } });
  await prisma.containerStat.deleteMany({ where: { containerId: id } });
}

export async function parseArmor() {
  for (const sub of ARMOR_CATEGORIES) {
    const ids = await fetchFileList('armor', sub);

    for (const id of ids) {
      try {
        const data = await fetchJson<any>(`https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/ru/items/armor/${sub}/${id}.json`);
        const iconUrl = buildIconUrl('armor', sub, id);
        await resetArmorRelations(id);

        // Извлекаем значения из infoBlocks
        const infoBlocks = data.infoBlocks ?? [];
        const rank = extractFromInfoBlocks(infoBlocks, { key: 'Ранг' }) ?? data.rank ?? '';
        const className = extractFromInfoBlocks(infoBlocks, { key: 'Класс' }) ?? data.class ?? '';
        const weight = extractNumericFromInfoBlocks(infoBlocks, 'Вес') ?? data.weight ?? 0;
        const durability = extractNumericFromInfoBlocks(infoBlocks, 'Прочность') ?? data.durability ?? 0;
        const max_durability = extractNumericFromInfoBlocks(infoBlocks, 'Макс. прочность') ?? data.max_durability ?? 0;
        const description = data.infoBlocks?.find((b: any) => b.text?.lines?.ru)?.text?.lines?.ru
          ?? data.description?.lines?.ru
          ?? data.description
          ?? '';

        // Совместимость
        const compatibleBackpacks = data.infoBlocks?.find((b: any) =>
          b.title?.lines?.ru === 'Совместимые рюкзаки')?.text?.lines?.ru ?? '';
        const compatibleContainers = data.infoBlocks?.find((b: any) =>
          b.title?.lines?.ru === 'Совместимые контейнеры')?.text?.lines?.ru ?? '';

        // Статы
        const stats = [];
        for (const block of infoBlocks) {
          for (const el of block.elements ?? []) {
            if (el.type === 'numeric' && el.name?.lines?.ru) {
              stats.push({
                statKey: el.name.lines.ru,
                value: Number(el.value),
              });
            }
          }
        }

        await prisma.armor.upsert({
          where: { id },
          update: {
            category: 'armor',
            class: className,
            rank,
            color: data.color ?? '',
            state: data.status?.state ?? '',
            weight,
            durability,
            max_durability,
            description,
            compatibleBackpacks,
            compatibleContainers,
            iconUrl,
          },
          create: {
            id,
            category: 'armor',
            class: className,
            rank,
            color: data.color ?? '',
            state: data.status?.state ?? '',
            weight,
            durability,
            max_durability,
            description,
            compatibleBackpacks,
            compatibleContainers,
            iconUrl,
          },
        });

        await prisma.armorName.createMany({
          data: Object.entries(data.name?.lines ?? {}).map(([lang, name]) => ({
            armorId: id,
            lang,
            name: String(name),
          })),
        });

        await prisma.armorStat.createMany({
          data: stats.map(({ statKey, value }) => ({
            armorId: id,
            statKey,
            value,
          })),
        });

        console.log(`✅ armor/${sub}/${id}`);
      } catch (err) {
        console.error(`❌ armor/${sub}/${id}:`, err);
      }
    }
  }
}

export async function parseArtefacts() {
  for (const sub of ARTEFACT_CATEGORIES) {
    const ids = await fetchFileList('artefact', sub);

    for (const id of ids) {
      try {
        const data = await fetchJson<any>(`https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/ru/items/artefact/${sub}/${id}.json`);
        const iconUrl = buildIconUrl('artefact', sub, id);
        await resetArtefactRelations(id);

        const infoBlocks = data.infoBlocks ?? [];
        const className = extractFromInfoBlocks(infoBlocks, { key: 'Класс' }) ?? data.class ?? '';
        const weight = extractNumericFromInfoBlocks(infoBlocks, 'Вес') ?? data.weight ?? 0;
        const durability = extractNumericFromInfoBlocks(infoBlocks, 'Заряд') ?? data.durability ?? 0;
        const maxDurability = extractNumericFromInfoBlocks(infoBlocks, 'Макс. заряд') ?? data.max_durability ?? 0;
        const priceRaw = extractFromInfoBlocks(infoBlocks, { key: 'Базовая цена продажи' }) ?? data.price ?? null;
        const price = parsePrice(priceRaw);
        const freshness = extractFromInfoBlocks(infoBlocks, { key: 'Свежесть' }) ?? data.freshness ?? null;
        const description = data.infoBlocks?.find((b: any) => b.text?.lines?.ru)?.text?.lines?.ru
          ?? data.description?.lines?.ru
          ?? data.description
          ?? '';

        await prisma.artefact.upsert({
          where: { id },
          update: {
            category: 'artefact',
            artefactClass: className,
            color: data.color ?? '',
            state: data.status?.state ?? '',
            weight,
            durability,
            maxDurability,
            price,
            freshness,
            description,
            iconUrl,
          },
          create: {
            id,
            category: 'artefact',
            artefactClass: className,
            color: data.color ?? '',
            state: data.status?.state ?? '',
            weight,
            durability,
            maxDurability,
            price,
            freshness,
            description,
            iconUrl,
          },
        });

        await prisma.artefactName.createMany({
          data: Object.entries(data.name?.lines ?? {}).map(([lang, name]) => ({
            artefactId: id,
            lang,
            name: String(name),
          })),
        });

        // Эффекты (range)
        const effects = extractRangeStats(infoBlocks);
        if (effects.length) {
          await prisma.artefactEffect.createMany({
            data: effects.map(({ statKey, min, max }) => ({
              artefactId: id,
              effectKey: statKey,
              minValue: min,
              maxValue: max,
            })),
          });
        }

        console.log(`✅ artefact/${sub}/${id}`);
      } catch (err) {
        console.error(`❌ artefact/${sub}/${id}:`, err);
      }
    }
  }
}

export async function parseContainers() {
  const ids = await fetchFileList('containers');

  for (const id of ids) {
    try {
      const data = await fetchJson<any>(`https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/ru/items/containers/${id}.json`);
      const iconUrl = buildIconUrl('containers', undefined, id);
      await resetContainerRelations(id);

      const infoBlocks = data.infoBlocks ?? [];
      const rank = extractFromInfoBlocks(infoBlocks, { key: 'Ранг' }) ?? data.rank ?? '';
      const className = extractFromInfoBlocks(infoBlocks, { key: 'Класс' }) ?? data.class ?? '';
      const weight = extractNumericFromInfoBlocks(infoBlocks, 'Вес') ?? data.weight ?? 0;
      const capacity = extractNumericFromInfoBlocks(infoBlocks, 'Вместимость') ?? data.capacity ?? null;
      const description = data.infoBlocks?.find((b: any) => b.text?.lines?.ru)?.text?.lines?.ru
        ?? data.description?.lines?.ru
        ?? data.description
        ?? '';

      // Статы
      const stats = [];
      for (const block of infoBlocks) {
        for (const el of block.elements ?? []) {
          if (el.type === 'numeric' && el.name?.lines?.ru) {
            stats.push({
              statKey: el.name.lines.ru,
              value: Number(el.value),
            });
          }
        }
      }

      await prisma.container.upsert({
        where: { id },
        update: {
          category: 'container',
          containerClass: className,
          rank,
          state: data.status?.state ?? '',
          weight,
          capacity,
          iconUrl,
          description,
        },
        create: {
            id,
            category: 'container',
            containerClass: className,
            rank,
            color: data.color ?? '',
            state: data.status?.state ?? '',
            weight,
            capacity,
            iconUrl,
            description,
            names: {
            create: Object.entries(data.name?.lines ?? {}).map(([lang, name]) => ({
                lang,
                name: String(name),
            })),
            },
            stats: {
            create: stats.map(({ statKey, value }) => ({
                statKey,
                value,
            })),
            },
        },
        });

      await prisma.containerName.createMany({
        data: Object.entries(data.name?.lines ?? {}).map(([lang, name]) => ({
          containerId: id,
          lang,
          name: String(name),
        })),
      });

      await prisma.containerStat.createMany({
        data: stats.map(({ statKey, value }) => ({
          containerId: id,
          statKey,
          value,
        })),
      });

      console.log(`✅ container/${id}`);
    } catch (err) {
      console.error(`❌ container/${id}:`, err);
    }
  }
}

