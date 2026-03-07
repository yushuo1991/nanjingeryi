// Version: 2.0.3 - Code splitting optimization
import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import {
  Home, Calendar, MessageSquare, User, Plus, ChevronRight, ChevronLeft,
  AlertTriangle, Shield, Baby, Stethoscope, Brain, Bone, Heart,
  Clock, CheckCircle2, Circle, FileText, Upload, Sparkles, X, Check,
  Edit3, Trash2, Activity, Target, TrendingUp, Clipboard, Send,
  Play, Pause, RotateCcw, Zap, BookOpen, Star, Filter, Search,
  Bell, Settings, LogOut, Eye, EyeOff, Camera, File, ArrowRight,
  Users, Building2, Bed, ClipboardList, Timer, Coffee, Utensils,
  Moon, Sun, Award, Flag, AlertCircle, Info, ThumbsUp, MessageCircle,
  Share2, Link, ExternalLink, Loader2, Printer, Download
} from './components/icons';

import { api } from './lib/api';
import { printPatientRecord, printBatchRecords, generateTreatmentCard } from './lib/print';

// UI Components
import GlassCard from './components/ui/GlassCard';
import ModalBase from './components/ui/ModalBase';
import ParticleButton from './components/ui/ParticleButton';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load Modal Components
const AIIntakeModal = lazy(() => import('./modals/AIIntakeModal'));
const BatchReportModal = lazy(() => import('./modals/BatchReportModal'));
const TemplatesModal = lazy(() => import('./modals/TemplatesModal'));
const QuickEntryModal = lazy(() => import('./modals/QuickEntryModal'));
const DepartmentModal = lazy(() => import('./modals/DepartmentModal'));

