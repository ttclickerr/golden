@echo off
echo 🚀 Golden Tycoon Client - Системный запуск
cd /d "%~dp0"
echo 📁 Папка: %CD%
echo 🎯 Запуск на порту 3000...
echo.
node start-client.js
pause
