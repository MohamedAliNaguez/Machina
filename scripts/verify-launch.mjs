import { spawnSync } from 'node:child_process';
const result = spawnSync(
  process.execPath,
  ['--import', 'tsx', 'scripts/verify-launch.ts', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
  },
);
process.exit(result.status ?? 1);
