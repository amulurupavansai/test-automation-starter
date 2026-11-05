import * as fs from 'fs';
import * as path from 'path';
import { parseCsv } from './csv';

const dataDir = path.resolve(__dirname, '..', 'test-data');

export function readJson<T = unknown>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8')) as T;
}

export function readCsv(file: string): Record<string, string>[] {
  return parseCsv(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
}

/** Unique suffix so repeated runs never collide on unique fields such as email. */
export function uniqueId(prefix = 'qa'): string {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}
