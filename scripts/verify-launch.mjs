import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/verify-launch.ts'], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
