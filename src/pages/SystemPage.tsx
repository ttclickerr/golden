// SystemPage.tsx
import React, { useState, useEffect } from 'react';
import { FaChevronRight, FaCog, FaChartBar, FaAd, FaDatabase, FaMoneyBill, FaRocket, FaList, FaQuestionCircle } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';

const sections = [
  {
    key: 'ads',
    label: 'Реклама',
    icon: <FaAd color="#facc15" />, 
    description: 'Настройки и тестирование рекламных SDK (AdMob, IronSource и др.)',
  },
  {
    key: 'analytics',
    label: 'Аналитика',
    icon: <FaChartBar color="#22c55e" />, 
    description: 'Интеграция и тест аналитики (AppsFlyer, AppMetrica и др.)',
  },
  {
    key: 'payments',
    label: 'Платежи',
    icon: <FaMoneyBill color="#38bdf8" />, 
    description: 'Платежные системы, тестовые покупки, статусы',
  },
  {
    key: 'backend',
    label: 'Backend',
    icon: <FaDatabase color="#a78bfa" />, 
    description: 'Статус API, логи, соединение, диагностика',
  },
  {
    key: 'boosters',
    label: 'Бустеры',
    icon: <FaRocket color="#f472b6" />, 
    description: 'Настройки игровых бустеров и наград',
  },
  {
    key: 'logs',
    label: 'Логи',
    icon: <FaList color="#f87171" />, 
    description: 'Просмотр и фильтрация логов системы',
  },
  {
    key: 'help',
    label: 'Справка',
    icon: <FaQuestionCircle color="#fff" />, 
    description: 'FAQ, советы, контакты поддержки',
  },
];

export default function SystemPage() {
  const [activeSection, setActiveSection] = useState<string|null>(null);

  return (
    <div style={{background:'#10182b',minHeight:'100vh',color:'#fff',padding:0}}>
      <div style={{position:'sticky',top:0,background:'#181f36',padding:'18px 24px',display:'flex',alignItems:'center',gap:16,boxShadow:'0 2px 8px #0002',zIndex:10}}>
        <FaCog size={24} style={{marginRight:8}} />
        <span style={{fontSize:24,fontWeight:700}}>Система</span>
        {activeSection && (
          <>
            <FaChevronRight style={{margin:'0 8px'}} />
            <span style={{fontSize:20,fontWeight:600}}>{sections.find(s=>s.key===activeSection)?.label}</span>
            <button onClick={()=>setActiveSection(null)} style={{marginLeft:'auto',background:'none',border:'none',color:'#fff',fontSize:16,cursor:'pointer'}}>Назад</button>
          </>
        )}
      </div>
      {!activeSection && (
        <div style={{maxWidth:600,margin:'32px auto 0',display:'flex',flexDirection:'column',gap:18}}>
          {sections.map(sec => (
            <div key={sec.key} style={{display:'flex',alignItems:'center',background:'#181f36',borderRadius:12,padding:'18px 20px',boxShadow:'0 2px 8px #0002',cursor:'pointer',transition:'background 0.2s'}} 
              onClick={()=>setActiveSection(sec.key)}
              title={sec.description}
            >
              <div style={{marginRight:18,fontSize:22}}>{sec.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:18}}>{sec.label}</div>
                <div style={{color:'#aaa',fontSize:14,marginTop:2}}>{sec.description}</div>
              </div>
              <FaChevronRight color="#64748b" size={20} />
            </div>
          ))}
        </div>
      )}
      {activeSection === 'ads' && (
        <AdsSettings onBack={()=>setActiveSection(null)} />
      )}
      {activeSection === 'analytics' && (
        <AnalyticsSettings onBack={()=>setActiveSection(null)} />
      )}
      {activeSection === 'payments' && (
        <PaymentsSettings onBack={()=>setActiveSection(null)} />
      )}
      {activeSection === 'backend' && (
        <BackendSettings onBack={()=>setActiveSection(null)} />
      )}
      {activeSection === 'boosters' && (
        <BoostersSettings onBack={()=>setActiveSection(null)} />
      )}
      {activeSection === 'logs' && (
        <LogsPanel onBack={()=>setActiveSection(null)} />
      )}
      {activeSection === 'help' && (
        <HelpPanel onBack={()=>setActiveSection(null)} />
      )}
    </div>
  );
}

