import cron from 'node-cron';
import { runParsers } from '../services/parser/parser.controller';


export function scheduleDailySync() {
  cron.schedule('0 3 * * *', async () => {
    console.log('🕒 [CRON] Синхронизация данных...');
    try {
      await runParsers();
      console.log('✅ Синхронизация прошла успешно');
    } catch (err) {
      console.error('❌ Ошибка при синхронизации:', err);
    }
  });
}
