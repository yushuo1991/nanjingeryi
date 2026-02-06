import React, { useState } from 'react';
import { ClipboardList, X } from 'lucide-react';

/**
 * QuickEntryModal - Modal for quick treatment entry
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.treatmentTemplates - Array of treatment template categories
 */
const QuickEntryModal = ({ isOpen, onClose, treatmentTemplates }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleItem = (item) => {
    setSelectedItems(prev =>
      prev.find(i => i.name === item.name)
        ? prev.filter(i => i.name !== item.name)
        : [...prev, item]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-2xl rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto border-t border-white/80 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-emerald-500" size={20} />
            快速录入
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Selected items */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">已选择 ({selectedItems.length})</h5>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((item, i) => (
                  <span key={i} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                    {item.icon} {item.name}
                    <X size={14} className="cursor-pointer hover:text-rose-200" onClick={() => toggleItem(item)} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template selection */}
          {treatmentTemplates.map(category => (
            <div key={category.id} className="mb-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                {category.icon} {category.category}
              </h5>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item, i) => {
                  const isSelected = selectedItems.find(s => s.name === item.name);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleItem(item)}
                      className={`px-3 py-1.5 rounded-full text-sm transition font-medium ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.icon} {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            disabled={selectedItems.length === 0}
            className="w-full btn-particle btn-particle-emerald py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            onClick={onClose}
          >
            <div className="points_wrapper">
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
              <div className="point"></div>
            </div>
            <span className="inner">
              确认添加 ({selectedItems.length} 项)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickEntryModal;
