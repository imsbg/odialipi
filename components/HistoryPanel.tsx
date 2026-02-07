import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon, CopyIcon } from './Icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-orange-600" />
          Recent History
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="px-6 py-3 hover:bg-orange-50/30 transition-colors cursor-pointer group flex justify-between items-center"
            onClick={() => onSelect(item)}
          >
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
              <p className="text-sm text-gray-500 truncate">{item.original}</p>
              <p className="text-sm font-odia text-gray-900 truncate">{item.transliterated}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <CopyIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
