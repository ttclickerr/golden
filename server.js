// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Логгер для всех запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | body:`, req.body);
  next();
});

// --- Логирование в память ---
const logEntries = [];
const MAX_LOGS = 200;

function addLog(entry) {
  logEntries.push(entry);
  if (logEntries.length > MAX_LOGS) logEntries.shift();
}

app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url} | body: ${JSON.stringify(req.body)}`;
  console.log(log);
  addLog(log);
  next();
});

app.get('/api/logs', (req, res) => {
  res.json(logEntries.slice(-MAX_LOGS));
});

// --- Лидерборд ---
app.get('/api/leaderboard', (req, res) => {
  console.log('Leaderboard requested');
  res.json([
    { username: 'Player1', score: 1000 },
    { username: 'Player2', score: 800 },
    { username: 'Player3', score: 600 },
  ]);
});

// --- Статистика ---
app.get('/api/stats', (req, res) => {
  console.log('Stats requested');
  res.json({
    activeUsers: 123,
    gamesPlayed: 456,
    revenue: 789.01,
    adViews: 321,
    rewardsGiven: 111,
  });
});

// --- Аналитика ---
app.post('/api/analytics', (req, res) => {
  console.log('Analytics event:', req.body);
  res.json({ success: true, received: req.body });
});

// --- Реклама ---
app.post('/api/ads', (req, res) => {
  console.log('Ad event:', req.body);
  res.json({ success: true, received: req.body });
});

// --- Платежи ---
app.post('/api/payments', (req, res) => {
  console.log('Payment event:', req.body);
  res.json({ success: true, received: req.body });
});

// --- Логи для IronSource/AdMob ---
app.post('/api/admob', (req, res) => {
  console.log('AdMob event:', req.body);
  res.json({ success: true });
});

app.post('/api/ironsource', (req, res) => {
  console.log('IronSource event:', req.body);
  res.json({ success: true });
});

// --- История eCPM ---
const ecpmHistory = [];
const MAX_ECPM_HISTORY = 200;

app.post('/api/ecpm-history', (req, res) => {
  const { sdk, value, source } = req.body;
  const entry = {
    sdk,
    value,
    source,
    timestamp: new Date().toISOString(),
  };
  ecpmHistory.push(entry);
  if (ecpmHistory.length > MAX_ECPM_HISTORY) ecpmHistory.shift();
  res.json({ success: true });
});

app.get('/api/ecpm-history', (req, res) => {
  res.json(ecpmHistory.slice(-MAX_ECPM_HISTORY));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
