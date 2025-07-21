# 🚫 ОТКЛЮЧЕНИЕ АВТОМАТИЧЕСКОГО ДЕПЛОЯ VERCEL

## Проблема найдена!
Деплой запускается НЕ через GitHub Actions, а через **прямую интеграцию Vercel с GitHub**.

## 🔍 Обнаруженные файлы автоматического деплоя:

1. **`.vercel/project.json`** - активная связка с Vercel проектом
2. **`vercel.json`** - конфигурация production деплоя
3. **GitHub integration** в Vercel Dashboard

## ⚠️ Два типа автоматического деплоя:

### ✅ GitHub Actions (УЖЕ ОТКЛЮЧЕН)
- Файл: `.github/workflows/deploy-vercel.yml`
- Статус: ✅ Отключен (только manual trigger)

### ❌ Vercel Dashboard Integration (АКТИВЕН)
- Vercel напрямую подключен к GitHub репозиторию
- Деплой запускается при каждом push в master

## 🛠️ Как отключить Vercel Integration:

### Способ 1: Через Vercel Dashboard
1. Перейти: https://vercel.com/dashboard
2. Найти проект: `golden` или `golden-tycoon-prod`
3. Settings → Git → Auto Deployments
4. **Отключить** "Automatic Deployments from Git"

### Способ 2: Отключить локально
```bash
# Удалить связку с Vercel проектом
rm -rf .vercel/
```

### Способ 3: Изменить ветку деплоя
В Vercel Dashboard изменить production branch с `master` на `production-only`

## 🎯 Рекомендуемое решение:
**Способ 1** - отключить автоматический деплой в Vercel Dashboard, оставив возможность ручного деплоя

## 📋 Проверка после исправления:
1. Сделать тестовый коммит
2. Проверить что деплой НЕ запустился
3. При необходимости запустить деплой вручную

---
*Создано: 21 июля 2025*
