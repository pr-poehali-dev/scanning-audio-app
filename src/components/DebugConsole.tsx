import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const DebugConsole = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Только для мобильных устройств или если в URL есть ?debug
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasDebug = window.location.search.includes('debug');
    
    if (!isMobile && !hasDebug) return;

    // Перехватываем console.log
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-50), `LOG: ${message}`]);
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-50), `ERROR: ${message}`]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-50), `WARN: ${message}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (logs.length === 0) return null;

  return (
    <>
      {/* Кнопка открытия консоли */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Icon name="Bug" size={20} />
      </button>

      {/* Консоль */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 z-50 max-h-96 bg-gray-900 text-gray-100 rounded-lg shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-semibold">Debug Console</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setLogs([])}
                className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-mono">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.startsWith('ERROR') ? 'text-red-400' :
                  log.startsWith('WARN') ? 'text-yellow-400' :
                  log.includes('✅') ? 'text-green-400' :
                  log.includes('❌') ? 'text-red-400' :
                  log.includes('🎵') ? 'text-purple-400' :
                  'text-gray-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugConsole;
