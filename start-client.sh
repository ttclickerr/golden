#!/bin/bash
# Golden Tycoon Client Startup Script
# Решает проблемы с правами доступа и конфликтами package.json

set -e  # Остановить выполнение при ошибке

echo "🚀 Запуск Golden Tycoon Client..."

# Переходим в папку клиента
cd "$(dirname "$0")"

# Проверяем и исправляем права доступа для node_modules/.bin
echo "🔧 Проверка прав доступа..."
if [ -d "node_modules/.bin" ]; then
    chmod +x node_modules/.bin/* 2>/dev/null || true
    # Исправляем специфичные проблемы с esbuild на macOS
    if [ -d "../node_modules/vite/node_modules/@esbuild" ]; then
        find ../node_modules/vite/node_modules/@esbuild -name "esbuild" -type f -exec chmod +x {} \; 2>/dev/null || true
    fi
    if [ -d "node_modules/vite/node_modules/@esbuild" ]; then
        find node_modules/vite/node_modules/@esbuild -name "esbuild" -type f -exec chmod +x {} \; 2>/dev/null || true
    fi
fi

# Удаляем расширенные атрибуты macOS которые могут блокировать выполнение
echo "🧹 Очистка расширенных атрибутов macOS..."
if [ -d "node_modules/.bin" ]; then
    xattr -rc node_modules/.bin/ 2>/dev/null || true
fi

# Проверяем наличие зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Запускаем Vite с правильной конфигурацией
echo "🎯 Запуск Vite dev server на порту 3000..."
echo "🌐 Откройте http://localhost:3000 в браузере"
echo "💡 Нажмите Ctrl+C для остановки сервера"
echo ""

# Используем node напрямую чтобы избежать проблем с npm run dev
exec node node_modules/vite/bin/vite.js --config ./vite.config.ts --port 3000
