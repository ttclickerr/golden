#!/usr/bin/env node
/**
 * Golden Tycoon Client Starter
 * Системное решение для запуска без конфликтов
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Запуск Golden Tycoon Client...');

// Убеждаемся что мы в правильной папке
const clientDir = __dirname;
process.chdir(clientDir);

console.log('📁 Рабочая папка:', clientDir);

// Проверяем node_modules
const nodeModulesPath = path.join(clientDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Установка зависимостей...');
    const install = spawn('npm', ['install'], { stdio: 'inherit', cwd: clientDir });
    install.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Ошибка установки зависимостей');
            process.exit(1);
        }
        startVite();
    });
} else {
    startVite();
}

function startVite() {
    console.log('🎯 Запуск Vite dev server на порту 3000...');
    console.log('🌐 Откройте http://localhost:3000 в браузере');
    console.log('💡 Нажмите Ctrl+C для остановки сервера\n');
    
    const vitePath = path.join(clientDir, 'node_modules', 'vite', 'bin', 'vite.js');
    const configPath = path.join(clientDir, 'vite.config.ts');
    
    const vite = spawn('node', [
        vitePath,
        '--config', configPath,
        '--port', '3000'
    ], {
        stdio: 'inherit',
        cwd: clientDir
    });
    
    vite.on('close', (code) => {
        console.log(`\n⭐ Vite завершен с кодом ${code}`);
    });
    
    // Обработка сигналов для корректного завершения
    process.on('SIGINT', () => {
        console.log('\n🛑 Получен сигнал остановки...');
        vite.kill('SIGINT');
        process.exit(0);
    });
}
