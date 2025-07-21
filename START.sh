#!/bin/bash
echo "🚀 Golden Tycoon Client - Системный запуск"
cd "$(dirname "$0")"
echo "📁 Папка: $(pwd)"
echo "🎯 Запуск на порту 3000..."
echo ""
node start-client.js
