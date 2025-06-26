# Tycoon Clicker Client

## Быстрый старт

1. Клонируйте репозиторий:
   ```powershell
   git clone https://github.com/ttclickerr/golden.git
   cd golden/client
   ```
2. Установите зависимости:
   ```powershell
   npm install
   ```
3. Проверьте и обновите зависимости:
   ```powershell
   npm outdated
   npm audit --audit-level=moderate
   ```
4. Проверьте сборку локально:
   ```powershell
   npm run build
   ```
5. Запустите локальный сервер (если нужно):
   ```powershell
   npm run dev
   ```

## Деплой на Vercel через CLI

1. Очистите кеш и старые сборки:
   ```powershell
   Remove-Item -Recurse -Force .next, dist, build, .vercel, node_modules
   ```
   Если возникнут ошибки доступа — закройте все процессы node и повторите команду или удалите вручную.
2. Установите зависимости:
   ```powershell
   npm install
   ```
3. Соберите проект:
   ```powershell
   npm run build
   ```
4. Залогиньтесь в Vercel:
   ```powershell
   npx vercel login
   ```
5. Задеплойте проект:
   ```powershell
   npx vercel --prod
   ```

## Автоматизация деплоя (CI/CD)

- Деплой и проверка происходят автоматически при пуше в ветки `main` или `master` через GitHub Actions (`.github/workflows/deploy-vercel.yml`).
- Для работы CI/CD добавьте секреты VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID и переменные окружения в GitHub → Settings → Secrets and variables → Actions.

## Системный план комплексной проверки

1. **Очистка кеша и старых сборок**
2. **Установка и аудит зависимостей**
3. **Проверка на устаревшие пакеты**
4. **Локальная сборка**
5. **Запуск autotest/GameSystemTest.ts (если есть автотесты)**
6. **Проверка git-статуса (git status, git diff)**
7. **Деплой через Vercel CLI или CI/CD**

## Для новых разработчиков
- Клонируйте репозиторий, выполните npm install, npm run build.
- Все секреты и переменные должны храниться только в GitHub/Vercel, а не в коде.
- Для вопросов — смотрите этот README.md или обращайтесь к тимлиду.
