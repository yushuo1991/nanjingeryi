import React from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const PatientsPage = React.memo(({
  selectedDepartment,
  getDepartmentPatients,
  goBack,
  navigateTo
}) => {
  const deptPatients = getDepartmentPatients(selectedDepartment.id);
  const activePatients = deptPatients.filter(p => p.status === 'active');
  const completedPatients = deptPatients.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen flex justify-center pt-6 pb-6 px-4">
      <div className="main-glass-container w-full max-w-md relative overflow-hidden flex flex-col p-6">
        {/* 顶部标题栏 */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-all">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-slate-800">{selectedDepartment.name}</h1>
            <p className="text-xs text-slate-500">{activePatients.length} 位患儿在治</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
            {selectedDepartment.icon.startsWith('/images/') ? (
              <img src={selectedDepartment.icon} alt={selectedDepartment.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{selectedDepartment.icon}</span>
            )}
          </div>
        </div>

        {/* 列表区域 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* 进行中 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2 pl-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              进行中 ({activePatients.length})
            </h3>
            <div className="space-y-3">
              {activePatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} onClick={() => navigateTo('patientDetail', patient)} />
              ))}
            </div>
          </div>

          {/* 已完成/出院 */}
          {completedPatients.length > 0 && (
            <div className="mb-20">
              <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2 pl-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                已完成/出院 ({completedPatients.length})
              </h3>
              <div className="space-y-3 opacity-70">
                {completedPatients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} onClick={() => navigateTo('patientDetail', patient)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const PatientCard = React.memo(({ patient, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white/60 backdrop-blur-xl rounded-2xl p-4 text-left border border-white/50 shadow-sm hover:bg-white/80 transition-all active:scale-[0.98]"
  >
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl border-2 border-white shadow-sm flex-shrink-0">
        {patient.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-slate-800">{patient.name}</h4>
          <span className="text-xs text-slate-400">{patient.age} · {patient.gender}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{patient.bedNo}</span>
        </div>
        <p className="text-sm text-blue-600 font-medium mb-2 truncate">{patient.diagnosis}</p>

        {/* 标签区 */}
        <div className="flex flex-wrap gap-1.5">
          {patient.safetyAlerts?.map((alert, i) => (
            <span key={i} className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full flex items-center font-medium">
              <AlertTriangle size={10} className="mr-0.5" />
              {alert}
            </span>
          ))}
          {patient.todayTreated ? (
            <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full flex items-center font-medium">
              <CheckCircle2 size={10} className="mr-0.5" />
              今日已治疗
            </span>
          ) : patient.status === 'active' && (
            <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full flex items-center font-medium">
              <Clock size={10} className="mr-0.5" />
              待治疗
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 mt-2 flex-shrink-0" />
    </div>
  </button>
));

PatientsPage.displayName = 'PatientsPage';
PatientCard.displayName = 'PatientCard';

export default PatientsPage;
