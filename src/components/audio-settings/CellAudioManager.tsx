import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface CellAudio {
  cellNumber: string;
  audioFile: File | null;
  audioUrl?: string;
}

interface CellAudioManagerProps {
  cellAudios: CellAudio[];
  onCellAudiosUpdate: (cellAudios: CellAudio[]) => void;
}

export const CellAudioManager = ({ cellAudios, onCellAudiosUpdate }: CellAudioManagerProps) => {
  const [newCellNumber, setNewCellNumber] = useState('');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Добавить новую ячейку
  const addNewCell = () => {
    if (!newCellNumber.trim()) return;
    
    const exists = cellAudios.some(cell => cell.cellNumber === newCellNumber.toUpperCase());
    if (exists) {
      alert('Ячейка с таким номером уже существует!');
      return;
    }

    const newCell: CellAudio = {
      cellNumber: newCellNumber.toUpperCase(),
      audioFile: null
    };

    onCellAudiosUpdate([...cellAudios, newCell]);
    setNewCellNumber('');
  };

  // Удалить ячейку
  const removeCell = (cellNumber: string) => {
    const updatedCells = cellAudios.filter(cell => cell.cellNumber !== cellNumber);
    onCellAudiosUpdate(updatedCells);
  };

  // Загрузить аудио для ячейки
  const handleAudioUpload = (cellNumber: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && 
        !/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)) {
      alert('Пожалуйста, выберите аудио файл (MP3, WAV, OGG, M4A, AAC, FLAC)');
      return;
    }

    const audioUrl = URL.createObjectURL(file);
    
    const updatedCells = cellAudios.map(cell => 
      cell.cellNumber === cellNumber 
        ? { ...cell, audioFile: file, audioUrl }
        : cell
    );
    
    onCellAudiosUpdate(updatedCells);
  };

  // Воспроизвести аудио
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Удалить аудио из ячейки
  const removeAudio = (cellNumber: string) => {
    const updatedCells = cellAudios.map(cell => 
      cell.cellNumber === cellNumber 
        ? { ...cell, audioFile: null, audioUrl: undefined }
        : cell
    );
    
    onCellAudiosUpdate(updatedCells);
  };

  // Очистить все ячейки
  const clearAllCells = () => {
    if (confirm('Удалить все ячейки и их озвучку?')) {
      onCellAudiosUpdate([]);
    }
  };

  // Добавить стандартные ячейки
  const addStandardCells = () => {
    const standardCells = [];
    // Добавляем ячейки A1-A10, B1-B10, C1-C10
    for (let row of ['A', 'B', 'C']) {
      for (let num = 1; num <= 10; num++) {
        const cellNumber = `${row}${num}`;
        if (!cellAudios.some(cell => cell.cellNumber === cellNumber)) {
          standardCells.push({
            cellNumber,
            audioFile: null
          });
        }
      }
    }
    
    if (standardCells.length > 0) {
      onCellAudiosUpdate([...cellAudios, ...standardCells]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <Icon name="Grid3X3" size={20} className="text-purple-600" />
          Управление озвучкой ячеек
          <Badge variant="secondary">{cellAudios.length} ячеек</Badge>
        </h3>
        
        {cellAudios.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllCells}
            className="text-red-500 hover:text-red-700"
          >
            <Icon name="Trash2" size={16} className="mr-1" />
            Очистить все
          </Button>
        )}
      </div>

      {/* Добавление новой ячейки */}
      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Icon name="Plus" size={16} className="text-green-600" />
          Добавить ячейку
        </h4>
        
        <div className="flex gap-2">
          <Input
            placeholder="Номер ячейки (например: A1, B15)"
            value={newCellNumber}
            onChange={(e) => setNewCellNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNewCell()}
            className="flex-1"
          />
          <Button onClick={addNewCell} disabled={!newCellNumber.trim()}>
            <Icon name="Plus" size={16} className="mr-1" />
            Добавить
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={addStandardCells}
          className="w-full"
        >
          <Icon name="Grid3X3" size={16} className="mr-2" />
          Добавить стандартные ячейки (A1-A10, B1-B10, C1-C10)
        </Button>
      </div>

      {/* Список ячеек */}
      {cellAudios.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cellAudios.map((cell, index) => (
            <div key={cell.cellNumber} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="MapPin" size={16} className="text-purple-600" />
                  </div>
                  <span className="font-medium text-lg">Ячейка {cell.cellNumber}</span>
                  {cell.audioFile && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Icon name="Volume2" size={12} className="mr-1" />
                      Озвучена
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCell(cell.cellNumber)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>

              <div className="flex gap-2">
                <input
                  ref={(el) => fileInputRefs.current[cell.cellNumber] = el}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAudioUpload(cell.cellNumber, e)}
                  className="hidden"
                />
                
                {cell.audioFile ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => cell.audioUrl && playAudio(cell.audioUrl)}
                      className="flex-1"
                    >
                      <Icon name="Play" size={16} className="mr-2" />
                      Воспроизвести: {cell.audioFile.name}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => removeAudio(cell.cellNumber)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRefs.current[cell.cellNumber]?.click()}
                    className="flex-1"
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить аудио для ячейки {cell.cellNumber}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Icon name="Grid3X3" size={48} className="mx-auto mb-2 text-gray-300" />
          <p>Ячейки не добавлены</p>
          <p className="text-sm">Добавьте ячейки для настройки их озвучки</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Как работает озвучка ячеек:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• При приемке или выдаче товара из ячейки автоматически проигрывается её аудио</li>
              <li>• Поддерживаются форматы: MP3, WAV, OGG, M4A, AAC, FLAC</li>
              <li>• Рекомендуется записывать номер ячейки голосом: "Ячейка А один" для A1</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};