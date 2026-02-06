import React from 'react';
import { ChevronRight, Edit3, Eye, BookOpen, Bell, Settings, Info } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const ProfilePage = React.memo(({ userRole, setUserRole, setShowTemplates }) => (
  <div className="min-h-screen flex justify-center pt-6 pb-6 px-4">
    <div className="main-glass-container w-full max-w-md relative overflow-hidden flex flex-col p-6">
      {/* 顶部标题 */}
      <div className="mb-6">
        <h1 className="text-lg font-extrabold text-slate-800">我的</h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
        {/* 用户卡片 */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-white shadow-sm">
              👨‍⚕️
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">吴大勇</h2>
              <p className="text-slate-500 text-sm">康复医学科 · 主管治疗师</p>
              <p className="text-slate-400 text-xs mt-1">工号：KF20180015</p>
            </div>
          </div>
        </div>

        {/* 角色切换 */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">视角切换（演示用）</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUserRole('therapist')}
              className={`p-3 rounded-xl border-2 transition ${
                userRole === 'therapist'
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-200 bg-white/50'
              }`}
            >
              <Edit3 size={24} className={userRole === 'therapist' ? 'text-blue-500 mx-auto mb-1' : 'text-slate-400 mx-auto mb-1'} />
              <p className={`text-sm font-semibold ${userRole === 'therapist' ? 'text-slate-700' : 'text-slate-400'}`}>
                治疗师
              </p>
              <p className="text-xs text-slate-400">可编辑管理</p>
            </button>
            <button
              onClick={() => setUserRole('doctor')}
              className={`p-3 rounded-xl border-2 transition ${
                userRole === 'doctor'
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 bg-white/50'
              }`}
            >
              <Eye size={24} className={userRole === 'doctor' ? 'text-emerald-500 mx-auto mb-1' : 'text-slate-400 mx-auto mb-1'} />
              <p className={`text-sm font-semibold ${userRole === 'doctor' ? 'text-slate-700' : 'text-slate-400'}`}>
                主治医生
              </p>
              <p className="text-xs text-slate-400">只读查看</p>
            </button>
          </div>
        </div>

        {/* 统计 */}
        <GlassCard className="mb-4">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">本月统计</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-500">156</p>
              <p className="text-xs text-slate-400">治疗人次</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">23</p>
              <p className="text-xs text-slate-400">新收患儿</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">12</p>
              <p className="text-xs text-slate-400">康复出院</p>
            </div>
          </div>
        </GlassCard>

        {/* 菜单 */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-sm">
          <MenuItem icon={<BookOpen size={20} />} label="治疗模板库" onClick={() => setShowTemplates(true)} />
          <MenuItem icon={<Bell size={20} />} label="消息通知" />
          <MenuItem icon={<Settings size={20} />} label="设置" />
          <MenuItem icon={<Info size={20} />} label="关于" />
        </div>
      </div>
    </div>
  </div>
));

const MenuItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/50 border-b border-slate-100 last:border-none transition"
  >
    <span className="text-blue-500">{icon}</span>
    <span className="text-slate-700 font-medium">{label}</span>
    <ChevronRight size={18} className="text-slate-300 ml-auto" />
  </button>
);

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
