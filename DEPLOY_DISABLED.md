# 🚫 Автоматический деплой отключен

## Что изменилось
- Автоматический деплой при `git push` **ОТКЛЮЧЕН**
- Автоматический деплой при Pull Request **ОТКЛЮЧЕН**
- Ручной деплой через GitHub Actions **РАБОТАЕТ**

## Как запустить деплой вручную
1. Перейдите на GitHub: https://github.com/ttclickerr/golden
2. Откройте вкладку "Actions"
3. Выберите "Deploy to Vercel (Manual Only)"
4. Нажмите "Run workflow"
5. Выберите ветку (обычно `master`)
6. Нажмите "Run workflow"

## Если нужно включить автодеплой обратно
Отредактируйте файл `.github/workflows/deploy-vercel.yml`:
```yaml
on:
  push:
    branches:
      - main  
      - master
  workflow_dispatch:
```

## Альтернативные способы деплоя
- Через Vercel CLI: `vercel --prod`
- Через скрипты: `npm run deploy:prod`
- Через Vercel Dashboard (при подключенном Git)

---
*Изменено: 21 июля 2025*
