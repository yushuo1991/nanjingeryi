import React from 'react';
import PropTypes from 'prop-types';
import { X, Check, RotateCcw } from '../components/icons';
import ModalBase from '../components/ui/ModalBase';

/**
 * ReplaceItemModal - 替换治疗项目弹窗
 */
const ReplaceItemModal = ({
  isOpen,
  onClose,
  currentItem,
  alternatives,
  onReplace
}) => {
  if (!currentItem) return null;

  const handleReplace = (newItem) => {
    onReplace(newItem);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="替换治疗项目">
      <div className="space-y-4">
        {/* 当前项目 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{currentItem.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">{currentItem.name}</h4>
              <p className="text-xs text-slate-500">当前项目 · {currentItem.duration}</p>
            </div>
          </div>
          {currentItem.note && (
            <p className="text-xs text-slate-600 mt-2 whitespace-pre-line line-clamp-3">
              {currentItem.note}
            </p>
          )}
        </div>

        {/* 备选项目列表 */}
        <div>
          <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <RotateCcw size={16} className="text-blue-500" />
            可替换为以下项目
          </h5>

          {alternatives.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">暂无可替换的项目</p>
              <p className="text-xs mt-1">该类别的其他项目已在方案中</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alternatives.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleReplace(item)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-600">
                          {item.name}
                        </h4>
                        <span className="text-xs text-slate-500">{item.duration}</span>
                      </div>

                      {/* 适用状态标签 */}
                      {item.适用状态 && item.适用状态.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.适用状态.map((state, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full"
                            >
                              {state}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 禁忌症标签 */}
                      {item.禁忌 && item.禁忌.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.禁忌.map((contra, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full"
                            >
                              禁忌：{contra}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.note && (
                        <p className="text-xs text-slate-600 mt-2 whitespace-pre-line line-clamp-2">
                          {item.note}
                        </p>
                      )}
                    </div>
                    <Check size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

ReplaceItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentItem: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    icon: PropTypes.string,
    duration: PropTypes.string,
    note: PropTypes.string,
    category: PropTypes.string,
    适用状态: PropTypes.arrayOf(PropTypes.string),
    禁忌: PropTypes.arrayOf(PropTypes.string)
  }),
  alternatives: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    icon: PropTypes.string,
    duration: PropTypes.string,
    note: PropTypes.string,
    category: PropTypes.string,
    适用状态: PropTypes.arrayOf(PropTypes.string),
    禁忌: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  onReplace: PropTypes.func.isRequired
};

export default ReplaceItemModal;
