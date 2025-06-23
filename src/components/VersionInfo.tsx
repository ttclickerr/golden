import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface VersionInfoProps {
  className?: string;
  showDetails?: boolean;
}

export function VersionInfo({ className = '', showDetails = false }: VersionInfoProps) {
  const [versionInfo, setVersionInfo] = useState({
    version: '1.3.1',
    buildNumber: '10301',
    buildDate: new Date().toISOString(),
    environment: 'production',
    commitHash: 'unknown'
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    // Попытка получить информацию о версии из build-info.json
    fetch('/build-info.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load build info');
        return response.json();
      })
      .then(data => {
        if (data && data.version) {
          setVersionInfo(data);
        }
      })
      .catch(() => {
        // Если не удалось загрузить build-info.json, используем значения по умолчанию
        console.log('Using default version info');
        setError(true);
      });
  }, []);

  if (!showDetails) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        v{versionInfo.version}
      </Badge>
    );
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-400" />
        <span className="font-medium">Version Information</span>
      </div>
      
      <div className="bg-gray-800/50 p-3 rounded-lg space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Version:</span>
          <span className="text-blue-400">v{versionInfo.version}</span>
        </div>
        <div className="flex justify-between">
          <span>Build:</span>
          <span className="text-green-400">{versionInfo.buildNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Environment:</span>
          <span className={versionInfo.environment === 'production' ? 'text-green-400' : 'text-yellow-400'}>
            {versionInfo.environment}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="text-gray-400">
            {new Date(versionInfo.buildDate).toLocaleDateString()}
          </span>
        </div>
        {versionInfo.commitHash !== 'unknown' && (
          <div className="flex justify-between">
            <span>Commit:</span>
            <span className="text-purple-400">{versionInfo.commitHash.substring(0, 7)}</span>
          </div>
        )}
        {error && (
          <div className="text-xs text-yellow-400 mt-2">
            Using default version info. Build info could not be loaded.
          </div>
        )}
      </div>
    </div>
  );
}