// Lazy load Page Components
const HomePage = lazy(() => import('./pages/HomePage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// ==================== 设计系统配色 - 有机科技主题 ====================
const colors = {
  night: {
    start: '#0a1628',
    mid: '#0f2847',
    end: '#1a4a5e',
    teal: '#1e5a6a',
  },
  glow: {
    cyan: '#00e5cc',
    lime: '#a8ff78',
    gold: '#ffd93d',
  },
  cream: {
    light: '#fdfbf7',
    dark: '#f5f0e8',
  },
  leaf: {
    green: '#4a7c59',
    light: '#7cb587',
  },
  accent: {
    red: '#ff4d6d',
    amber: '#ffb347',
  }
};

// 获取时间问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// ==================== Mock 数据 ====================
const allDepartments = [
  { id: 1, name: '呼吸内科', icon: '/images/departments/呼吸内科.png', color: 'bg-blue-100 text-blue-600', patients: 0, pending: 0 },
  { id: 2, name: '消化内科', icon: '/images/departments/消化内科.png', color: 'bg-green-100 text-green-600', patients: 0, pending: 0 },
  { id: 3, name: '神经内科', icon: '/images/departments/神经内科.png', color: 'bg-purple-100 text-purple-600', patients: 0, pending: 0 },
  { id: 4, name: '心血管内科', icon: '/images/departments/心血管内科.png', color: 'bg-red-100 text-red-600', patients: 0, pending: 0 },
  { id: 5, name: '康复科', icon: '/images/departments/康复科.png', color: 'bg-cyan-100 text-cyan-600', patients: 0, pending: 0 },
  { id: 6, name: '儿保科', icon: '/images/departments/儿保科.png', color: 'bg-pink-100 text-pink-600', patients: 0, pending: 0 },
  { id: 7, name: '外科', icon: '/images/departments/外科.png', color: 'bg-rose-100 text-rose-600', patients: 0, pending: 0 },
  { id: 8, name: '骨科', icon: '/images/departments/骨科.png', color: 'bg-amber-100 text-amber-600', patients: 0, pending: 0 },
  { id: 9, name: '口腔科', icon: '/images/departments/口腔科.png', color: 'bg-yellow-100 text-yellow-600', patients: 0, pending: 0 },
  { id: 10, name: '眼科', icon: '/images/departments/眼科.png', color: 'bg-sky-100 text-sky-600', patients: 0, pending: 0 },
  { id: 11, name: '耳鼻喉科', icon: '/images/departments/耳鼻喉科.png', color: 'bg-violet-100 text-violet-600', patients: 0, pending: 0 },
  { id: 12, name: '皮肤科', icon: '/images/departments/皮肤科.png', color: 'bg-orange-100 text-orange-600', patients: 0, pending: 0 },
];

const allPatients = [
  {
    id: 1,
    name: '小明',
    age: '5岁3个月',
    gender: '男',
    bedNo: '301-1',
    departmentId: 1,
    department: '呼吸内科',
    avatar: '👦',
    diagnosis: '支气管肺炎恢复期',
    admissionDate: '2026-01-05',
    status: 'active', // active | completed
    todayTreated: false,
    safetyAlerts: ['防跌倒'],
    rehabProblems: '呼吸功能下降，运动耐力不足，需要加强呼吸训练和体能恢复',
    treatmentPlan: {
      focus: '改善呼吸功能，增强运动耐力',
      highlights: ['今日患儿精神状态良好，增加运动训练强度'],
      items: [
        { id: 1, name: '呼吸训练', icon: '🫁', duration: '15min', completed: false, note: '腹式呼吸+缩唇呼吸' },
        { id: 2, name: '胸廓松动', icon: '🙆', duration: '10min', completed: false, note: '重点左下肺' },
        { id: 3, name: '运动训练', icon: '🏃', duration: '20min', completed: false, note: '步行训练，监测血氧' }
      ],
      precautions: ['运动时监测血氧饱和度，低于94%立即停止', '避免剧烈咳嗽诱发']
    },
    treatmentLogs: [
      {
        date: '2026-01-10',
        items: ['呼吸训练', '胸廓松动', '运动训练'],
        highlight: '患儿配合度提高，呼吸训练时间延长至15分钟',
        notes: '血氧稳定在96-98%，运动耐力有所提升',
        therapist: '吴大勇'
      },
      {
        date: '2026-01-09',
        items: ['呼吸训练', '胸廓松动'],
        highlight: '首次尝试腹式呼吸训练',
        notes: '患儿初次接触，需要更多引导',
        therapist: '吴大勇'
      }
    ],
    homework: [
      { id: 1, task: '腹式呼吸练习 3次/日', completed: true, note: '家长反馈完成良好' },
      { id: 2, task: '吹气球游戏 2次/日', completed: false, note: '' }
    ]
  },
  {
    id: 2,
    name: '小红',
    age: '3岁8个月',
    gender: '女',
    bedNo: '302-2',
    departmentId: 1,
    department: '呼吸内科',
    avatar: '👧',
    diagnosis: '哮喘急性发作恢复期',
    admissionDate: '2026-01-08',
    status: 'active',
    todayTreated: true,
    safetyAlerts: ['过敏体质', '避免冷空气刺激'],
    rehabProblems: '呼吸控制能力弱，体能较差，情绪不稳定影响训练配合度',
    treatmentPlan: {
      focus: '哮喘康复训练，提高呼吸控制能力',
      highlights: ['⚠️ 今日患儿情绪不佳，改用游戏化训练方式'],
      items: [
        { id: 1, name: '游戏呼吸训练', icon: '🎮', duration: '15min', completed: true, note: '吹泡泡游戏' },
        { id: 2, name: '放松训练', icon: '🧘', duration: '10min', completed: true, note: '配合轻音乐' }
      ],
      precautions: ['严禁接触过敏原', '备好急救药物']
    },
    treatmentLogs: [
      {
        date: '2026-01-11',
        items: ['游戏呼吸训练', '放松训练'],
        highlight: '根据患儿情绪调整为游戏化训练，效果良好',
        notes: '患儿从抵触到主动参与，训练完成度100%',
        therapist: '吴大勇'
      }
    ],
    homework: [
      { id: 1, task: '每日吹泡泡5分钟', completed: true, note: '' }
    ]
  }
];

// 交付版：每个模块仅保留 2 条模拟数据
const defaultDepartments = allDepartments.slice(0, 2);
const initialPatients = allPatients.slice(0, 2);

// 科室图标映射（用于自动创建新科室时选择图标）
const departmentIconMap = {
  '呼吸': { icon: '🫁', color: 'bg-blue-100 text-blue-600' },
  '新生儿': { icon: '👶', color: 'bg-pink-100 text-pink-600' },
  '神经': { icon: '🧠', color: 'bg-purple-100 text-purple-600' },
  '骨科': { icon: '🦴', color: 'bg-amber-100 text-amber-600' },
  '心脏': { icon: '❤️', color: 'bg-red-100 text-red-600' },
  '消化': { icon: '🍽️', color: 'bg-green-100 text-green-600' },
  '肾脏': { icon: '💧', color: 'bg-cyan-100 text-cyan-600' },
  '内分泌': { icon: '⚗️', color: 'bg-indigo-100 text-indigo-600' },
  '血液': { icon: '🩸', color: 'bg-rose-100 text-rose-600' },
  '肿瘤': { icon: '🎗️', color: 'bg-violet-100 text-violet-600' },
  '感染': { icon: '🦠', color: 'bg-lime-100 text-lime-600' },
  '重症': { icon: '🏥', color: 'bg-slate-100 text-slate-600' },
  '康复': { icon: '🏃', color: 'bg-emerald-100 text-emerald-600' },
  '儿童': { icon: '👧', color: 'bg-orange-100 text-orange-600' },
  'default': { icon: '🏥', color: 'bg-gray-100 text-gray-600' }
};

// 治疗模板库
const treatmentTemplates = [
  {
    id: 1,
    category: '呼吸康复',
    icon: '🫁',
    color: 'bg-blue-50 border-blue-200',
    items: [
      { name: '腹式呼吸训练', duration: '10-15min', icon: '🫁' },
      { name: '缩唇呼吸训练', duration: '10min', icon: '💨' },
      { name: '胸廓松动术', duration: '15min', icon: '🙆' },
      { name: '体位引流', duration: '20min', icon: '🛏️' },
      { name: '有效咳嗽训练', duration: '10min', icon: '😤' },
      { name: '呼吸肌训练', duration: '15min', icon: '💪' }
    ]
  },
  {
    id: 2,
    category: '神经康复',
    icon: '🧠',
    color: 'bg-purple-50 border-purple-200',
    items: [
      { name: 'Bobath技术', duration: '25-30min', icon: '🤸' },
      { name: 'PNF技术', duration: '20min', icon: '🔄' },
      { name: '平衡训练', duration: '15-20min', icon: '⚖️' },
      { name: '步态训练', duration: '20-30min', icon: '🚶' },
      { name: '精细运动训练', duration: '20min', icon: '✋' },
      { name: '认知训练', duration: '15-20min', icon: '🧩' },
      { name: '感统训练', duration: '25min', icon: '🎯' },
      { name: '言语训练', duration: '20min', icon: '🗣️' }
    ]
  },
  {
    id: 3,
    category: '骨科康复',
    icon: '🦴',
    color: 'bg-orange-50 border-orange-200',
    items: [
      { name: '关节松动术', duration: '15-20min', icon: '🔄' },
      { name: '肌力训练', duration: '20min', icon: '💪' },
      { name: '牵伸训练', duration: '15min', icon: '🧘' },
      { name: '物理因子治疗', duration: '20min', icon: '⚡' },
      { name: '步态训练', duration: '20min', icon: '🚶' },
      { name: '平衡训练', duration: '15min', icon: '⚖️' }
    ]
  },
  {
    id: 4,
    category: '儿童特色',
    icon: '🎮',
    color: 'bg-pink-50 border-pink-200',
    items: [
      { name: '游戏化训练', duration: '20-30min', icon: '🎮' },
      { name: '音乐治疗', duration: '20min', icon: '🎵' },
      { name: '水中运动', duration: '30min', icon: '🏊' },
      { name: '亲子互动训练', duration: '25min', icon: '👨‍👩‍👧' },
      { name: '沙盘游戏', duration: '20min', icon: '🏖️' }
    ]
  }
];

// 排班数据
const scheduleData = [
  { time: '08:00', type: 'meeting', title: '晨会交班', location: '康复科办公室', duration: 30 },
  { time: '08:30', type: 'treatment', title: '查房 - 呼吸内科', location: '3楼呼吸内科', duration: 90, patients: 3 },
  { time: '10:00', type: 'treatment', title: '治疗 - 神经内科', location: '2楼神经内科', duration: 120, patients: 4 },
  { time: '12:00', type: 'break', title: '午餐休息', location: '', duration: 60 },
  { time: '13:00', type: 'treatment', title: '治疗 - 骨科', location: '1楼骨科', duration: 90, patients: 2 },
  { time: '14:30', type: 'consultation', title: '会诊 - ICU', location: 'ICU病房', duration: 45 },
  { time: '15:30', type: 'treatment', title: '治疗 - 呼吸内科', location: '3楼呼吸内科', duration: 90, patients: 2 },
  { time: '17:00', type: 'meeting', title: '病例讨论', location: '康复科办公室', duration: 60 }
];

// 消息数据
const messagesData = [
  {
    id: 1,
    from: '王医生',
    department: '神经内科',
    avatar: '👨‍⚕️',
    content: '小刚今天癫痫有发作迹象，训练时请注意观察',
    time: '08:15',
    unread: true,
    type: 'alert'
  },
  {
    id: 2,
    from: '李医生',
    department: '呼吸内科',
    avatar: '👩‍⚕️',
    content: '小明可以增加运动训练强度了，血氧稳定',
    time: '昨天',
    unread: false,
    type: 'normal'
  },
  {
    id: 3,
    from: '张医生',
    department: '骨科',
    avatar: '👨‍⚕️',
    content: '小强术后恢复良好，下周可以开始部分负重',
    time: '昨天',
    unread: false,
    type: 'normal'
  },
  {
    id: 4,
    from: '系统通知',
    department: '',
    avatar: '🔔',
    content: '您有3位患儿今日待治疗',
    time: '今天 07:00',
    unread: true,
    type: 'system'
  }
];

// ==================== 主应用组件 ====================
export default function RehabCareLink() {
  // 解析URL参数
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      deptId: params.get('dept') ? parseInt(params.get('dept')) : null,
      readonly: params.get('readonly') === 'true'
    };
  };

  const urlParams = getUrlParams();

  // 状态管理
  const [currentPage, setCurrentPage] = useState(() => {
    // 如果URL有科室参数，直接进入该科室患者列表
    if (urlParams.deptId) {
      return 'patients';
    }
    return 'home';
  });
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    // 如果URL有科室参数，设置该科室（从完整列表+localStorage中查找）
    if (urlParams.deptId) {
      const found = allDepartments.find(d => d.id === urlParams.deptId);
      if (found) return found;
      try {
        const saved = JSON.parse(localStorage.getItem('rehab_departments') || '[]');
        return saved.find(d => d.id === urlParams.deptId) || null;
      } catch { return null; }
    }
    return null;
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]); // 从后端加载，不使用硬编码数据
  const [isLoadingPatients, setIsLoadingPatients] = useState(true); // 数据加载状态
  // 如果URL有readonly参数，设置为医生模式
  const [userRole, setUserRole] = useState(urlParams.readonly ? 'doctor' : 'therapist');
  // 分享模式：只能查看特定科室
  const [sharedDeptId, setSharedDeptId] = useState(urlParams.deptId);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showBatchGenerate, setShowBatchGenerate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  // 状态管理
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [detailTab, setDetailTab] = useState('today'); // today | logs
  const [showAllPatients, setShowAllPatients] = useState(false); // 显示全部患者弹窗
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 显示删除确认对话框
  const [isEditingDetail, setIsEditingDetail] = useState(false); // 详情页编辑模式
  const [editedPatient, setEditedPatient] = useState(null); // 编辑中的患者数据
  const [showLogConfirm, setShowLogConfirm] = useState(false); // 显示日志确认对话框
  const [generatedLog, setGeneratedLog] = useState(null); // 生成的日志内容
  const [toast, setToast] = useState(null); // 提示消息

  // 动态科室列表（支持AI识别时自动添加新科室，从localStorage恢复）
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem('rehab_departments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultDepartments;
  });

  // 科室变更时持久化到localStorage
  useEffect(() => {
    localStorage.setItem('rehab_departments', JSON.stringify(departments));
  }, [departments]);

  // 科室编辑状态
  const [isEditingDepartments, setIsEditingDepartments] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', icon: '' });

  // AI收治状态
  const [aiStep, setAiStep] = useState(0); // 0:上传, 1:AI识别中, 2:表单填写
  const [aiResult, setAiResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // 上传的图片预览

  // 识别状态（使用useRef避免重新渲染）
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isSavingPatient, setIsSavingPatient] = useState(false); // 建档按钮独立loading状态
  const progressIntervalRef = useRef(null);

  // 批量生成状态
  const [batchPatients, setBatchPatients] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  // 显示Toast提示
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 刷新计数器 - 递增触发患者列表重新加载
  const [refreshCounter, setRefreshCounter] = useState(0);

  // 从后端加载患者数据
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoadingPatients(true);
        const res = await api('/api/patients');
        if (cancelled) return;
        const list = Array.isArray(res?.items) ? res.items : [];
        setPatients(list);
      } catch (e) {
        console.error('加载患者数据失败:', e);
      } finally {
        if (!cancelled) setIsLoadingPatients(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshCounter]);

  // 生成分享链接
  const generateShareLink = (deptId) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?dept=${deptId}&readonly=true`;
  };

  // 复制分享链接
  const copyShareLink = (dept) => {
    const link = generateShareLink(dept.id);
    navigator.clipboard.writeText(link).then(() => {
      showToast(`${dept.name}分享链接已复制！`);
    }).catch(() => {
      // 降级方案：创建临时输入框
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast(`${dept.name}分享链接已复制！`);
    });
  };

  // 浅比较辅助函数（性能优化）
  const hasPatientChanged = useCallback((p1, p2) => {
    if (!p1 || !p2) return p1 !== p2;
    // 只比较关键字段，避免深度比较
    return p1.id !== p2.id ||
           p1.name !== p2.name ||
           p1.updatedAt !== p2.updatedAt;
  }, []);

  // 保持selectedPatient与patients数组同步（只在列表版本有更多数据时更新）
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatient = patients.find(p => p.id === selectedPatient.id);
      if (updatedPatient && hasPatientChanged(updatedPatient, selectedPatient)) {
        // 不用精简版覆盖已有完整数据的 selectedPatient
        if (!selectedPatient.treatmentPlan || updatedPatient.treatmentPlan) {
          setSelectedPatient(updatedPatient);
        }
      }
    }
  }, [patients, selectedPatient, hasPatientChanged]);

  // 详情页：如果 selectedPatient 缺少 treatmentPlan，从后端拉取完整数据
  useEffect(() => {
    if (currentPage === 'patientDetail' && selectedPatient?.id && !selectedPatient.treatmentPlan) {
      api(`/api/patients/${selectedPatient.id}`).then(res => {
        if (res?.success && res.patient?.treatmentPlan) {
          setSelectedPatient(res.patient);
        }
      }).catch(() => {});
    }
  }, [currentPage, selectedPatient?.id, selectedPatient?.treatmentPlan]);

  // 导航函数 - 增强版：自动清理无关状态
  const navigateTo = (page, data = null) => {
    setCurrentPage(page);

    // 通用清理：编辑、AI、批量状态
    setIsEditingDetail(false);
    setEditedPatient(null);
    setAiResult(null);
    setAiStep(0);
    setUploadedImage(null);
    setOcrProgress(0);
    setOcrText('');
    setBatchPatients([]);
    setCurrentBatchIndex(0);

    // 清理旧状态，防止状态残留
    if (page === 'home') {
      setSelectedDepartment(null);
      setSelectedPatient(null);
      setDetailTab('today');
    }

    if (page === 'patients') {
      setSelectedPatient(null); // 清理患者选择
      setDetailTab('today'); // 重置tab
      if (data) {
        setSelectedDepartment(data);
      }
    }

    if (page === 'patientDetail' && data) {
      setSelectedPatient(data);
      setDetailTab('today');
    }

    setShowFabMenu(false);
  };

  const goBack = () => {
    // 通用清理：编辑、AI、批量状态
    setIsEditingDetail(false);
    setEditedPatient(null);
    setAiResult(null);
    setAiStep(0);
    setUploadedImage(null);
    setOcrProgress(0);
    setOcrText('');
    setBatchPatients([]);
    setCurrentBatchIndex(0);

    if (currentPage === 'patientDetail') {
      // 智能返回：有选中科室时返回患者列表，否则返回首页
      if (selectedDepartment) {
        setCurrentPage('patients');
      } else {
        setCurrentPage('home');
      }
      setSelectedPatient(null);
      setDetailTab('today'); // 重置tab状态
    } else if (currentPage === 'patients') {
      // 从患者列表返回首页
      if (!sharedDeptId) {
        setCurrentPage('home');
        setSelectedDepartment(null);
      }
    }
  };

  // 获取科室患者
  const getDepartmentPatients = (deptId) => {
    return patients.filter(p => p.departmentId === deptId);
  };

  // 完成治疗项目
  const toggleTreatmentItem = useCallback(async (patientId, itemId) => {
    if (userRole !== 'therapist') return;

    // 找到患者和更新后的数据
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newItems = patient.treatmentPlan.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedPatient = { ...patient, treatmentPlan: { ...patient.treatmentPlan, items: newItems } };

    // 更新patients列表
    setPatients(prev => prev.map(p =>
      p.id === patientId ? updatedPatient : p
    ));

    // 同时更新selectedPatient（修复详情页不能选择的问题）
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(updatedPatient);
    }

    // 同步到数据库
    try {
      await api(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: updatedPatient })
      });
    } catch (e) {
      console.error('保存治疗项目状态失败:', e);
    }
  }, [userRole, patients, selectedPatient?.id]);

  // 更新患者信息（同步到数据库）
  const updatePatient = async (patientId, updates) => {
    // 先更新本地状态（即时响应）
    const updatedPatient = patients.find(p => p.id === patientId);
    if (!updatedPatient) return;

    const newPatientData = { ...updatedPatient, ...updates };

    setPatients(prev => prev.map(p =>
      p.id === patientId ? newPatientData : p
    ));
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(newPatientData);
    }

    // 同步到数据库
    try {
      const res = await api(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: newPatientData })
      });
      if (!res?.success) {
        console.error('保存到数据库失败:', res?.error);
      }
    } catch (e) {
      console.error('保存到数据库失败:', e);
    }
  };

  // 删除患者
  const deletePatient = async (patientId) => {
    try {
      const res = await api(`/api/patients/${patientId}`, { method: 'DELETE' });
      // 删除成功（204状态码不返回JSON）
      setPatients(prev => prev.filter(p => p.id !== patientId));
      setRefreshCounter(c => c + 1);
      setSelectedPatient(null);
      setShowDeleteConfirm(false);
      navigateTo('home');
      showToast('患者已删除', 'success');
    } catch (err) {
      showToast(err.message || '删除失败', 'error');
    }
  };

  async function createCaseWithFiles(files) {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    const res = await api('/api/cases', { method: 'POST', body: form });
    if (!res?.success) throw new Error(res?.error || '创建病例失败');
    return res.caseId;
  }

  async function extractProfile(caseId) {
    const res = await api(`/api/cases/${caseId}/extract`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!res?.success) throw new Error(res?.error || '抽取失败');
    return { runId: res.runId, profile: res.profile };
  }

  async function generatePlan(caseId, profile) {
    const res = await api(`/api/cases/${caseId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    if (!res?.success) throw new Error(res?.error || '生成方案失败');
    return { runId: res.runId, plan: res.plan };
  }

  // 一次性分析：提取信息+生成方案（更快）
  async function analyzeCase(caseId) {
    const res = await api(`/api/cases/${caseId}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!res?.success) throw new Error(res?.error || '分析失败');
    return { profile: res.profile, plan: res.plan };
  }

  // AI分析 - 处理图片上传并调用通义千问3-VL-Plus（无需 OCR）
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter(Boolean);
    e.target.value = '';
    if (files.length) {
      const first = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        setUploadedImage(reader.result);
        setAiStep(1); // 进入AI识别步骤
        setIsOcrProcessing(true);

        try {
          const caseId = await createCaseWithFiles(files);

          let profile = null;
          let plan = null;

          try {
            // 使用一次性分析接口（更快：合并提取+生成方案）
            const result = await analyzeCase(caseId);
            profile = result.profile;
            plan = result.plan;
          } catch (analyzeError) {
            console.warn('一次性分析失败，尝试分步处理:', analyzeError);
            // 降级：分步处理
            try {
              const extractResult = await extractProfile(caseId);
              profile = extractResult.profile;
              try {
                const planResult = await generatePlan(caseId, profile);
                plan = planResult.plan;
              } catch (planError) {
                console.warn('生成方案超时，允许手动填写:', planError);
                showToast('AI生成方案超时，请手动填写治疗方案', 'warning');
              }
            } catch (extractError) {
              throw new Error('识别患者信息失败: ' + extractError.message);
            }
          }

          // 初始化表单数据
          const safeGender = ['男', '女', '未知'].includes(profile?.patient?.gender) ? profile.patient.gender : '未知';
          const planGasGoals = Array.isArray(plan?.gasGoals) ? plan.gasGoals : [];

          // 获取康复问题（优先使用AI返回的，否则自动生成）
          const getRehabProblems = () => {
            // 优先使用AI直接返回的康复问题
            if (profile?.rehabProblems) {
              return profile.rehabProblems;
            }
            // 否则基于诊断、关键发现和风险自动生成
            const parts = [];
            if (profile?.keyFindings?.length) {
              parts.push(...profile.keyFindings.slice(0, 2));
            }
            if (plan?.highlights?.length) {
              parts.push(...plan.highlights.slice(0, 2));
            }
            if (profile?.monitoring?.length) {
              parts.push(`需监测：${profile.monitoring.slice(0, 2).join('、')}`);
            }
            return parts.length > 0 ? parts.join('；') : '';
          };

          // 构建 items，并行预取备选方案
          const rawItems = Array.isArray(plan?.items)
            ? plan.items.map((it, idx) => ({
                id: Date.now() + idx,
                name: it.name || '',
                icon: '🎯',
                duration: it.duration || '',
                completed: false,
                note: it.notes || '',
                category: it.category || 'active',
              }))
            : [];

          const itemsWithAlts = await Promise.all(
            rawItems.map(async (item) => {
              try {
                const altRes = await api('/api/treatment/alternatives', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ currentItemId: item.id, category: item.category, currentPlan: rawItems })
                });
                if (altRes?.success && altRes.alternatives?.length > 0) {
                  return { ...item, _alternatives: altRes.alternatives, _altIndex: 0 };
                }
              } catch {}
              return item;
            })
          );

          setAiResult({
            _caseId: caseId,
            name: profile?.patient?.name || '',
            age: profile?.patient?.age || '',
            gender: safeGender || '未知',
            diagnosis: profile?.patient?.diagnosis || '',
            department: profile?.patient?.department || '呼吸内科',
            bedNo: profile?.patient?.bedNo || '',
            medicalRecordImage: reader.result,
            rehabProblems: getRehabProblems(),
            treatmentPlan: {
              focus: plan?.focus || '',
              highlights: [],
              items: itemsWithAlts,
              precautions: Array.isArray(plan?.precautions) ? plan.precautions : []
            },
            safetyAlerts: Array.isArray(profile?.risks) ? profile.risks : []
          });

          setAiStep(2); // 进入表单填写步骤
          // 移除toast提示，静默进入编辑模式

        } catch (error) {
          console.error('AI识别失败:', error);
          showToast('AI识别失败: ' + error.message, 'error');
          // 即使失败也允许手动填写
          setAiResult({
            _caseId: null,
            name: '',
            age: '',
            gender: '未知',
            diagnosis: '',
            department: '呼吸内科',
            bedNo: '',
            medicalRecordImage: reader.result,
            rehabProblems: '',
            treatmentPlan: {
              focus: '',
              highlights: [],
              items: [],
              precautions: []
            },
            safetyAlerts: []
          });
          setAiStep(2);
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(first);
    }
  };

  const handleGeneratePlan = async () => {
    if (!aiResult?._caseId) {
      showToast('缺少病例ID，请重新上传', 'error');
      return;
    }
    setIsOcrProcessing(true);
    try {
      // 优先使用模板库智能匹配
      let plan = null;
      try {
        const matchResponse = await api('/api/treatment/match-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagnosis: aiResult.diagnosis,
            patientState: aiResult.patientState || '配合度良好',
            age: parseInt(aiResult.age) || 60
          })
        });
        if (matchResponse.success && matchResponse.plan) {
          plan = matchResponse.plan;
          showToast('已根据患儿状态智能匹配治疗方案', 'success');
        }
      } catch (matchError) {
        console.warn('模板匹配失败，尝试AI生成:', matchError);
      }

      // 如果模板匹配失败，使用AI生成
      if (!plan) {
        const profile = {
          patient: {
            name: aiResult.name,
            gender: aiResult.gender,
            age: aiResult.age,
            bedNo: aiResult.bedNo,
            department: aiResult.department,
            diagnosis: aiResult.diagnosis,
            admissionDate: null,
          },
          risks: aiResult.safetyAlerts || [],
        };
        const result = await generatePlan(aiResult._caseId, profile);
        plan = result.plan;
        showToast('AI生成方案完成', 'success');
      }

      // 构建 items 数组
      const newItems = Array.isArray(plan.items)
        ? plan.items.map((it, idx) => ({
            id: it.id || Date.now() + idx,
            name: it.name || '',
            icon: it.icon || '🎯',
            duration: it.duration || '',
            completed: false,
            note: it.note || it.notes || '',
            category: it.category || 'active',
            适用状态: it.适用状态 || [],
            禁忌: it.禁忌 || []
          }))
        : [];

      // 并行预取每个项目的备选方案
      const itemsWithAlts = await Promise.all(
        newItems.map(async (item) => {
          try {
            const altRes = await api('/api/treatment/alternatives', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentItemId: item.id, category: item.category, currentPlan: newItems })
            });
            if (altRes?.success && altRes.alternatives?.length > 0) {
              return { ...item, _alternatives: altRes.alternatives, _altIndex: 0 };
            }
          } catch {}
          return item;
        })
      );

      setAiResult((prev) => ({
        ...prev,
        treatmentPlan: {
          focus: plan.focus || prev.treatmentPlan.focus,
          highlights: [],
          items: newItems.length > 0 ? itemsWithAlts : prev.treatmentPlan.items,
          precautions: Array.isArray(plan.precautions) ? plan.precautions : prev.treatmentPlan.precautions,
        },
      }));
      showToast('方案生成完成，请检查后点击"确认建档"', 'success');
    } catch (e) {
      showToast(e.message || '生成方案失败', 'error');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // 更新表单字段
  const updateFormField = (field, value) => {
    setAiResult(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 生成今日治疗日志（调用AI生成个性化日志，支持补充说明）
  const generateTodayLog = useCallback(async (patient, todayNotes = '') => {
    if (!patient) return;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 收集已完成的治疗项目
    const completedItems = patient.treatmentPlan.items
      .filter(item => item.completed)
      .map(item => ({ name: item.name, duration: item.duration || '5分钟' }));

    const itemsForLog = completedItems.length > 0
      ? completedItems
      : patient.treatmentPlan.items.map(item => ({ name: item.name, duration: item.duration || '5分钟' }));

    try {
      const res = await api(`/api/patients/${patient.id}/generate-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: { name: patient.name, age: patient.age, diagnosis: patient.diagnosis, admissionDate: patient.admissionDate },
          treatmentPlan: patient.treatmentPlan,
          completedItems: itemsForLog,
          previousLogs: (patient.treatmentLogs || []).slice(0, 3),
          supplementNotes: todayNotes || patient.supplementNotes || '',
        }),
      });

      if (res?.success && res.log) {
        const log = res.log;
        const itemDetails = (log.items || itemsForLog).map(i => `• ${i.name}（${i.duration}）${i.detail ? '：' + i.detail : ''}`).join('\n');
        const detailRecord = `【训练重点】\n${log.highlight}\n\n【完成项目】\n${itemDetails}\n\n【配合情况】\n配合度：${log.cooperation} | 耐受性：${log.tolerance}\n\n【观察记录】\n${log.notes}\n\n【安全提醒】\n${log.safety}`;

        const newLog = {
          date: dateStr,
          highlight: log.highlight,
          items: log.items || itemsForLog,
          cooperation: log.cooperation,
          tolerance: log.tolerance,
          notes: log.notes,
          safety: log.safety,
          detailRecord,
          therapist: '吴大勇'
        };

        setGeneratedLog(newLog);
        setShowLogConfirm(true);
        return;
      }
    } catch (e) {
      console.warn('AI生成日志失败，使用本地模板:', e);
    }

    // AI失败时的本地降级方案
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const cooperationOptions = ['优秀', '优秀', '良好', '良好', '良好', '一般'];
    const toleranceOptions = ['优秀', '优秀', '良好', '良好', '良好', '一般'];

    const logTemplates = patient.logTemplates || [];
    let selectedTemplate;

    if (logTemplates.length > 0) {
      const randomIndex = Math.floor(Math.random() * logTemplates.length);
      selectedTemplate = { ...logTemplates[randomIndex] };
      if (Math.random() > 0.7) selectedTemplate.cooperation = getRandomElement(cooperationOptions);
      if (Math.random() > 0.7) selectedTemplate.tolerance = getRandomElement(toleranceOptions);
    } else {
      const cooperation = getRandomElement(cooperationOptions);
      const tolerance = getRandomElement(toleranceOptions);
      selectedTemplate = {
        highlight: `患儿今日${cooperation === '优秀' ? '主动' : ''}配合训练，完成计划项目`,
        cooperation,
        tolerance,
        notes: `患儿今日精神${cooperation === '优秀' ? '饱满' : '尚可'}，情绪${tolerance === '优秀' ? '稳定' : '平稳'}。训练时${cooperation === '优秀' ? '主动配合' : '基本配合'}，完成计划项目。训练后${tolerance === '优秀' ? '无明显疲劳' : '略感疲劳'}，未见不适主诉。`,
        safety: patient.treatmentPlan.precautions?.[0] || '继续观察患儿反应，如有不适及时调整'
      };
    }

    const itemDetails = itemsForLog.map(i => `• ${i.name}（${i.duration}）`).join('\n');
    const detailRecord = `【训练重点】\n${selectedTemplate.highlight}\n\n【完成项目】\n${itemDetails}\n\n【配合情况】\n配合度：${selectedTemplate.cooperation} | 耐受性：${selectedTemplate.tolerance}\n\n【观察记录】\n${selectedTemplate.notes}\n\n【安全提醒】\n${selectedTemplate.safety}`;

    const newLog = {
      date: dateStr,
      highlight: selectedTemplate.highlight,
      items: itemsForLog,
      cooperation: selectedTemplate.cooperation,
      tolerance: selectedTemplate.tolerance,
      notes: selectedTemplate.notes,
      safety: selectedTemplate.safety,
      detailRecord,
      therapist: '吴大勇'
    };

    setGeneratedLog(newLog);
    setShowLogConfirm(true);
  }, []);

  // 确认保存日志
  const confirmSaveLog = useCallback(async () => {
    if (!generatedLog || !selectedPatient) return;

    // 更新患者的治疗日志
    const updatedLogs = [generatedLog, ...(selectedPatient.treatmentLogs || [])];

    // 先更新selectedPatient确保详情页正确显示
    const updatedPatient = {
      ...selectedPatient,
      treatmentLogs: updatedLogs,
      todayTreated: true
    };
    setSelectedPatient(updatedPatient);

    // 同步更新patients列表
    setPatients(prev => prev.map(p =>
      p.id === selectedPatient.id ? updatedPatient : p
    ));

    // 同步到数据库
    try {
      await api(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: updatedPatient })
      });
    } catch (e) {
      console.error('保存日志到数据库失败:', e);
    }

    // 关闭对话框并切换到日志tab
    setShowLogConfirm(false);
    setGeneratedLog(null);
    setDetailTab('logs');
    showToast('今日治疗日志已保存', 'success');
  }, [generatedLog, selectedPatient, showToast]);

  // 切换编辑模式
  const toggleEditMode = useCallback(() => {
    if (!isEditingDetail) {
      // 进入编辑模式，深拷贝患者数据（包含treatmentLogs）
      setEditedPatient(JSON.parse(JSON.stringify(selectedPatient)));
      setIsEditingDetail(true);
    } else {
      // 退出编辑模式，放弃更改
      setEditedPatient(null);
      setIsEditingDetail(false);
    }
  }, [isEditingDetail, selectedPatient]);

  // 保存编辑
  const savePatientEdit = useCallback(async () => {
    if (!editedPatient) return;

    // 调用updatePatient会自动同步到数据库
    await updatePatient(editedPatient.id, editedPatient);
    setIsEditingDetail(false);
    setEditedPatient(null);
    showToast('保存成功', 'success');
  }, [editedPatient, updatePatient, showToast]);

  // 添加治疗项目
  const addTreatmentItem = () => {
    setAiResult(prev => ({
      ...prev,
      treatmentPlan: {
        ...prev.treatmentPlan,
        items: [...prev.treatmentPlan.items, {
          id: Date.now(),
          name: '',
          icon: '💊',
          duration: '',
          completed: false,
          note: ''
        }]
      }
    }));
  };

  // 更新治疗项目
  const updateTreatmentItem = (index, field, value) => {
    setAiResult(prev => ({
      ...prev,
      treatmentPlan: {
        ...prev.treatmentPlan,
        items: prev.treatmentPlan.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  // 删除治疗项目
  const removeTreatmentItem = (index) => {
    setAiResult(prev => ({
      ...prev,
      treatmentPlan: {
        ...prev.treatmentPlan,
        items: prev.treatmentPlan.items.filter((_, i) => i !== index)
      }
    }));
  };

  // 轮换到下一个备选方案（直接替换，无需弹窗）
  const replaceWithAlternative = (index) => {
    setAiResult(prev => {
      const items = prev.treatmentPlan.items;
      const item = items[index];
      const alternatives = item._alternatives;
      if (!alternatives || alternatives.length === 0) return prev;
      const nextIndex = ((item._altIndex || 0) + 1) % alternatives.length;
      const nextAlt = alternatives[nextIndex];
      return {
        ...prev,
        treatmentPlan: {
          ...prev.treatmentPlan,
          items: items.map((it, i) => i !== index ? it : {
            ...nextAlt,
            id: Date.now(),
            completed: false,
            _alternatives: alternatives,
            _altIndex: nextIndex,
          })
        }
      };
    });
  };

  // 添加安全提醒
  const addSafetyAlert = (alert) => {
    if (alert && !aiResult.safetyAlerts.includes(alert)) {
      setAiResult(prev => ({
        ...prev,
        safetyAlerts: [...prev.safetyAlerts, alert]
      }));
    }
  };

  // 删除安全提醒
  const removeSafetyAlert = (index) => {
    setAiResult(prev => ({
      ...prev,
      safetyAlerts: prev.safetyAlerts.filter((_, i) => i !== index)
    }));
  };

  // 验证表单
  const validateForm = () => {
    if (!aiResult.name.trim()) {
      showToast('请输入患儿姓名', 'error');
      return false;
    }
    if (!aiResult.age.trim()) {
      showToast('请输入患儿年龄', 'error');
      return false;
    }
    if (!aiResult.diagnosis.trim()) {
      showToast('请输入诊断信息', 'error');
      return false;
    }
    if (!aiResult.bedNo.trim()) {
      showToast('请输入床号', 'error');
      return false;
    }
    return true;
  };

  // 确认收治 - 真正保存患者数据
  const confirmAdmission = () => {
    if (!validateForm()) return;

    // 根据科室名称找到对应的departmentId，如果不存在则创建新科室
    const getOrCreateDept = (deptName) => {
      const existingDept = departments.find(d => d.name === deptName);
      if (existingDept) {
        return existingDept.id;
      }

      // 创建新科室
      const newDeptId = Math.max(...departments.map(d => d.id), 0) + 1;

      // 根据科室名称匹配图标
      let iconConfig = departmentIconMap.default;
      for (const [keyword, config] of Object.entries(departmentIconMap)) {
        if (keyword !== 'default' && deptName.includes(keyword)) {
          iconConfig = config;
          break;
        }
      }

      const newDept = {
        id: newDeptId,
        name: deptName,
        icon: iconConfig.icon,
        color: iconConfig.color,
        patients: 0,
        pending: 0
      };

      // 添加到科室列表
      setDepartments(prev => [...prev, newDept]);
      showToast(`已自动创建新科室：${deptName}`, 'success');

      return newDeptId;
    };

    // 根据年龄选择头像
    const getAvatar = (age) => {
      if (age.includes('天') || age.includes('月')) return '👶';
      if (age.includes('岁')) {
        const years = parseInt(age);
        if (years <= 3) return '👶';
        if (years <= 6) return Math.random() > 0.5 ? '👦' : '👧';
      }
      return aiResult.gender === '男' ? '👦' : '👧';
    };

    const newPatient = {
      name: aiResult.name.trim(),
      age: aiResult.age.trim(),
      gender: aiResult.gender,
      bedNo: aiResult.bedNo.trim(),
      departmentId: getOrCreateDept(aiResult.department),
      department: aiResult.department,
      avatar: getAvatar(aiResult.age),
      diagnosis: aiResult.diagnosis.trim(),
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
      todayTreated: false,
      medicalRecordImage: aiResult.medicalRecordImage, // 保存病历图片
      rehabProblems: aiResult.rehabProblems || '', // 当下存在的康复问题
      safetyAlerts: aiResult.safetyAlerts,
      treatmentPlan: {
        focus: aiResult.treatmentPlan.focus || '康复训练',
        highlights: aiResult.treatmentPlan.highlights.filter(h => h.trim()),
        items: aiResult.treatmentPlan.items.filter(item => item.name.trim()),
        precautions: aiResult.treatmentPlan.precautions.filter(p => p.trim())
      },
      treatmentLogs: [],
      homework: []
    };

    // 写入后端（MySQL）并刷新列表
    setIsSavingPatient(true); // 只更新按钮状态，不触发整个Modal重渲染

    // 使用async/await确保所有状态更新在一起
    const savePatient = async () => {
      try {
        const res = await api('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient: newPatient, plan: newPatient.treatmentPlan, caseId: aiResult._caseId || null }),
        });
        if (!res?.success) throw new Error(res?.error || '保存失败');

        // 直接使用返回的患者数据，避免额外的列表请求
        const created = res.patient || { ...newPatient, id: res.patientId };

        // 更新本地列表并触发后台刷新确保数据一致
        setPatients(prev => [...prev, created]);
        setRefreshCounter(c => c + 1);

        // 一次性关闭弹窗并重置所有状态
        setShowAIModal(false);
        setAiStep(0);
        setAiResult(null);
        setUploadedImage(null);
        setOcrText('');
        setOcrProgress(0);

        // 跳转到患儿详情页
        navigateTo('patientDetail', created);
        showToast('建档成功', 'success');
      } catch (e) {
        console.error('建档失败:', e);
        showToast(e.message || '保存失败，请重试', 'error');
      } finally {
        setIsSavingPatient(false);
      }
    };

    savePatient();
  };

  // 清除所有示例数据
  const clearDemoData = () => {
    if (window.confirm('确定要清除所有示例数据吗？这将删除ID小于1000的所有患者。')) {
      showToast('当前版本已改为 MySQL 存储，请在数据库侧清理或联系管理员。', 'error');
    }
  };

  // 导出数据
  const exportData = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `康复患者数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('数据导出成功');
  };

  // 初始化批量生成
  const initBatchGenerate = () => {
    const todayPending = patients.filter(p => p.status === 'active' && !p.todayTreated);
    setBatchPatients(todayPending.map(p => ({
      ...p,
      generatedRecord: {
        items: p.treatmentPlan.items.map(i => i.name),
        highlight: `常规${p.treatmentPlan.focus}训练`,
        notes: '患儿配合良好，训练顺利完成',
        confirmed: false
      }
    })));
    setCurrentBatchIndex(0);
    setShowBatchGenerate(true);
  };

  // 确认单个日报
  const confirmBatchItem = (index, record) => {
    setBatchPatients(prev => prev.map((p, i) =>
      i === index ? { ...p, generatedRecord: { ...record, confirmed: true } } : p
    ));
    // 更新患者状态
    const patient = batchPatients[index];
    const newLog = {
      date: new Date().toISOString().split('T')[0],
      items: record.items,
      highlight: record.highlight,
      notes: record.notes,
      therapist: '吴大勇'
    };
    updatePatient(patient.id, {
      todayTreated: true,
      treatmentLogs: [newLog, ...patient.treatmentLogs]
    });

    if (index < batchPatients.length - 1) {
      setCurrentBatchIndex(index + 1);
    }
  };

  // ==================== 渲染组件 ====================

  // 医院Logo组件 - 基于南京儿童医院logo
  const HospitalLogo = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="flex-shrink-0">
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#1e3a6e'}}/>
          <stop offset="100%" style={{stopColor:'#152a52'}}/>
        </linearGradient>
        <linearGradient id="childGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor:'#e84c88'}}/>
          <stop offset="100%" style={{stopColor:'#d84a7e'}}/>
        </linearGradient>
      </defs>
      {/* 深蓝色叶片/翅膀 */}
      <path d="M15 85 Q25 55 55 40 Q75 35 90 45 Q85 60 70 75 Q50 90 15 85" fill="url(#leafGrad)"/>
      {/* 金黄色点缀 */}
      <path d="M32 62 Q28 50 35 42 Q42 50 38 62 Q35 65 32 62" fill="#F7C948"/>
      {/* 粉色儿童头像轮廓 */}
      <ellipse cx="58" cy="28" rx="14" ry="16" fill="url(#childGrad)"/>
      <path d="M44 42 Q42 55 48 65 Q54 72 64 70 Q72 65 74 55 Q76 45 70 40 Q64 38 58 42 Q50 38 44 42" fill="url(#childGrad)"/>
      {/* 脸部轮廓细节 - 鼻子和嘴的暗示 */}
      <path d="M62 30 Q65 32 66 36 Q64 38 62 36" fill="#c43d6d" opacity="0.3"/>
    </svg>
  );

  // 顶部Header - 浅色毛玻璃风格（与首页统一）
  const Header = ({ title, showBack = false, rightAction = null, showLogo = false }) => (
    <div className="sticky top-0 z-40">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/80 border-b border-slate-100" />
      <div className="relative px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={goBack} className="p-2 -ml-2 rounded-full transition-all duration-200 active:scale-95 hover:bg-slate-100">
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
          )}
          {showLogo && <HospitalLogo size={36} />}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">{title}</h1>
            {showLogo && <p className="text-xs -mt-0.5 text-slate-500">康复云查房助手</p>}
          </div>
        </div>
        {rightAction}
      </div>
    </div>
  );

  // 底部导航 - 浅色毛玻璃风格
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 bottom-nav" />
      <div className="relative px-6 py-2 flex items-center justify-between safe-area-bottom">
        <NavItem
          icon={<Home size={22} />}
          label="首页"
          active={['home', 'patients', 'patientDetail'].includes(currentPage)}
          onClick={() => navigateTo('home')}
        />

        {/* 中间悬浮按钮 */}
        {userRole === 'therapist' && (
          <div className="relative -mt-8">
            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                showFabMenu
                  ? 'bg-slate-600 rotate-45'
                  : 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-300/50'
              }`}
            >
              <Plus size={28} className="text-white" />
            </button>

            {/* FAB菜单 */}
            {showFabMenu && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl p-2 min-w-[200px] shadow-xl border border-slate-100 animate-scale-in">
                <FabMenuItem icon={<Sparkles size={20} />} label="AI智能收治" color="text-blue-500" onClick={() => { setShowAIModal(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<Zap size={20} />} label="批量生成日报" color="text-amber-500" onClick={() => { initBatchGenerate(); setShowFabMenu(false); }} />
                <FabMenuItem icon={<BookOpen size={20} />} label="治疗模板库" color="text-emerald-500" onClick={() => { setShowTemplates(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<ClipboardList size={20} />} label="快速录入" color="text-rose-500" onClick={() => { setShowQuickEntry(true); setShowFabMenu(false); }} />
              </div>
            )}
          </div>
        )}
        {userRole === 'doctor' && <div className="w-14" />}

        <NavItem
          icon={<User size={22} />}
          label="我的"
          active={currentPage === 'profile'}
          onClick={() => navigateTo('profile')}
        />
      </div>
    </div>
  );

  const NavItem = React.memo(({ icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
        active ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${active ? 'text-blue-500' : ''}`}>{label}</span>
    </button>
  ));

  const FabMenuItem = ({ icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 rounded-xl transition-all duration-200 active:scale-98"
    >
      <span className={color}>{icon}</span>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </button>
  );


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

  // ==================== 弹窗组件 ====================
  // Modal components have been extracted to src/modals/

  // ==================== 主渲染 ====================
  return (
    <div className="max-w-md mx-auto min-h-screen relative gradient-bg-soft">
      {/* 页面路由 - Wrapped with Suspense for code splitting */}
      <Suspense fallback={<LoadingSpinner />}>
        {currentPage === 'home' && (
          <HomePage
            userRole={userRole}
            patients={patients}
            isLoadingPatients={isLoadingPatients}
            departments={departments}
            getDepartmentPatients={getDepartmentPatients}
            navigateTo={navigateTo}
            setShowAIModal={setShowAIModal}
            initBatchGenerate={initBatchGenerate}
            isEditingDepartments={isEditingDepartments}
            setIsEditingDepartments={setIsEditingDepartments}
            setDepartments={setDepartments}
            showToast={showToast}
            setShowAddDepartment={setShowAddDepartment}
          />
        )}
        {currentPage === 'patients' && (
          <PatientsPage
            selectedDepartment={selectedDepartment}
            getDepartmentPatients={getDepartmentPatients}
            isLoadingPatients={isLoadingPatients}
            goBack={goBack}
            navigateTo={navigateTo}
          />
        )}
        {currentPage === 'patientDetail' && (
          <PatientDetailPage
            selectedPatient={selectedPatient}
            userRole={userRole}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            isEditingDetail={isEditingDetail}
            editedPatient={editedPatient}
            setEditedPatient={setEditedPatient}
            goBack={goBack}
            savePatientEdit={savePatientEdit}
            toggleEditMode={toggleEditMode}
            setShowDeleteConfirm={setShowDeleteConfirm}
            toggleTreatmentItem={toggleTreatmentItem}
            generateTodayLog={generateTodayLog}
            setShowQuickEntry={setShowQuickEntry}
            updatePatient={updatePatient}
          />
        )}
        {currentPage === 'profile' && (
          <ProfilePage
            userRole={userRole}
            setUserRole={setUserRole}
            setShowTemplates={setShowTemplates}
          />
        )}
      </Suspense>

      {/* 底部导航 */}
      <BottomNav />

      {/* 弹窗 - Wrapped with Suspense for code splitting */}
      <Suspense fallback={null}>
        <AIIntakeModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        aiStep={aiStep}
        setAiStep={setAiStep}
        aiResult={aiResult}
        setAiResult={setAiResult}
        uploadedImage={uploadedImage}
        setUploadedImage={setUploadedImage}
        ocrText={ocrText}
        setOcrText={setOcrText}
        ocrProgress={ocrProgress}
        setOcrProgress={setOcrProgress}
        handleImageUpload={handleImageUpload}
        updateFormField={updateFormField}
        addSafetyAlert={addSafetyAlert}
        removeSafetyAlert={removeSafetyAlert}
        addTreatmentItem={addTreatmentItem}
        updateTreatmentItem={updateTreatmentItem}
        removeTreatmentItem={removeTreatmentItem}
        replaceWithAlternative={replaceWithAlternative}
        handleGeneratePlan={handleGeneratePlan}
        confirmAdmission={confirmAdmission}
        isOcrProcessing={isOcrProcessing}
        isSavingPatient={isSavingPatient}
        departments={departments}
      />

        <BatchReportModal
          isOpen={showBatchGenerate}
          onClose={() => setShowBatchGenerate(false)}
          batchPatients={batchPatients}
          currentBatchIndex={currentBatchIndex}
          setCurrentBatchIndex={setCurrentBatchIndex}
          confirmBatchItem={confirmBatchItem}
          printBatchRecords={printBatchRecords}
        />

        <TemplatesModal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          treatmentTemplates={treatmentTemplates}
        />

        <QuickEntryModal
          isOpen={showQuickEntry}
          onClose={() => setShowQuickEntry(false)}
          treatmentTemplates={treatmentTemplates}
        />

        {/* 添加科室弹窗 */}
        <DepartmentModal
        isOpen={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        newDepartment={newDepartment}
        setNewDepartment={setNewDepartment}
        allDepartments={allDepartments}
        onSave={(dept) => {
          const colors = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-red-100 text-red-600',
            'bg-cyan-100 text-cyan-600',
            'bg-pink-100 text-pink-600',
            'bg-amber-100 text-amber-600',
            'bg-orange-100 text-orange-600',
          ];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];

          const newDept = {
            id: Math.max(...departments.map(d => d.id)) + 1,
            name: dept.name.trim(),
            icon: dept.icon,
            color: randomColor,
            patients: 0,
            pending: 0
          };

          setDepartments([...departments, newDept]);
          showToast('科室添加成功');
        }}
        showToast={showToast}
      />
      </Suspense>

      {/* 全部患者弹窗 */}
      {showAllPatients && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowAllPatients(false)}>
          <div className="bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-2xl rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto border-t border-white/80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800">全部患者 ({patients.length})</h3>
              <button onClick={() => setShowAllPatients(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {patients.filter(p => p.status === 'active').map(patient => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setShowAllPatients(false);
                    navigateTo('patientDetail', patient);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl rounded-2xl p-3 border border-white/50 shadow-sm hover:bg-white/80 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-xl border-2 border-white shadow-sm">
                      {patient.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{patient.name}</span>
                        <span className="text-xs text-slate-400">{patient.age}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded-lg">{patient.bedNo}</span>
                      </div>
                      <p className="text-xs text-slate-500">{patient.department} · {patient.diagnosis}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && selectedPatient && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">确认删除</h3>
                <p className="text-sm text-slate-400">此操作无法撤销</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              确定要删除患者 <span className="font-bold text-slate-800">{selectedPatient.name}</span> 的所有信息吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => deletePatient(selectedPatient.id)}
                className="flex-1 btn-particle btn-particle-rose py-2.5 rounded-xl"
              >
                <div className="points_wrapper">
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                </div>
                <span className="inner">
                  确认删除
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日志确认对话框 */}
      {showLogConfirm && generatedLog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowLogConfirm(false)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto border border-white/80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <FileText size={24} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">确认治疗日志</h3>
                <p className="text-sm text-slate-400">{generatedLog.date}</p>
              </div>
            </div>

            {/* 今日重点 - 可编辑 */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <Star size={16} className="text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <textarea
                    value={generatedLog.highlight}
                    onChange={(e) => setGeneratedLog({ ...generatedLog, highlight: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-700 leading-relaxed bg-transparent border-none outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* 训练项目 */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block font-medium">完成项目</label>
              <div className="flex flex-wrap gap-2">
                {generatedLog.items.map((item, i) => (
                  <span key={i} className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl text-sm font-medium">
                    {item.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 详细记录 - 可编辑 */}
            <div className="mb-6">
              <label className="text-xs text-slate-400 mb-2 block font-medium">详细记录</label>
              <textarea
                value={generatedLog.detailRecord}
                onChange={(e) => setGeneratedLog({ ...generatedLog, detailRecord: e.target.value })}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSaveLog}
                className="flex-1 btn-particle btn-particle-emerald py-2.5 rounded-xl"
              >
                <div className="points_wrapper">
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                </div>
                <span className="inner">
                  确认保存
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast提示 */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-slide-up ${
          toast.type === 'success' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/20 rounded-full">
            <X size={18} />
          </button>
        </div>
      )}

      {/* 全局样式 */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
