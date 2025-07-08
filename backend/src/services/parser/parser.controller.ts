import { parseArmor, parseArtefacts, parseContainers } from './item-parser.service';

export async function runParsers() {
  console.log('Начинаем синхронизацию предметов...');
  await parseArmor();
  await parseArtefacts();
  await parseContainers();
  console.log('Все категории успешно синхронизированы!');
}