// --- Заглушки для секций ---
function AdsSettings({onBack}:{onBack:()=>void}) {
  const [admobEnabled, setAdmobEnabled] = useState(true);
  const [ironsourceEnabled, setIronsourceEnabled] = useState(true);
  const [showAdmobDetails, setShowAdmobDetails] = useState(false);
  const [showIronSourceDetails, setShowIronSourceDetails] = useState(false);
  const [admobConfig, setAdmobConfig] = useState({
    VITE_ADMOB_APP_ID: '',
    VITE_ADMOB_BANNER_ID: '',
    VITE_ADMOB_INTERSTITIAL_ID: '',
    VITE_ADMOB_REWARDED_ID: '',
  });
  const [ironsourceConfig, setIronSourceConfig] = useState({
    VITE_IRONSOURCE_APP_KEY: '',
    VITE_IRONSOURCE_BANNER_ID: '',
    VITE_IRONSOURCE_INTERSTITIAL_ID: '',
    VITE_IRONSOURCE_NATIVE_ID: '',
    VITE_IRONSOURCE_REWARDED_ID: '',
  });

  // Автозагрузка env (только для UI)
  React.useEffect(() => {
    fetch('/.env').then(r => r.text()).then(text => {
      const lines = text.split('\n');
      const admob: any = { ...admobConfig };
      const iron: any = { ...ironsourceConfig };
      lines.forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) {
          if (admob.hasOwnProperty(k.trim())) admob[k.trim()] = v.trim();
          if (iron.hasOwnProperty(k.trim())) iron[k.trim()] = v.trim();
        }
      });
      setAdmobConfig(admob);
      setIronSourceConfig(iron);
    });
  }, []);

  function handleAdmobChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAdmobConfig({ ...admobConfig, [e.target.name]: e.target.value });
  }
  function handleIronSourceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIronSourceConfig({ ...ironsourceConfig, [e.target.name]: e.target.value });
  }

  return (
    <SectionCard title="Реклама" onBack={onBack}>
      <div style={{marginBottom:24}}>
        <label style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <input type="checkbox" checked={admobEnabled} onChange={e=>setAdmobEnabled(e.target.checked)} />
          <span>AdMob</span>
          <span title="Включить или отключить показ рекламы AdMob" style={{color:'#aaa',fontSize:14,cursor:'help'}}>ℹ️</span>
        </label>
        <button onClick={()=>setShowAdmobDetails(v=>!v)} style={{marginBottom:8,background:'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>
          {showAdmobDetails ? 'Скрыть настройки AdMob' : 'Показать настройки AdMob'}
        </button>
        {showAdmobDetails && (
          <div style={{background:'#222',borderRadius:8,padding:16,marginBottom:12}}>
            {Object.entries(admobConfig).map(([key, value]) => (
              <div key={key} style={{marginBottom:10}}>
                <label style={{fontWeight:600,marginRight:8}} htmlFor={key}>{key}</label>
                <input
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleAdmobChange}
                  style={{padding:'4px 8px',borderRadius:6,border:'1px solid #444',width:320,background:'#181f36',color:'#fff'}}
                  title={`ID или ключ для AdMob. Измените и сохраните. Для применения — обновите .env и перезапустите фронт.`}
                />
              </div>
            ))}
          </div>
        )}
        <label style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <input type="checkbox" checked={ironsourceEnabled} onChange={e=>setIronsourceEnabled(e.target.checked)} />
          <span>IronSource</span>
          <span title="Включить или отключить показ рекламы IronSource" style={{color:'#aaa',fontSize:14,cursor:'help'}}>ℹ️</span>
        </label>
        <button onClick={()=>setShowIronSourceDetails(v=>!v)} style={{marginBottom:8,background:'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>
          {showIronSourceDetails ? 'Скрыть настройки IronSource' : 'Показать настройки IronSource'}
        </button>
        {showIronSourceDetails && (
          <div style={{background:'#222',borderRadius:8,padding:16,marginBottom:12}}>
            {Object.entries(ironsourceConfig).map(([key, value]) => (
              <div key={key} style={{marginBottom:10}}>
                <label style={{fontWeight:600,marginRight:8}} htmlFor={key}>{key}</label>
                <input
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleIronSourceChange}
                  style={{padding:'4px 8px',borderRadius:6,border:'1px solid #444',width:320,background:'#181f36',color:'#fff'}}
                  title={`ID или ключ для IronSource. Измените и сохраните. Для применения — обновите .env и перезапустите фронт.`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{marginTop:24}}>
        <b>Тестовые действия:</b>
        <div style={{display:'flex',gap:12,marginTop:8}}>
          <button style={{background:'#22c55e',color:'#10182b',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,cursor:'pointer'}} title="Показать тестовый баннер AdMob/IronSource">Показать баннер</button>
          <button style={{background:'#facc15',color:'#10182b',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,cursor:'pointer'}} title="Показать interstitial рекламу">Показать Interstitial</button>
          <button style={{background:'#38bdf8',color:'#10182b',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,cursor:'pointer'}} title="Показать rewarded рекламу">Показать Rewarded</button>
        </div>
        <div style={{color:'#aaa',fontSize:13,marginTop:8}}>Для применения изменений обновите .env и перезапустите фронт.</div>
      </div>
    </SectionCard>
  );
}
function AnalyticsSettings({onBack}:{onBack:()=>void}) {
  const [enabled, setEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [config, setConfig] = useState({
    VITE_APPSFLYER_DEV_KEY: '',
    VITE_APPMETRICA_API_KEY: '',
  });
  const [events, setEvents] = useState<string[]>([]);
  const [systems, setSystems] = useState([
    { name: 'AppsFlyer', key: 'VITE_APPSFLYER_DEV_KEY', status: false, icon: '🟦', doc: 'https://support.appsflyer.com/hc/ru/articles/207032066' },
    { name: 'AppMetrica', key: 'VITE_APPMETRICA_API_KEY', status: false, icon: '🟩', doc: 'https://appmetrica.yandex.ru/docs/mobile-sdk-dg/concepts/quickstart.html' },
    { name: 'IronSource', key: 'VITE_IRONSOURCE_APP_KEY', status: false, icon: '🟧', doc: 'https://developers.is.com/ironsource-mobile/android/analytics/' },
    { name: 'Firebase', key: 'VITE_FIREBASE_API_KEY', status: false, icon: '🟨', doc: 'https://firebase.google.com/docs/analytics' },
    { name: 'Vercel Analytics', key: '', status: true, icon: '⚡', doc: 'https://vercel.com/docs/analytics' },
  ]);
  const [logs, setLogs] = useState<string[]>([]);

  React.useEffect(() => {
    // Загрузка env для статуса SDK
    fetch('/.env').then(r => r.text()).then(text => {
      const lines = text.split('\n');
      setSystems(systems => systems.map(sys => {
        if (!sys.key) return { ...sys, status: true };
        const found = lines.find(line => line.startsWith(sys.key + '='));
        return { ...sys, status: !!(found && found.split('=')[1]) };
      }));
    });
    // Загрузка событий аналитики
    import(/* @vite-ignore */ '../lib/analytics-universal').then(mod => {
      if (mod.AnalyticsEvents) {
        setEvents(Object.entries(mod.AnalyticsEvents).map(([k, v]) => `${v}`));
      }
    });
    // Загрузка логов аналитики и статистики
    fetch('http://localhost:3001/api/logs').then(r=>r.json()).then(data=>{
      setLogs(data.filter((l:string)=>l.includes('/api/analytics')||l.includes('/api/stats')));
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfig({ ...config, [e.target.name]: e.target.value });
  }

  return (
    <SectionCard title="Аналитика" onBack={onBack}>
      <div style={{marginBottom:24}}>
        <label style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
          <span>Включить аналитику</span>
          <span title="Включить или отключить отправку аналитики (AppsFlyer, AppMetrica)" style={{color:'#aaa',fontSize:14,cursor:'help'}}>ℹ️</span>
        </label>
        <button onClick={()=>setShowDetails(v=>!v)} style={{marginBottom:8,background:'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>
          {showDetails ? 'Скрыть настройки' : 'Показать настройки'}
        </button>
        {showDetails && (
          <div style={{background:'#222',borderRadius:8,padding:16,marginBottom:12}}>
            {Object.entries(config).map(([key, value]) => (
              <div key={key} style={{marginBottom:10}}>
                <label style={{fontWeight:600,marginRight:8}} htmlFor={key}>{key}</label>
                <input
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  style={{padding:'4px 8px',borderRadius:6,border:'1px solid #444',width:320,background:'#181f36',color:'#fff'}}
                  title={`ID или ключ для аналитики. Измените и сохраните. Для применения — обновите .env и перезапустите фронт.`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{marginBottom:32}}>
        <b>Подключённые системы:</b>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:8}}>
          {systems.map(sys => (
            <div key={sys.name} style={{background:'#181f36',borderRadius:8,padding:'10px 16px',display:'flex',alignItems:'center',gap:8,minWidth:160,boxShadow:'0 2px 8px #0002'}} title={sys.status ? 'Активно' : 'Неактивно'}>
              <span style={{fontSize:22}}>{sys.icon}</span>
              <span style={{fontWeight:600}}>{sys.name}</span>
              <span style={{color:sys.status?'#22c55e':'#ef4444',fontWeight:700}}>{sys.status?'✔️':'⛔'}</span>
              <a href={sys.doc} target="_blank" rel="noopener noreferrer" style={{marginLeft:8,color:'#38bdf8',fontSize:14,textDecoration:'underline'}}>Документация</a>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:32}}>
        <b>События аналитики:</b>
        <div style={{background:'#222',borderRadius:8,padding:16,maxHeight:180,overflowY:'auto',marginTop:8,fontSize:15,lineHeight:1.7}}>
          {events.length === 0 ? 'Нет данных' : events.map(ev => <div key={ev}>• <span style={{color:'#facc15'}}>{ev}</span></div>)}
        </div>
        <div style={{color:'#aaa',fontSize:13,marginTop:8}}>Список всех событий, которые может отправлять игра.</div>
      </div>
      <div style={{marginBottom:16}}>
        <b>Логи аналитики и статистики:</b>
        <div style={{background:'#232b4a',borderRadius:8,padding:12,maxHeight:180,overflowY:'auto',marginTop:8,fontSize:13,lineHeight:1.5}}>
          {logs.length === 0 ? 'Нет логов' : logs.map((log, i) => <div key={i} style={{color:log.includes('analytics')?'#38bdf8':'#facc15'}}>{log}</div>)}
        </div>
        <div style={{color:'#aaa',fontSize:13,marginTop:8}}>Здесь отображаются только логи аналитики и статистики за последние действия.</div>
      </div>
      <div style={{color:'#aaa',fontSize:13,marginTop:16}}>
        Для применения изменений обновите .env и перезапустите фронт.<br/>
        Наведите на систему или событие для подробностей.
      </div>
    </SectionCard>
  );
}
function PaymentsSettings({onBack}:{onBack:()=>void}) {
  const [enabled, setEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [config, setConfig] = useState({
    VITE_STRIPE_KEY: '',
    VITE_PAYMENTS_PROVIDER: '',
    VITE_PAYMENTS_TEST_MODE: '',
  });
  const [testAmount, setTestAmount] = useState('100');
  const [testResult, setTestResult] = useState<string|null>(null);

  React.useEffect(() => {
    fetch('/.env').then(r => r.text()).then(text => {
      const lines = text.split('\n');
      const cfg: any = { ...config };
      lines.forEach(line => {
        const [k, v] = line.split('=');
        if (k && v && cfg.hasOwnProperty(k.trim())) cfg[k.trim()] = v.trim();
      });
      setConfig(cfg);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfig({ ...config, [e.target.name]: e.target.value });
  }

  async function handleTestPayment() {
    setTestResult('Ожидание ответа...');
    try {
      const res = await fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(testAmount) })
      });
      const data = await res.json();
      setTestResult(data.success ? 'Платёж успешно отправлен!' : 'Ошибка платежа');
    } catch {
      setTestResult('Ошибка соединения с backend');
    }
  }

  return (
    <SectionCard title="Платежи" onBack={onBack}>
      <div style={{marginBottom:24}}>
        <label style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
          <span>Включить платежи</span>
          <span title="Включить или отключить платёжную систему (Stripe, IAP и др.)" style={{color:'#aaa',fontSize:14,cursor:'help'}}>ℹ️</span>
        </label>
        <button onClick={()=>setShowDetails(v=>!v)} style={{marginBottom:8,background:'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',cursor:'pointer'}}>
          {showDetails ? 'Скрыть настройки' : 'Показать настройки'}
        </button>
        {showDetails && (
          <div style={{background:'#222',borderRadius:8,padding:16,marginBottom:12}}>
            {Object.entries(config).map(([key, value]) => (
              <div key={key} style={{marginBottom:10}}>
                <label style={{fontWeight:600,marginRight:8}} htmlFor={key}>{key}</label>
                <input
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  style={{padding:'4px 8px',borderRadius:6,border:'1px solid #444',width:320,background:'#181f36',color:'#fff'}}
                  title={`ID или ключ для платежной системы. Измените и сохраните. Для применения — обновите .env и перезапустите фронт.`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{marginTop:24}}>
        <b>Тестовые действия:</b>
        <div style={{display:'flex',gap:12,marginTop:8,alignItems:'center'}}>
          <input type="number" min="1" value={testAmount} onChange={e=>setTestAmount(e.target.value)} style={{width:90,padding:'4px 8px',borderRadius:6,border:'1px solid #444',background:'#181f36',color:'#fff'}} title="Сумма для тестового платежа" />
          <button style={{background:'#22c55e',color:'#10182b',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:600,cursor:'pointer'}} title="Отправить тестовый платёж" onClick={handleTestPayment}>Тестовый платёж</button>
          {testResult && <span style={{marginLeft:12,color:'#facc15'}}>{testResult}</span>}
        </div>
        <div style={{color:'#aaa',fontSize:13,marginTop:8}}>Для применения изменений обновите .env и перезапустите фронт.</div>
      </div>
    </SectionCard>
  );
}
function BackendSettings({onBack}:{onBack:()=>void}) {
  const [admobEcpm, setAdmobEcpm] = useState<number|null>(null);
  const [ironsourceEcpm, setIronSourceEcpm] = useState<number|null>(null);
  const [ecpmHistory, setEcpmHistory] = useState<any[]>([]);
  useEffect(() => {
    setAdmobEcpm(Number(localStorage.getItem('admob_ecpm'))||null);
    setIronSourceEcpm(Number(localStorage.getItem('ironsource_ecpm'))||null);
    fetch('http://localhost:3001/api/ecpm-history').then(r=>r.json()).then(setEcpmHistory);
    const interval = setInterval(() => {
      fetch('http://localhost:3001/api/ecpm-history').then(r=>r.json()).then(setEcpmHistory);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  // График eCPM
  const chartData = {
    labels: ecpmHistory.map(e=>new Date(e.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'AdMob',
        data: ecpmHistory.filter(e=>e.sdk==='admob').map(e=>e.value),
        borderColor: '#facc15',
        backgroundColor: 'rgba(250,204,21,0.2)',
        tension: 0.3,
      },
      {
        label: 'IronSource',
        data: ecpmHistory.filter(e=>e.sdk==='ironsource').map(e=>e.value),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.2)',
        tension: 0.3,
      }
    ]
  };
  return (
    <SectionCard title="Backend / eCPM" onBack={onBack}>
      <div style={{marginBottom:24}}>
        <b>Текущий eCPM (по данным SDK/аналитики):</b>
        <div style={{marginTop:8,display:'flex',gap:24,alignItems:'center'}}>
          <span style={{background:'#232b4a',padding:'8px 18px',borderRadius:8,color:'#facc15',fontWeight:600}}>AdMob: {admobEcpm!==null?`$${admobEcpm.toFixed(2)}`:'—'}</span>
          <span style={{background:'#232b4a',padding:'8px 18px',borderRadius:8,color:'#38bdf8',fontWeight:600}}>IronSource: {ironsourceEcpm!==null?`$${ironsourceEcpm.toFixed(2)}`:'—'}</span>
        </div>
        <div style={{color:'#aaa',fontSize:13,marginTop:8}}>Значения обновляются при каждом аукционе (нажатии на бустер).</div>
      </div>
      <div style={{marginBottom:32}}>
        <b>График eCPM (история):</b>
        <div style={{background:'#232b4a',borderRadius:8,padding:16,marginTop:8}}>
          {ecpmHistory.length < 2 ? 'Недостаточно данных для графика' : (
            <Line data={chartData} options={{responsive:true,plugins:{legend:{labels:{color:'#fff'}}},scales:{x:{ticks:{color:'#aaa'}},y:{ticks:{color:'#aaa'}}}}} />
          )}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <b>История eCPM:</b>
        <div style={{background:'#232b4a',borderRadius:8,padding:12,maxHeight:180,overflowY:'auto',marginTop:8,fontSize:13,lineHeight:1.5}}>
          {ecpmHistory.length === 0 ? 'Нет истории' : ecpmHistory.slice(-20).reverse().map((e,i)=>(
            <div key={i} style={{color:e.sdk==='admob'?'#facc15':'#38bdf8'}}>
              [{new Date(e.timestamp).toLocaleTimeString()}] {e.sdk.toUpperCase()}: ${e.value.toFixed(2)} ({e.source})
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
function BoostersSettings({onBack}:{onBack:()=>void}) {
  return <SectionCard title="Бустеры" onBack={onBack}>Настройки игровых бустеров и наград<br/>[Тут будут слайдеры, ручные настройки, тестовые действия]</SectionCard>;
}
function LogsPanel({onBack}:{onBack:()=>void}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<number|null>(null);

  React.useEffect(() => {
    fetch('http://localhost:3001/api/logs').then(r=>r.json()).then(data=>{
      setLogs(data);
    });
  }, []);

  function getType(log: string) {
    if (log.includes('/api/analytics')) return 'analytics';
    if (log.includes('/api/stats')) return 'stats';
    if (log.includes('/api/leaderboard')) return 'leaderboard';
    if (log.includes('/api/ads')||log.includes('/api/admob')||log.includes('/api/ironsource')) return 'ads';
    if (log.includes('/api/payments')) return 'payments';
    return 'other';
  }

  const filteredLogs = logs.filter(log => filter==='all' || getType(log)===filter);

  return (
    <SectionCard title="Логи backend" onBack={onBack}>
      <div style={{marginBottom:18,display:'flex',gap:12,flexWrap:'wrap'}}>
        <button onClick={()=>setFilter('all')} style={{background:filter==='all'?'#22c55e':'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}>Все</button>
        <button onClick={()=>setFilter('analytics')} style={{background:filter==='analytics'?'#38bdf8':'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}>Аналитика</button>
        <button onClick={()=>setFilter('stats')} style={{background:filter==='stats'?'#facc15':'#232b4a',color:'#10182b',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}>Статистика</button>
        <button onClick={()=>setFilter('leaderboard')} style={{background:filter==='leaderboard'?'#a78bfa':'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}>Лидерборд</button>
        <button onClick={()=>setFilter('ads')} style={{background:filter==='ads'?'#f472b6':'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}>Реклама</button>
        <button onClick={()=>setFilter('payments')} style={{background:filter==='payments'?'#38bdf8':'#232b4a',color:'#fff',border:'none',borderRadius:6,padding:'4px 14px',fontWeight:600,cursor:'pointer'}}>Платежи</button>
      </div>
      <div style={{background:'#232b4a',borderRadius:8,padding:12,maxHeight:400,overflowY:'auto',fontSize:13,lineHeight:1.5}}>
        {filteredLogs.length === 0 ? 'Нет логов' : filteredLogs.map((log, i) => {
          const isJson = log.includes('body: {') || log.includes('body: {"');
          const [head, ...rest] = log.split('body:');
          let body = rest.join('body').trim();
          let pretty = '';
          try {
            if (body.startsWith('{')) pretty = JSON.stringify(JSON.parse(body.replace(/'/g,'"')), null, 2);
          } catch {}
          return (
            <div key={i} style={{marginBottom:10,background:expanded===i?'#181f36':'none',borderRadius:6,padding:expanded===i?8:0,cursor:isJson?'pointer':'default'}} onClick={()=>isJson?setExpanded(expanded===i?null:i):null} title={isJson?'Кликните для подробностей':''}>
              <span style={{color:'#aaa'}}>{head}</span>
              {isJson && expanded===i && pretty && (
                <pre style={{background:'#10182b',color:'#facc15',borderRadius:6,padding:8,marginTop:4,overflowX:'auto'}}>{pretty}</pre>
              )}
            </div>
          );
        })}
      </div>
      <div style={{color:'#aaa',fontSize:13,marginTop:8}}>
        Фильтруйте логи по типу события. Клик по строке с JSON — подробности.<br/>
        Логи обновляются при открытии раздела.
      </div>
    </SectionCard>
  );
}
function HelpPanel({onBack}:{onBack:()=>void}) {
  return <SectionCard title="Справка" onBack={onBack}>FAQ, советы, контакты поддержки<br/>[Тут будут подсказки, ссылки, документация]</SectionCard>;
}

function SectionCard({title,children,onBack}:{title:string,children:any,onBack:()=>void}) {
  return (
    <div style={{maxWidth:600,margin:'32px auto',background:'#181f36',borderRadius:16,padding:'32px 28px',boxShadow:'0 2px 8px #0002',position:'relative'}}>
      <div style={{position:'absolute',left:24,top:24}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'#fff',fontSize:18,cursor:'pointer'}} title="Назад">←</button>
      </div>
      <div style={{textAlign:'center',fontSize:24,fontWeight:700,marginBottom:18}}>{title}</div>
      <div style={{fontSize:16,lineHeight:1.7}}>{children}</div>
    </div>
  );
}
