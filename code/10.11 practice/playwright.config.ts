import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // 1. Устанавливаем реалистичный User-Agent (как у обычного Chrome)
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    
    launchOptions: {
      // 2. Отключаем флаг, который сайты используют для детекции автоматизации
      args: ['--disable-blink-features=AutomationControlled'],
    },
  },
});
