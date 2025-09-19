import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <>
      {/* Инструкция */}
      <div className="bg-green-50 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-green-800 mb-3">Как загрузить озвучку ячеек:</h4>
        
        <div className="space-y-3 text-sm text-green-700">
          <div>
            <div className="font-medium mb-1">Правила именования файлов:</div>
            <div className="bg-green-100 rounded p-2 font-mono text-xs space-y-1">
              <div><code>A1.mp3</code> - ячейка A1</div>
              <div><code>cell-B15.mp3</code> - ячейка B15</div>
              <div><code>126.mp3</code> - ячейка 126</div>
              <div><code>ячейка-A25.mp3</code> - ячейка A25</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-1">Что должно содержать аудио:</div>
            <div className="bg-green-100 rounded p-2 text-xs">
              Файл должен произносить номер ячейки, например:<br/>
              <strong>"Ячейка А один"</strong> или <strong>"Номер сто двадцать шесть"</strong>
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-1">Технические требования:</div>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>Форматы: MP3, WAV, M4A, OGG</li>
              <li>Размер: до 2 МБ на файл</li>
              <li>Длительность: желательно до 3 секунд</li>
              <li>Качество: 44.1 кГц, 128 кбит/с достаточно</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Полезные советы */}
      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-blue-800 mb-2">Полезные советы:</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Можно перетащить папку с файлами прямо в окно</li>
          <li>Система автоматически определит номер ячейки из имени файла</li>
          <li>После загрузки нажмите на номер ячейки для проверки</li>
          <li>Файлы сохраняются в браузере и будут доступны при следующем запуске</li>
        </ul>
      </div>
    </>
  );
};