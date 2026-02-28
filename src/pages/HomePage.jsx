import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Zap, Edit3, Check, Plus, Trash2 } from '../components/icons';
import ParticleButton from '../components/ui/ParticleButton';

const HomePage = React.memo(({
  userRole,
  patients,
  isLoadingPatients,
  departments,
  getDepartmentPatients,
  navigateTo,
  setShowAIModal,
  initBatchGenerate,
  isEditingDepartments,
  setIsEditingDepartments,
  setDepartments,
  showToast,
  setShowAddDepartment
}) => {
  // 使用useMemo缓存计算结果，避免重复过滤
  const activePatients = useMemo(() =>
    patients.filter(p => p.status === 'active'), [patients]);

  const todayPending = useMemo(() =>
    patients.filter(p => p.status === 'active' && !p.todayTreated), [patients]);

  const todayTreated = useMemo(() =>
    patients.filter(p => p.todayTreated), [patients]);

  const recentPatients = useMemo(() =>
    activePatients.slice(-3).reverse(), [activePatients]);

  // 使用useCallback缓存事件处理函数
  const handleAIModalOpen = useCallback(() => {
    setShowAIModal(true);
  }, [setShowAIModal]);

  const handleToggleEditDepartments = useCallback(() => {
    setIsEditingDepartments(!isEditingDepartments);
  }, [isEditingDepartments, setIsEditingDepartments]);

  const handleAddDepartment = useCallback(() => {
    setShowAddDepartment(true);
  }, [setShowAddDepartment]);

  const handleDeleteDepartment = useCallback((deptId, deptName) => {
    if (confirm(`确定要删除"${deptName}"吗？`)) {
      setDepartments(departments.filter(d => d.id !== deptId));
      showToast('科室已删除');
    }
  }, [departments, setDepartments, showToast]);

  // 3D嫩芽图标组件
  const SproutIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>
      <path d="M32 60 V 36" stroke="url(#leafGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M32 44 C 32 44, 12 44, 8 32 C 4 20, 16 16, 32 36" fill="url(#leafGrad)" filter="url(#dropShadow)" />
      <path d="M32 44 C 32 44, 52 44, 56 32 C 60 20, 48 16, 32 36" fill="url(#leafGrad)" filter="url(#dropShadow)" />
    </svg>
  );

  return (
  <div className="min-h-screen flex justify-center pt-6 pb-6 px-4">
    {/* 主容器 - 毛玻璃面板 */}
    <div className="main-glass-container w-full max-w-md relative overflow-hidden flex flex-col p-6">

      {/* 顶部标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-slate-800">
            南京市儿童医院康复科
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center">
          <span className="text-xl">👨‍⚕️</span>
        </div>
      </div>

      {/* 快捷操作按钮 */}
      {userRole === 'therapist' && (
        <div className="flex gap-4 mb-8">
          <ParticleButton
            onClick={handleAIModalOpen}
            variant="cyan"
            className="flex-1 h-12 rounded-xl"
          >
            <Zap size={18} fill="white" />
            AI智能收治
          </ParticleButton>
          <ParticleButton
            onClick={initBatchGenerate}
            className="flex-1 h-12 rounded-xl"
          >
            <Zap size={18} />
            批量生成日报
          </ParticleButton>
        </div>
      )}

      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* 加载状态 */}
        {isLoadingPatients ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-500">加载患者数据中...</p>
          </div>
        ) : (
          <>
            {/* 最近建档 - 仅治疗师可见 */}
            {userRole === 'therapist' && recentPatients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 pl-1">最近建档</h3>
            <div className="space-y-3">
              {recentPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => navigateTo('patientDetail', patient)}
                  className="w-full bg-white/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 text-left border border-white/50 shadow-sm hover:bg-white/80 transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-base font-bold text-blue-600 shadow-sm flex-shrink-0 border-2 border-white">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-0.5">
                      {patient.name}, {patient.age}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed truncate">
                      {patient.diagnosis}
                    </p>
                  </div>
                  <span className={`text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm ${patient.todayTreated ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-gradient-to-r from-orange-400 to-rose-400'}`}>
                    {patient.todayTreated ? '已治' : '待治'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 科室患儿分布 */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-4 pl-1">
            <h3 className="text-sm font-bold text-slate-700">科室患儿分布</h3>
            {userRole === 'therapist' && (
              <button
                onClick={handleToggleEditDepartments}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/60 border border-slate-200 text-slate-600 hover:bg-white/80 transition-all flex items-center gap-1"
              >
                {isEditingDepartments ? (
                  <>
                    <Check size={14} />
                    完成
                  </>
                ) : (
                  <>
                    <Edit3 size={14} />
                    编辑
                  </>
                )}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {departments.map(dept => {
              const deptPatients = getDepartmentPatients(dept.id);
              const pending = deptPatients.filter(p => p.status === 'active' && !p.todayTreated).length;
              return (
                <div key={dept.id} className="relative">
                  <button
                    onClick={() => !isEditingDepartments && navigateTo('patients', dept)}
                    disabled={isEditingDepartments}
                    className={`w-full bg-white/60 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 text-left border border-white/50 shadow-sm transition-all ${
                      isEditingDepartments ? 'opacity-60' : 'hover:bg-white/80 active:scale-[0.98]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
                      {dept.icon.startsWith('/images/') ? (
                        <img src={dept.icon} alt={dept.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{dept.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-700 text-sm">{dept.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {deptPatients.length} 位患儿
                        </span>
                        {pending > 0 && (
                          <span className="bg-rose-100 text-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {pending} 待治
                          </span>
                        )}
                      </div>
                    </div>
                    {!isEditingDepartments && <ChevronRight size={18} className="text-slate-300" />}
                  </button>
                  {isEditingDepartments && (
                    <button
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            {isEditingDepartments && (
              <button
                onClick={handleAddDepartment}
                className="w-full bg-white/60 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-600 hover:bg-white/80 hover:border-slate-400 transition-all"
              >
                <Plus size={20} />
                <span className="font-bold text-sm">添加科室</span>
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
});

HomePage.displayName = 'HomePage';

HomePage.propTypes = {
  userRole: PropTypes.oneOf(['therapist', 'doctor']).isRequired,
  patients: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    bedNo: PropTypes.string,
    diagnosis: PropTypes.string,
    status: PropTypes.string,
    department: PropTypes.string,
    todayTreated: PropTypes.bool,
  })).isRequired,
  isLoadingPatients: PropTypes.bool,
  departments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    icon: PropTypes.string,
  })).isRequired,
  getDepartmentPatients: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  setShowAIModal: PropTypes.func.isRequired,
  initBatchGenerate: PropTypes.func.isRequired,
  isEditingDepartments: PropTypes.bool.isRequired,
  setIsEditingDepartments: PropTypes.func.isRequired,
  setDepartments: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  setShowAddDepartment: PropTypes.func.isRequired,
};

HomePage.defaultProps = {
  patients: [],
  departments: [],
};

export default HomePage;
