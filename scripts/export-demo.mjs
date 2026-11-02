import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve('docs/demo');

if (existsSync(output)) {
  rmSync(output, { recursive: true, force: true });
}

const result = spawnSync(
  'npx',
  ['expo', 'export', '-p', 'web', '--output-dir', output],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      EXPO_PUBLIC_DEMO: '1',
      EXPO_BASE_URL: '/reminder/demo',
    },
  },
);

process.exit(result.status ?? 1);
