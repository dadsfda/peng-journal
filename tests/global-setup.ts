import { execFileSync } from 'node:child_process';

export default async function globalSetup() {
  const buildEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('VITEST'))
  );

  buildEnv.NODE_ENV = 'production';

  const command = process.platform === 'win32' ? 'powershell' : 'npm';
  const args =
    process.platform === 'win32'
      ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'npm run build']
      : ['run', 'build'];

  execFileSync(command, args, {
    cwd: process.cwd(),
    stdio: 'pipe',
    env: buildEnv
  });
}
