import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adMobService } from '@/lib/admob';
import { adjustService } from '@/lib/adjust';
import { appsFlyerService } from '@/lib/appsflyer';
import { appMetricaService } from '@/lib/appmetrica';

export default function AdIdTestPage() {
  const [androidInfo, setAndroidInfo] = useState({
    isAndroid: false,
    version: 'Unknown',
    requiresAdIdPermission: false
  });
  
  const [permissionStatus, setPermissionStatus] = useState({
    checked: false,
    granted: false,
    adIdAvailable: false
  });
  
  const [testResults, setTestResults] = useState({
    adMob: { tested: false, success: false },
    adjust: { tested: false, success: false },
    appsFlyer: { tested: false, success: false },
    appMetrica: { tested: false, success: false }
  });
  
  const [logs, setLogs] = useState<string[]>([]);
  
  // Добавление лога
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  // Проверка Android версии
  useEffect(() => {
    const checkAndroidVersion = () => {
      const isAndroid = typeof window !== 'undefined' && 
                      window.navigator && 
                      /android/i.test(window.navigator.userAgent);
      
      let androidVersion = 'Unknown';
      let requiresAdIdPermission = false;
      
      if (isAndroid) {
        const userAgent = window.navigator.userAgent;
        const match = userAgent.match(/Android\s([0-9\.]*)/);
        if (match) {
          androidVersion = match[1];
          requiresAdIdPermission = parseFloat(androidVersion) >= 13;
        }
      }
      
      setAndroidInfo({
        isAndroid,
        version: androidVersion,
        requiresAdIdPermission
      });
      
      addLog(`Устройство: ${isAndroid ? 'Android ' + androidVersion : 'Не Android'}`);
      if (isAndroid) {
        addLog(`Требуется разрешение AD_ID: ${requiresAdIdPermission ? 'Да (Android 13+)' : 'Нет (Android < 13)'}`);
      }
    };
    
    checkAndroidVersion();
  }, []);
  
  // Проверка разрешения AD_ID
  const checkAdIdPermission = async () => {
    addLog('Проверка разрешения AD_ID...');
    
    try {
      // В реальном приложении здесь будет код для проверки разрешения
      // через Capacitor/Cordova или другой нативный мост
      
      // Имитация проверки разрешения
      const granted = true; // В реальном приложении здесь будет реальная проверка
      const adIdAvailable = androidInfo.requiresAdIdPermission ? granted : true;
      
      setPermissionStatus({
        checked: true,
        granted,
        adIdAvailable
      });
      
      addLog(`Разрешение AD_ID: ${granted ? 'Предоставлено' : 'Не предоставлено'}`);
      addLog(`Рекламный идентификатор доступен: ${adIdAvailable ? 'Да' : 'Нет'}`);
      
      return { granted, adIdAvailable };
    } catch (error) {
      addLog(`Ошибка при проверке разрешения: ${error}`);
      setPermissionStatus({
        checked: true,
        granted: false,
        adIdAvailable: false
      });
      return { granted: false, adIdAvailable: false };
    }
  };
  
  // Тестирование AdMob
  const testAdMob = async () => {
    addLog('Тестирование AdMob...');
    
    try {
      // Инициализация AdMob
      adMobService.initialize();
      adMobService.setConsentStatus(true);
      
      // Проверка доступности рекламы
      const isAvailable = adMobService.isAdAvailable('banner');
      
      setTestResults(prev => ({
        ...prev,
        adMob: { tested: true, success: isAvailable }
      }));
      
      addLog(`AdMob тест: ${isAvailable ? 'Успешно' : 'Неудачно'}`);
      
      return isAvailable;
    } catch (error) {
      addLog(`Ошибка при тестировании AdMob: ${error}`);
      setTestResults(prev => ({
        ...prev,
        adMob: { tested: true, success: false }
      }));
      return false;
    }
  };
  
  // Тестирование Adjust
  const testAdjust = async () => {
    addLog('Тестирование Adjust...');
    
    try {
      // Инициализация Adjust
      adjustService.initialize();
      
      // Отслеживание события
      adjustService.trackAppLaunch();
      
      setTestResults(prev => ({
        ...prev,
        adjust: { tested: true, success: true }
      }));
      
      addLog('Adjust тест: Успешно');
      
      return true;
    } catch (error) {
      addLog(`Ошибка при тестировании Adjust: ${error}`);
      setTestResults(prev => ({
        ...prev,
        adjust: { tested: true, success: false }
      }));
      return false;
    }
  };
  
  // Тестирование AppsFlyer
  const testAppsFlyer = async () => {
    addLog('Тестирование AppsFlyer...');
    
    try {
      // Инициализация AppsFlyer
      await appsFlyerService.initialize();
      
      // Отслеживание события
      await appsFlyerService.trackGameStart();
      
      setTestResults(prev => ({
        ...prev,
        appsFlyer: { tested: true, success: true }
      }));
      
      addLog('AppsFlyer тест: Успешно');
      
      return true;
    } catch (error) {
      addLog(`Ошибка при тестировании AppsFlyer: ${error}`);
      setTestResults(prev => ({
        ...prev,
        appsFlyer: { tested: true, success: false }
      }));
      return false;
    }
  };
  
  // Тестирование AppMetrica
  const testAppMetrica = async () => {
    addLog('Тестирование AppMetrica...');
    
    try {
      // Инициализация AppMetrica
      await appMetricaService.initialize();
      
      // Отслеживание события
      await appMetricaService.trackGameStart();
      
      setTestResults(prev => ({
        ...prev,
        appMetrica: { tested: true, success: true }
      }));
      
      addLog('AppMetrica тест: Успешно');
      
      return true;
    } catch (error) {
      addLog(`Ошибка при тестировании AppMetrica: ${error}`);
      setTestResults(prev => ({
        ...prev,
        appMetrica: { tested: true, success: false }
      }));
      return false;
    }
  };
  
  // Запуск всех тестов
  const runAllTests = async () => {
    addLog('Запуск всех тестов...');
    
    const permissionResult = await checkAdIdPermission();
    
    if (!permissionResult.adIdAvailable) {
      addLog('⚠️ Рекламный идентификатор недоступен, тесты могут быть неточными');
    }
    
    await testAdMob();
    await testAdjust();
    await testAppsFlyer();
    await testAppMetrica();
    
    addLog('Все тесты завершены');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Тестирование рекламного идентификатора (AD_ID)</h1>
      
      {/* Информация об устройстве */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Информация об устройстве</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Устройство:</span>
            <Badge variant={androidInfo.isAndroid ? "default" : "secondary"}>
              {androidInfo.isAndroid ? `Android ${androidInfo.version}` : 'Не Android'}
            </Badge>
          </div>
          {androidInfo.isAndroid && (
            <div className="flex justify-between">
              <span>Требуется разрешение AD_ID:</span>
              <Badge variant={androidInfo.requiresAdIdPermission ? "destructive" : "default"}>
                {androidInfo.requiresAdIdPermission ? 'Да (Android 13+)' : 'Нет (Android < 13)'}
              </Badge>
            </div>
          )}
        </div>
      </Card>
      
      {/* Статус разрешения */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Статус разрешения AD_ID</h2>
        {!permissionStatus.checked ? (
          <Button onClick={checkAdIdPermission} className="w-full">Проверить разрешение</Button>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Разрешение предоставлено:</span>
              <Badge variant={permissionStatus.granted ? "default" : "destructive"}>
                {permissionStatus.granted ? 'Да' : 'Нет'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Рекламный идентификатор доступен:</span>
              <Badge variant={permissionStatus.adIdAvailable ? "default" : "destructive"}>
                {permissionStatus.adIdAvailable ? 'Да' : 'Нет'}
              </Badge>
            </div>
            <Button onClick={checkAdIdPermission} className="w-full mt-2">Проверить снова</Button>
          </div>
        )}
      </Card>
      
      {/* Тесты SDK */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Тесты SDK</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
            <span>AdMob:</span>
            {!testResults.adMob.tested ? (
              <Badge variant="secondary">Не тестировано</Badge>
            ) : (
              <Badge variant={testResults.adMob.success ? "default" : "destructive"}>
                {testResults.adMob.success ? 'Успешно' : 'Неудачно'}
              </Badge>
            )}
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
            <span>Adjust:</span>
            {!testResults.adjust.tested ? (
              <Badge variant="secondary">Не тестировано</Badge>
            ) : (
              <Badge variant={testResults.adjust.success ? "default" : "destructive"}>
                {testResults.adjust.success ? 'Успешно' : 'Неудачно'}
              </Badge>
            )}
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
            <span>AppsFlyer:</span>
            {!testResults.appsFlyer.tested ? (
              <Badge variant="secondary">Не тестировано</Badge>
            ) : (
              <Badge variant={testResults.appsFlyer.success ? "default" : "destructive"}>
                {testResults.appsFlyer.success ? 'Успешно' : 'Неудачно'}
              </Badge>
            )}
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
            <span>AppMetrica:</span>
            {!testResults.appMetrica.tested ? (
              <Badge variant="secondary">Не тестировано</Badge>
            ) : (
              <Badge variant={testResults.appMetrica.success ? "default" : "destructive"}>
                {testResults.appMetrica.success ? 'Успешно' : 'Неудачно'}
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testAdMob}>Тест AdMob</Button>
          <Button onClick={testAdjust}>Тест Adjust</Button>
          <Button onClick={testAppsFlyer}>Тест AppsFlyer</Button>
          <Button onClick={testAppMetrica}>Тест AppMetrica</Button>
        </div>
        <Button onClick={runAllTests} className="w-full mt-4">Запустить все тесты</Button>
      </Card>
      
      {/* Логи */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Логи</h2>
        <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">Логи будут отображаться здесь...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
        <Button onClick={() => setLogs([])} className="w-full mt-4" variant="outline">Очистить логи</Button>
      </Card>
    </div>
  );
}