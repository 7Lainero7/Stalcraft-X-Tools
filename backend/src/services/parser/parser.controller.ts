import { parseArmor } from './item-parser.service';

export async function runParsers() {
  console.log('🚀 Начало парсинга...');
  await parseArmor();
  console.log('🎉 Готово!');
}
