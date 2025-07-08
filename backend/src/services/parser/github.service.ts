// src/services/parser/github.service.ts
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ошибка загрузки ${url}: ${res.status}`);
  return res.json();
}

const GITHUB_API_BASE = 'https://api.github.com/repos/EXBO-Studio/stalcraft-database/contents/ru/items';

/**
 * Получает список JSON-файлов из GitHub-папки.
 *
 * @param category Например: 'armor', 'artefact', 'containers'
 * @param subfolder Например: 'clothes', 'anomaly' — опционально
 * @returns Массив ID файлов (без .json)
 */
export async function fetchFileList(category: string, subfolder?: string): Promise<string[]> {
  const path = subfolder
    ? `${GITHUB_API_BASE}/${category}/${subfolder}`
    : `${GITHUB_API_BASE}/${category}`;

  const data = await fetchJson<{ name: string }[]>(path);

  return data
    .filter(item => item.name.endsWith('.json'))
    .map(item => item.name.replace('.json', ''));
}
