import { execSync } from 'child_process';

export default function setup() {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}
