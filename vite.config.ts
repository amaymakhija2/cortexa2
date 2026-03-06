import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Check if a port is in use via lsof (works on macOS/Linux)
function isPortInUse(port: number): boolean {
  try {
    execSync(`lsof -i :${port} -t`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function findOpenPort(start: number): number {
  let port = start;
  while (isPortInUse(port)) {
    port++;
  }
  return port;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const port = findOpenPort(3000);
    return {
      server: {
        port,
        strictPort: true,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
