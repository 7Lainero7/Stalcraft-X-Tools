import { fetchJson } from './github.service';
import prisma from '../database/database.service';

const BASE = 'https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/ru/items/armor';
const ICON_BASE = 'https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/ru/icons/armor';

export async function parseArmor() {
  const variantUrl = `${BASE}/_variants`;
  const variants = await fetchJson<string[]>(variantUrl);

  for (const id of variants) {
    const armorData = await fetchJson<any>(`${BASE}/${id}.json`);

    await prisma.armor.upsert({
      where: { id },
      update: {}, // или обновляй нужные поля
      create: {
        id,
        category: 'armor',
        class: armorData.class,
        rank: armorData.rank,
        color: armorData.color,
        state: armorData.state,
        weight: armorData.weight,
        durability: armorData.durability,
        max_durability: armorData.max_durability,
        description: armorData.description,
        compatibleBackpacks: armorData.compatibleBackpacks ?? '',
        compatibleContainers: armorData.compatibleContainers ?? '',
        iconUrl: `${ICON_BASE}/${id}.png`,

        names: {
          create: Object.entries(armorData.name_i18n).map(([lang, name]) => ({
            lang,
            name,
          })),
        },

        stats: {
          create: Object.entries(armorData.stats).map(([key, value]) => ({
            statKey: key,
            value: Number(value),
          })),
        },
      },
    });

    console.log(`✅ ${id} — успешно записан`);
  }
}
