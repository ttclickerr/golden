@echo off
REM Golden Tycoon Client Startup Script for Windows
REM Решает проблемы с правами доступа и конфликтами package.json

echo 🚀 Запуск Golden Tycoon Client...

REM Переходим в папку клиента
cd /d "%~dp0"

REM Проверяем наличие зависимостей
if not exist "node_modules" (
    echo 📦 Установка зависимостей...
    npm install
)

REM Запускаем Vite с правильной конфигурацией
echo 🎯 Запуск Vite dev server на порту 3000...
echo 🌐 Откройте http://localhost:3000 в браузере
echo 💡 Нажмите Ctrl+C для остановки сервера
echo.

REM Используем node напрямую чтобы избежать проблем с npm run dev
node node_modules\vite\bin\vite.js --config .\vite.config.ts --port 3000
