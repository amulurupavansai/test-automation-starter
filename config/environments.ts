import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export type EnvName = 'local' | 'dev' | 'staging';

const baseUrls: Record<EnvName, string> = {
  local: process.env.LOCAL_BASE_URL || 'http://localhost:4173',
  dev: process.env.DEV_BASE_URL || 'https://dev.app.example.test',
  staging: process.env.STAGING_BASE_URL || 'https://staging.app.example.test',
};

export const envName: EnvName = (process.env.TEST_ENV as EnvName) || 'local';

if (!(envName in baseUrls)) {
  throw new Error(`Unknown TEST_ENV "${envName}". Use one of: ${Object.keys(baseUrls).join(', ')}`);
}

export const baseURL = baseUrls[envName];

/** Credentials come from the environment; defaults are the demo app's FAKE account. */
export const credentials = {
  email: process.env.TEST_USER_EMAIL || 'qa.user@example.test',
  password: process.env.TEST_USER_PASSWORD || 'Passw0rd!demo',
};

/** The bundled demo app is only started when running against "local". */
export const useDemoApp = envName === 'local';
