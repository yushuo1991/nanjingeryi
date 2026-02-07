import React from 'react';
import PropTypes from 'prop-types';
import { X } from '../components/icons';

/**
 * DepartmentModal - Modal for adding a new department
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.newDepartment - New department data {name, icon}
 * @param {Function} props.setNewDepartment - Function to update new department data
 * @param {Array} props.allDepartments - Array of all available departments
 * @param {Function} props.onSave - Function to save the new department
 * @param {Function} props.showToast - Function to show toast messages
 */
const DepartmentModal = ({
  isOpen,
  onClose,
  newDepartment,
  setNewDepartment,
  allDepartments,
  onSave,
  showToast
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setNewDepartment({ name: '', icon: '' });
  };

  const handleSave = () => {
    if (!newDepartment.name.trim()) {
      showToast('请输入科室名称');
      return;
    }
    if (!newDepartment.icon) {
      showToast('请选择图标');
      return;
    }
    onSave(newDepartment);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={handleClose}>
      <div className="bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-2xl rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto border-t border-white/80 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-slate-800">添加科室</h3>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Department name */}
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">科室名称 *</label>
            <input
              type="text"
              value={newDepartment.name}
              onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
              placeholder="请输入科室名称，如：呼吸内科"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            />
          </div>

          {/* Icon selection */}
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">选择图标 *</label>
            <div className="grid grid-cols-4 gap-3">
              {allDepartments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => setNewDepartment({ ...newDepartment, icon: dept.icon })}
                  className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                    newDepartment.icon === dept.icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                    {dept.icon.startsWith('/images/') ? (
                      <img src={dept.icon} alt={dept.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{dept.icon}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {newDepartment.icon && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-slate-100">
                  {newDepartment.icon.startsWith('/images/') ? (
                    <img src={newDepartment.icon} alt="选中的图标" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{newDepartment.icon}</span>
                  )}
                </div>
                <span className="text-sm text-slate-600">已选择图标</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:shadow-lg transition-all"
            >
              确认添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DepartmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  newDepartment: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
  }).isRequired,
  setNewDepartment: PropTypes.func.isRequired,
  allDepartments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    icon: PropTypes.string,
  })).isRequired,
  onSave: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
};

export default DepartmentModal;
