import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173', channel: 'msedge' },
  webServer: { command: 'node server.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  reporter: 'list',
});
