import React, { useState, useEffect } from 'react';
import { Zap, X, Check, CheckCircle2, Star, Printer } from 'lucide-react';

/**
 * BatchReportModal - Modal for batch generating daily reports
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.batchPatients - Array of patients for batch processing
 * @param {number} props.currentBatchIndex - Current patient index
 * @param {Function} props.setCurrentBatchIndex - Function to update current index
 * @param {Function} props.confirmBatchItem - Function to confirm a batch item
 * @param {Function} props.printBatchRecords - Function to print all records
 */
const BatchReportModal = ({
  isOpen,
  onClose,
  batchPatients,
  currentBatchIndex,
  setCurrentBatchIndex,
  confirmBatchItem,
  printBatchRecords
}) => {
  const current = batchPatients[currentBatchIndex];
  const [editingRecord, setEditingRecord] = useState(current?.generatedRecord || null);

  useEffect(() => {
    if (current) {
      setEditingRecord(current.generatedRecord);
    }
  }, [currentBatchIndex, current]);

  if (!isOpen || !current) return null;

  const allConfirmed = batchPatients.every(p => p.generatedRecord.confirmed);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-2xl rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto border-t border-white/80 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-amber-500" size={20} />
            批量生成日报
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-4 py-3 bg-slate-50 flex items-center gap-2 overflow-x-auto">
          {batchPatients.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrentBatchIndex(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                i === currentBatchIndex
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md'
                  : p.generatedRecord.confirmed
                    ? 'bg-emerald-100 text-emerald-600 font-medium'
                    : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {p.generatedRecord.confirmed && <Check size={14} />}
              {p.name}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Patient info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl border-2 border-white shadow-sm">
              {current.avatar}
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{current.name}</h4>
              <p className="text-sm text-slate-500">{current.bedNo} · {current.diagnosis}</p>
            </div>
          </div>

          {current.generatedRecord.confirmed ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-emerald-600 font-semibold">已确认</p>
            </div>
          ) : (
            <>
              {/* Treatment items */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-2">治疗项目</h5>
                <div className="flex flex-wrap gap-2">
                  {editingRecord?.items.map((item, i) => (
                    <span key={i} className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-xl font-medium">{item}</span>
                  ))}
                </div>
              </div>

              {/* Highlight */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" />
                  今日亮点（可编辑）
                </h5>
                <textarea
                  value={editingRecord?.highlight || ''}
                  onChange={e => setEditingRecord(prev => ({ ...prev, highlight: e.target.value }))}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-2">治疗备注</h5>
                <textarea
                  value={editingRecord?.notes || ''}
                  onChange={e => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-2xl p-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                  rows={2}
                />
              </div>

              <button
                onClick={() => confirmBatchItem(currentBatchIndex, editingRecord)}
                className="w-full btn-particle btn-particle-emerald py-3 rounded-xl"
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
                  <Check size={18} />
                  确认此记录 ({currentBatchIndex + 1}/{batchPatients.length})
                </span>
              </button>
            </>
          )}

          {allConfirmed && (
            <div className="mt-4 space-y-3">
              {/* Print all button */}
              <button
                onClick={() => printBatchRecords(batchPatients)}
                className="w-full btn-particle py-3 rounded-xl"
              >
                <div className="points_wrapper">
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                </div>
                <span className="inner">
                  <Printer size={18} />
                  打印全部日报
                </span>
              </button>
              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full btn-particle btn-particle-cyan py-3 rounded-xl"
              >
                <div className="points_wrapper">
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                </div>
                <span className="inner">
                  全部完成，关闭
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchReportModal;
