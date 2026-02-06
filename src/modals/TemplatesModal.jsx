import React from 'react';
import { BookOpen, X } from 'lucide-react';

/**
 * TemplatesModal - Modal for displaying treatment templates library
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.treatmentTemplates - Array of treatment template categories
 */
const TemplatesModal = ({ isOpen, onClose, treatmentTemplates }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-2xl rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto border-t border-white/80 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-emerald-500" size={20} />
            治疗模板库
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {treatmentTemplates.map(category => (
            <div key={category.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                {category.category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
