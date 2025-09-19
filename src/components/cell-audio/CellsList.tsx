import React from 'react';
import { DiagnosticTools } from './DiagnosticTools';

interface CellsListProps {
  allCells: string[];
  uploadedCells: string[];
  onTestCell: (cellNumber: string) => void;
  onClearAll: () => void;
}

export const CellsList: React.FC<CellsListProps> = ({
  allCells,
  uploadedCells,
  onTestCell,
  onClearAll
}) => {
  if (allCells.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">
          Загруженные ячейки ({allCells.length})
        </h4>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Очистить все
        </button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto">
        {allCells.map(cellNumber => (
          <button
            key={cellNumber}
            onClick={() => onTestCell(cellNumber)}
            className={`p-2 text-xs rounded border hover:bg-gray-50 transition-colors ${
              uploadedCells.includes(cellNumber)
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
            title={`Нажмите для тестирования ячейки ${cellNumber}`}
          >
            {cellNumber}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Нажмите на ячейку для проверки воспроизведения
      </p>
      
      <DiagnosticTools />
    </div>
  );
};