 # Автотесты Playwright — Практика 10.11

 ## Структура проекта
 
 code/10.11/
 ├── package.json
 ├── playwright.config.ts
 ├── README.md
 └── tests/
     ├── happy-path.spec.ts  (зеленый)
     ├── bug-1.spec.ts       (красный)
     ├── bug-2.spec.ts       (красный)
     └── bug-3.spec.ts       (красный)


 ## Результаты прогона

 | Файл | Статус | Что проверяет |
 |---|---|---|
 | happy-path.spec.ts | ✅ PASS | Загрузка главной, форма поиска, логотип |
 | bug-1.spec.ts | ❌ FAIL | Дубликаты id (viewdirSearchForm, dirId) |
 | bug-2.spec.ts | ❌ FAIL | Картинки без alt (img_parts.png, img_wheels.png) |
 | bug-3.spec.ts | ❌ FAIL | Капча блокирует вход на /login |
 
