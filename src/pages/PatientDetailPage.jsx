import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronLeft, Share2, Printer, Check, X, Edit3, Trash2,
  Target, Star, AlertCircle, FileText, CheckCircle2, Circle,
  ClipboardList
} from '../components/icons';
import { printPatientRecord, generateTreatmentCard } from '../lib/print';

const PatientDetailPage = React.memo(({
  selectedPatient,
  userRole,
  detailTab,
  setDetailTab,
  isEditingDetail,
  editedPatient,
  setEditedPatient,
  goBack,
  savePatientEdit,
  toggleEditMode,
  setShowDeleteConfirm,
  toggleTreatmentItem,
  generateTodayLog,
  setShowQuickEntry,
  updatePatient
}) => {
  const patient = selectedPatient;
  if (!patient) return null;

  // 使用useCallback缓存事件处理函数
  const handleGenerateCard = useCallback(() => {
    generateTreatmentCard(patient);
  }, [patient]);

  const handlePrint = useCallback(() => {
    printPatientRecord(patient);
  }, [patient]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, [setShowDeleteConfirm]);

  const handleQuickEntry = useCallback(() => {
    setShowQuickEntry(true);
  }, [setShowQuickEntry]);

  const handleGenerateLog = useCallback(() => {
    generateTodayLog(patient);
  }, [generateTodayLog, patient]);

  const handleToggleTreatment = useCallback((itemId) => {
    toggleTreatmentItem(patient.id, itemId);
  }, [toggleTreatmentItem, patient.id]);

  const handleCompleteTreatment = useCallback(() => {
    const newLog = {
      date: '2026-01-11',
      items: patient.treatmentPlan.items.filter(i => i.completed).map(i => i.name),
      highlight: patient.treatmentPlan.highlights?.[0] || '常规训练',
      notes: '治疗顺利完成',
      therapist: '吴大勇'
    };
    updatePatient(patient.id, {
      todayTreated: true,
      treatmentLogs: [newLog, ...(patient.treatmentLogs || [])]
    });
  }, [patient, updatePatient]);

  return (
    <div className="min-h-screen flex justify-center pt-6 pb-6 px-4">
      <div className="main-glass-container w-full max-w-md relative overflow-hidden flex flex-col p-6">
        {/* 顶部标题栏 */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-all">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-extrabold text-slate-800 flex-1">患儿详情</h1>
          <div className="flex gap-1">
            {/* 生成卡片按钮 */}
            <button
              onClick={handleGenerateCard}
              className="p-2 hover:bg-blue-100 rounded-xl transition-all"
              title="生成治疗卡片"
            >
              <Share2 size={20} className="text-blue-500" />
            </button>
            {/* 打印按钮 */}
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              title="打印患者档案"
            >
              <Printer size={20} className="text-slate-500" />
            </button>
            {/* 编辑按钮 - 仅治疗师可见 */}
            {userRole === 'therapist' && (
              <>
                {isEditingDetail && (
                  <button
                    onClick={savePatientEdit}
                    className="p-2 bg-emerald-100 text-emerald-600 rounded-xl transition-all hover:bg-emerald-200"
                    title="保存"
                  >
                    <Check size={20} />
                  </button>
                )}
                <button
                  onClick={toggleEditMode}
                  className={`p-2 rounded-xl transition-all ${
                    isEditingDetail
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                  title={isEditingDetail ? '取消编辑' : '编辑详情'}
                >
                  {isEditingDetail ? <X size={20} /> : <Edit3 size={20} />}
                </button>
              </>
            )}
            {/* 删除按钮 - 仅治疗师可见 */}
            {userRole === 'therapist' && (
              <button
                onClick={handleDeleteClick}
                className="p-2 hover:bg-rose-100 rounded-xl transition-all"
                title="删除患者"
              >
                <Trash2 size={20} className="text-rose-500" />
              </button>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
          {/* 基础信息卡片 */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-sm mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-white shadow-sm flex-shrink-0">
                {patient.avatar}
              </div>
              <div className="flex-1 min-w-0">
                {isEditingDetail && editedPatient ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editedPatient.name}
                        onChange={(e) => setEditedPatient({ ...editedPatient, name: e.target.value })}
                        className="text-xl font-bold text-slate-800 border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent w-24"
                        placeholder="姓名"
                      />
                      <input
                        type="text"
                        value={editedPatient.age}
                        onChange={(e) => setEditedPatient({ ...editedPatient, age: e.target.value })}
                        className="text-sm text-slate-600 border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent w-16"
                        placeholder="年龄"
                      />
                      <select
                        value={editedPatient.gender}
                        onChange={(e) => setEditedPatient({ ...editedPatient, gender: e.target.value })}
                        className="text-sm text-slate-600 border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-400">床号：</span>
                      <input
                        type="text"
                        value={editedPatient.bedNo}
                        onChange={(e) => setEditedPatient({ ...editedPatient, bedNo: e.target.value })}
                        className="text-sm text-slate-700 border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent w-16"
                        placeholder="床号"
                      />
                      <span className="text-slate-300">·</span>
                      <input
                        type="text"
                        value={editedPatient.department}
                        onChange={(e) => setEditedPatient({ ...editedPatient, department: e.target.value })}
                        className="text-sm text-slate-700 border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent w-24"
                        placeholder="科室"
                      />
                    </div>
                    <input
                      type="text"
                      value={editedPatient.diagnosis}
                      onChange={(e) => setEditedPatient({ ...editedPatient, diagnosis: e.target.value })}
                      className="text-blue-600 font-medium border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent w-full"
                      placeholder="诊断"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                      <span className="text-sm text-slate-400">{patient.age} · {patient.gender}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">床号：{patient.bedNo} · {patient.department}</p>
                    <p className="text-blue-600 font-semibold">{patient.diagnosis}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-2 mb-4">
            <TabButton active={detailTab === 'today'} onClick={() => setDetailTab('today')}>
              📋 今日治疗
            </TabButton>
            <TabButton active={detailTab === 'logs'} onClick={() => setDetailTab('logs')}>
              📅 治疗日志
            </TabButton>
          </div>

          {/* 今日治疗 */}
          {detailTab === 'today' && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm">
              {/* 治疗目标 */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                  <Target size={16} className="text-blue-500" />
                  治疗目标
                </h5>
                {isEditingDetail && editedPatient ? (
                  <textarea
                    value={editedPatient.treatmentPlan?.focus || ''}
                    onChange={(e) => setEditedPatient({
                      ...editedPatient,
                      treatmentPlan: { ...editedPatient.treatmentPlan, focus: e.target.value }
                    })}
                    className="text-sm text-slate-700 leading-relaxed w-full bg-white border border-blue-200 rounded-lg p-2 focus:border-blue-400 outline-none resize-none"
                    rows={2}
                    placeholder="治疗目标"
                  />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{patient.treatmentPlan?.focus}</p>
                )}
              </div>

              {/* 个性化重点 */}
              {patient.treatmentPlan?.highlights?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-500" />
                    今日个性化重点
                  </h5>
                  <ul className="text-sm text-slate-600 space-y-1.5">
                    {patient.treatmentPlan.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span className="flex-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 注意事项 */}
              {patient.treatmentPlan?.precautions?.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4">
                  <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-rose-500" />
                    注意事项
                  </h5>
                  <ul className="text-sm text-slate-600 space-y-1.5">
                    {patient.treatmentPlan.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 mt-0.5">⚠</span>
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 治疗项目列表 */}
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">治疗项目</h5>
                {/* 治疗师视角显示生成日志按钮 */}
                {userRole === 'therapist' && (
                  <button
                    onClick={handleGenerateLog}
                    className="btn-particle py-1.5 px-3 rounded-xl text-xs"
                  >
                    <div className="points_wrapper">
                      <div className="point"></div>
                      <div className="point"></div>
                      <div className="point"></div>
                    </div>
                    <span className="inner">
                      <FileText size={14} />
                      生成今日日志
                    </span>
                  </button>
                )}
              </div>
              {patient.treatmentPlan?.items?.length > 0 ? (
                <div className="space-y-2">
                  {patient.treatmentPlan.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleTreatment(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        item.completed
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white/50 border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${item.completed ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-400">{item.duration}</span>
                        </div>
                        <p className="text-xs text-slate-400">{item.note}</p>
                      </div>
                      {item.completed ? (
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      ) : (
                        <Circle size={24} className="text-slate-300" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <ClipboardList size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无治疗安排</p>
                  {userRole === 'therapist' && (
                    <button
                      onClick={handleQuickEntry}
                      className="mt-3 btn-particle btn-particle-cyan px-4 py-2 rounded-full text-sm"
                    >
                      <div className="points_wrapper">
                        <div className="point"></div>
                        <div className="point"></div>
                        <div className="point"></div>
                      </div>
                      <span className="inner">快速录入</span>
                    </button>
                  )}
                </div>
              )}

              {/* 完成治疗按钮 */}
              {userRole === 'therapist' && patient.treatmentPlan?.items?.length > 0 && !patient.todayTreated && (
                <button
                  onClick={handleCompleteTreatment}
                  className="w-full mt-4 btn-particle btn-particle-emerald py-3 rounded-xl"
                >
                  <div className="points_wrapper">
                    <div className="point"></div>
                    <div className="point"></div>
                    <div className="point"></div>
                    <div className="point"></div>
                    <div className="point"></div>
                  </div>
                  <span className="inner">
                    <CheckCircle2 size={18} />
                    完成今日治疗
                  </span>
                </button>
              )}

              {patient.todayTreated && (
                <div className="mt-4 text-center text-emerald-600 flex items-center justify-center gap-2 font-semibold">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  今日治疗已完成
                </div>
              )}
            </div>
          )}

          {/* 治疗日志（时间轴） */}
          {detailTab === 'logs' && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm">
              {patient.treatmentLogs?.length > 0 ? (
                <div className="relative">
                  {/* 时间轴线 */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" />

                  <div className="space-y-6">
                    {patient.treatmentLogs.map((log, i) => (
                      <div key={i} className="relative pl-10">
                        {/* 时间轴圆点 */}
                        <div className="absolute left-2.5 top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />

                        <div className="bg-white/70 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            {isEditingDetail && editedPatient ? (
                              <input
                                type="date"
                                value={editedPatient.treatmentLogs?.[i]?.date || log.date}
                                onChange={(e) => {
                                  const newLogs = [...(editedPatient.treatmentLogs || patient.treatmentLogs.map(l => ({...l})))];
                                  if (!newLogs[i]) newLogs[i] = { ...log };
                                  newLogs[i].date = e.target.value;
                                  setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                                }}
                                className="text-sm font-bold text-slate-700 border-b-2 border-blue-400 focus:border-blue-500 outline-none bg-transparent"
                              />
                            ) : (
                              <span className="text-sm font-bold text-slate-700">{log.date}</span>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{log.therapist}</span>
                              {/* 删除按钮 - 仅治疗师可见 */}
                              {userRole === 'therapist' && isEditingDetail && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('确定要删除这条治疗记录吗？')) {
                                      const newLogs = [...(editedPatient?.treatmentLogs || patient.treatmentLogs)];
                                      newLogs.splice(i, 1);
                                      setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                                    }
                                  }}
                                  className="p-1 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 亮点标注 */}
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 mb-2">
                            {isEditingDetail && editedPatient ? (
                              <textarea
                                value={editedPatient.treatmentLogs?.[i]?.highlight || log.highlight}
                                onChange={(e) => {
                                  const newLogs = [...(editedPatient.treatmentLogs || patient.treatmentLogs.map(l => ({...l})))];
                                  if (!newLogs[i]) newLogs[i] = { ...log };
                                  newLogs[i].highlight = e.target.value;
                                  setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                                }}
                                className="text-sm text-slate-700 w-full bg-transparent border-none outline-none resize-none"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-slate-700 flex items-center gap-1">
                                <Star size={14} className="text-amber-500" />
                                {log.highlight}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.items.map((item, j) => (
                              <span key={j} className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg font-medium">
                                {typeof item === 'string' ? item : item.name}
                              </span>
                            ))}
                          </div>

                          {/* 详细记录 */}
                          {(log.detailRecord || isEditingDetail) && (
                            <div className="bg-slate-50 rounded-lg p-2 mb-2">
                              {isEditingDetail && editedPatient ? (
                                <textarea
                                  value={editedPatient.treatmentLogs?.[i]?.detailRecord || log.detailRecord || ''}
                                  onChange={(e) => {
                                    const newLogs = [...(editedPatient.treatmentLogs || patient.treatmentLogs.map(l => ({...l})))];
                                    if (!newLogs[i]) newLogs[i] = { ...log };
                                    newLogs[i].detailRecord = e.target.value;
                                    setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                                  }}
                                  className="text-xs text-slate-600 leading-relaxed w-full bg-transparent border-none outline-none resize-none"
                                  rows={3}
                                  placeholder="详细记录"
                                />
                              ) : (
                                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{log.detailRecord}</p>
                              )}
                            </div>
                          )}

                          {isEditingDetail && editedPatient ? (
                            <textarea
                              value={editedPatient.treatmentLogs?.[i]?.notes || log.notes || ''}
                              onChange={(e) => {
                                const newLogs = [...(editedPatient.treatmentLogs || patient.treatmentLogs.map(l => ({...l})))];
                                if (!newLogs[i]) newLogs[i] = { ...log };
                                newLogs[i].notes = e.target.value;
                                setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                              }}
                              className="text-xs text-slate-600 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none resize-none"
                              rows={2}
                              placeholder="备注"
                            />
                          ) : (
                            <p className="text-xs text-slate-400">{log.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无治疗记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
        : 'bg-white/50 text-slate-500 border border-slate-200 hover:border-blue-300'
    }`}
  >
    {children}
  </button>
);

PatientDetailPage.displayName = 'PatientDetailPage';
TabButton.displayName = 'TabButton';

PatientDetailPage.propTypes = {
  selectedPatient: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    bedNo: PropTypes.string,
    diagnosis: PropTypes.string,
    status: PropTypes.string,
    admissionDate: PropTypes.string,
    department: PropTypes.string,
    age: PropTypes.string,
    gender: PropTypes.string,
    guardian: PropTypes.string,
    contact: PropTypes.string,
    address: PropTypes.string,
    medicalHistory: PropTypes.string,
    allergies: PropTypes.string,
    safetyAlerts: PropTypes.arrayOf(PropTypes.string),
    gasGoals: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      goal: PropTypes.string,
      baseline: PropTypes.string,
      target: PropTypes.string,
      current: PropTypes.string,
      progress: PropTypes.number,
    })),
    treatmentPlan: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      frequency: PropTypes.string,
      duration: PropTypes.string,
      therapist: PropTypes.string,
      notes: PropTypes.string,
      completed: PropTypes.bool,
    })),
    executionLog: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string,
      items: PropTypes.arrayOf(PropTypes.string),
      notes: PropTypes.string,
    })),
  }),
  userRole: PropTypes.oneOf(['therapist', 'doctor']).isRequired,
  detailTab: PropTypes.string.isRequired,
  setDetailTab: PropTypes.func.isRequired,
  isEditingDetail: PropTypes.bool.isRequired,
  editedPatient: PropTypes.object,
  setEditedPatient: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  savePatientEdit: PropTypes.func.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  setShowDeleteConfirm: PropTypes.func.isRequired,
  toggleTreatmentItem: PropTypes.func.isRequired,
  generateTodayLog: PropTypes.func.isRequired,
  setShowQuickEntry: PropTypes.func.isRequired,
  updatePatient: PropTypes.func.isRequired,
};

PatientDetailPage.defaultProps = {
  selectedPatient: null,
  editedPatient: null,
};

export default PatientDetailPage;
