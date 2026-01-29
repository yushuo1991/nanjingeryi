// Version: 2.0.2 - Performance optimization
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
} from 'lucide-react';

import { api } from './lib/api';
import { printPatientRecord, printBatchRecords } from './lib/print';

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
  { id: 1, name: '呼吸内科', icon: '🫁', color: 'bg-blue-100 text-blue-600', patients: 8, pending: 5 },
  { id: 6, name: '新生儿科', icon: '👶', color: 'bg-pink-100 text-pink-600', patients: 3, pending: 2 },
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
    gasScore: 65,
    gasGoals: [
      { name: '呼吸功能', target: 80, current: 70 },
      { name: '运动耐力', target: 75, current: 55 },
      { name: '日常活动', target: 90, current: 72 }
    ],
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
    gasScore: 45,
    gasGoals: [
      { name: '呼吸控制', target: 85, current: 50 },
      { name: '体能恢复', target: 70, current: 38 }
    ],
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
const initialDepartments = allDepartments.slice(0, 2);
const initialPatients = allPatients.slice(0, 2);

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
    // 如果URL有科室参数，设置该科室
    if (urlParams.deptId) {
      return initialDepartments.find(d => d.id === urlParams.deptId) || null;
    }
    return null;
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(() => {
    return initialPatients;
  });
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

  // 从后端加载患者数据（MySQL）
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api('/api/patients');
        if (cancelled) return;
        const list = Array.isArray(res?.items) ? res.items : [];
        if (list.length) setPatients(list);
      } catch (e) {
        // 后端不可用时仍允许使用前端演示数据
        console.warn(e);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 显示Toast提示
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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

  // 保持selectedPatient与patients数组同步
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatient = patients.find(p => p.id === selectedPatient.id);
      if (updatedPatient && hasPatientChanged(updatedPatient, selectedPatient)) {
        setSelectedPatient(updatedPatient);
      }
    }
  }, [patients, selectedPatient, hasPatientChanged]);

  // 导航函数 - 增强版：自动清理无关状态
  const navigateTo = (page, data = null) => {
    setCurrentPage(page);

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
          setAiResult({
            _caseId: caseId,
            name: profile?.patient?.name || '',
            age: profile?.patient?.age || '',
            gender: safeGender || '未知',
            diagnosis: profile?.patient?.diagnosis || '',
            department: profile?.patient?.department || '呼吸内科',
            bedNo: profile?.patient?.bedNo || '',
            medicalRecordImage: reader.result,
            gasGoals: planGasGoals.length
              ? planGasGoals.slice(0, 2).map((g) => ({
                  name: g.name || '',
                  target: Number(g.target || 100),
                  current: Number(g.current || 0),
                }))
              : [
                  { name: '功能目标1', target: 100, current: 0 },
                  { name: '功能目标2', target: 100, current: 0 },
                ],
            treatmentPlan: {
              focus: plan?.focus || '',
              highlights: [],
              items: Array.isArray(plan?.items)
                ? plan.items.map((it, idx) => ({
                    id: Date.now() + idx,
                    name: it.name || '',
                    icon: '🎯',
                    duration: it.duration || '',
                    completed: false,
                    note: it.notes || '',
                  }))
                : [],
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
            gasGoals: [
              { name: '功能目标1', target: 100, current: 0 },
              { name: '功能目标2', target: 100, current: 0 }
            ],
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
      const { plan } = await generatePlan(aiResult._caseId, profile);
      setAiResult((prev) => ({
        ...prev,
        treatmentPlan: {
          focus: plan.focus || prev.treatmentPlan.focus,
          highlights: [],
          items: Array.isArray(plan.items)
            ? plan.items.map((it, idx) => ({
                id: Date.now() + idx,
                name: it.name || '',
                icon: '🎯',
                duration: it.duration || '',
                completed: false,
                note: it.notes || '',
              }))
            : prev.treatmentPlan.items,
          precautions: Array.isArray(plan.precautions) ? plan.precautions : prev.treatmentPlan.precautions,
        },
      }));
      // 生成方案后自动确认建档并跳转
      setTimeout(() => confirmAdmission(), 300); // 延迟确保状态更新完成
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

  // 添加GAS目标
  const addGasGoal = () => {
    setAiResult(prev => ({
      ...prev,
      gasGoals: [...prev.gasGoals, { name: '', target: 100, current: 0 }]
    }));
  };

  // 更新GAS目标
  const updateGasGoal = (index, field, value) => {
    setAiResult(prev => ({
      ...prev,
      gasGoals: prev.gasGoals.map((g, i) => i === index ? { ...g, [field]: value } : g)
    }));
  };

  // 删除GAS目标
  const removeGasGoal = (index) => {
    setAiResult(prev => ({
      ...prev,
      gasGoals: prev.gasGoals.filter((_, i) => i !== index)
    }));
  };

  // 生成今日治疗日志（先显示确认对话框）
  const generateTodayLog = useCallback((patient) => {
    if (!patient) return;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 收集已完成的治疗项目
    const completedItems = patient.treatmentPlan.items
      .filter(item => item.completed)
      .map(item => ({
        name: item.name,
        duration: item.duration || '5分钟'
      }));

    // 如果没有完成项目，使用全部计划项目
    const items = completedItems.length > 0
      ? completedItems
      : patient.treatmentPlan.items.map(item => ({
          name: item.name,
          duration: item.duration || '5分钟'
        }));

    // 生成个性化的今日重点
    const highlights = patient.treatmentPlan.focus || '术后早期功能维持与舒适度管理';

    // 生成详细记录（优化排版）
    const itemDetails = items.map(i => `• ${i.name}（${i.duration}）`).join('\n');
    const precaution = patient.treatmentPlan.precautions?.[0] || '注意观察患儿反应';
    const detailRecord = `【训练重点】\n${highlights}\n\n【完成项目】\n${itemDetails}\n\n【配合情况】\n配合度：良好 | 耐受性：良好\n\n【安全提醒】\n${precaution}`;

    // 生成新日志（待确认）
    const newLog = {
      date: dateStr,
      highlight: highlights,
      items: items,
      cooperation: '良好',
      tolerance: '良好',
      safety: patient.treatmentPlan.precautions[0] || '注意观察患儿反应',
      detailRecord: detailRecord,
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

    // 根据科室名称找到对应的departmentId
    const getDeptId = (deptName) => {
      const dept = initialDepartments.find(d => d.name === deptName);
      return dept ? dept.id : 1;
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

    // 计算GAS分数 (防止除以0)
    const gasScore = aiResult.gasGoals.length > 0
      ? Math.round(aiResult.gasGoals.reduce((sum, g) => {
          const target = Number(g.target) || 1; // 防止除以0
          const current = Number(g.current) || 0;
          return sum + (current / target * 100);
        }, 0) / aiResult.gasGoals.length)
      : 0;

    const newPatient = {
      name: aiResult.name.trim(),
      age: aiResult.age.trim(),
      gender: aiResult.gender,
      bedNo: aiResult.bedNo.trim(),
      departmentId: getDeptId(aiResult.department),
      department: aiResult.department,
      avatar: getAvatar(aiResult.age),
      diagnosis: aiResult.diagnosis.trim(),
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
      todayTreated: false,
      medicalRecordImage: aiResult.medicalRecordImage, // 保存病历图片
      safetyAlerts: aiResult.safetyAlerts,
      gasScore: gasScore,
      gasGoals: aiResult.gasGoals.filter(g => g.name.trim()),
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

        // 更新本地列表（不再请求服务器）
        setPatients(prev => [...prev, created]);

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
      date: '2026-01-11',
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

  // 顶部Header - 有机科技风格
  const Header = ({ title, showBack = false, rightAction = null, showLogo = false, dark = false }) => (
    <div className="sticky top-0 z-40">
      {/* 毛玻璃背景 */}
      <div className={`absolute inset-0 backdrop-blur-xl ${dark ? 'bg-[#0a1628]/80 border-b border-[#00e5cc]/10' : 'glass-light border-b border-[#4a7c59]/10'}`} />
      <div className="relative px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={goBack} className={`p-2 -ml-2 rounded-full transition-all duration-200 active:scale-95 ${dark ? 'hover:bg-white/10' : 'hover:bg-[#4a7c59]/10'}`}>
              <ChevronLeft size={24} className={dark ? 'text-white' : 'text-[#1a2f23]'} />
            </button>
          )}
          {showLogo && <HospitalLogo size={36} />}
          <div>
            <h1 className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-[#1a2f23]'}`}>{title}</h1>
            {showLogo && <p className={`text-xs -mt-0.5 ${dark ? 'text-white/60' : 'text-[#4a7c59]'}`}>康复云查房助手</p>}
          </div>
        </div>
        {rightAction}
      </div>
    </div>
  );

  // 底部导航 - Glassmorphism 风格
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

        {/* 中间悬浮按钮 - 薄荷绿粘土风格 */}
        {userRole === 'therapist' && (
          <div className="relative -mt-8">
            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`fab-button ${showFabMenu ? 'rotate-45 !bg-gray-700' : ''}`}
            >
              <Plus size={28} className="text-white" />
            </button>

            {/* FAB菜单 */}
            {showFabMenu && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glass-card-strong p-2 min-w-[200px]">
                <FabMenuItem icon={<Sparkles size={20} />} label="AI智能收治" color="text-[#6BEE9F]" onClick={() => { setShowAIModal(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<Zap size={20} />} label="批量生成日报" color="text-[#FFB347]" onClick={() => { initBatchGenerate(); setShowFabMenu(false); }} />
                <FabMenuItem icon={<BookOpen size={20} />} label="治疗模板库" color="text-[#87CEEB]" onClick={() => { setShowTemplates(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<ClipboardList size={20} />} label="快速录入" color="text-[#FF8A80]" onClick={() => { setShowQuickEntry(true); setShowFabMenu(false); }} />
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
        active ? 'text-[#6BEE9F]' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-[#FF8A80] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${active ? 'text-[#6BEE9F]' : ''}`}>{label}</span>
    </button>
  ));

  const FabMenuItem = ({ icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#4a7c59]/10 rounded-2xl transition-all duration-200 active:scale-98"
    >
      <span className={color}>{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </button>
  );

  // 首页 - Soft Claymorphism + Glassmorphism 风格
  const HomePage = () => {
    // 使用useMemo缓存计算结果，避免重复过滤
    const activePatients = useMemo(() =>
      patients.filter(p => p.status === 'active'), [patients]);

    const todayPending = useMemo(() =>
      patients.filter(p => p.status === 'active' && !p.todayTreated), [patients]);

    const todayTreated = useMemo(() =>
      patients.filter(p => p.todayTreated), [patients]);

    const recentPatients = useMemo(() =>
      activePatients.slice(-3).reverse(), [activePatients]);

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

        {/* 3D气泡统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button onClick={() => setShowAllPatients(true)} className="bubble-3d bubble-blue">
            <div className="flex items-center gap-1 mb-1 relative z-10">
              <span className="text-lg">👶</span>
              <span className="text-3xl font-black">{activePatients.length}</span>
            </div>
            <span className="text-[11px] font-bold opacity-90 relative z-10">在治患儿</span>
          </button>
          <div className="bubble-3d bubble-green">
            <div className="flex items-center gap-1 mb-1 relative z-10">
              <span className="text-lg">✅</span>
              <span className="text-3xl font-black">{todayTreated.length}</span>
            </div>
            <span className="text-[11px] font-bold opacity-90 relative z-10">今日已治</span>
          </div>
          <div className="bubble-3d bubble-orange">
            <div className="flex items-center gap-1 mb-1 relative z-10">
              <span className="text-lg">⏳</span>
              <span className="text-3xl font-black">{todayPending.length}</span>
            </div>
            <span className="text-[11px] font-bold opacity-90 relative z-10">待治疗</span>
          </div>
        </div>

        {/* 快捷操作按钮 */}
        {userRole === 'therapist' && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex-1 btn-cyan-gradient h-12 rounded-full flex items-center justify-center gap-2 font-bold text-sm transition-transform active:scale-98"
            >
              <Zap size={18} fill="white" />
              AI智能收治
            </button>
            <button
              onClick={initBatchGenerate}
              className="flex-1 btn-glass-white h-12 rounded-full flex items-center justify-center gap-2 font-bold text-sm transition-transform active:scale-98"
            >
              <Zap size={18} className="text-blue-400" />
              批量生成日报
            </button>
          </div>
        )}

        {/* 列表区域 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* 最近建档 - 仅治疗师可见 */}
          {userRole === 'therapist' && recentPatients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 pl-1">最近建档</h3>
              <div className="space-y-3">
                {recentPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => navigateTo('patientDetail', patient)}
                    className="w-full list-item-rounded p-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shadow-sm flex-shrink-0 border-2 border-white">
                      {patient.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5">
                        {patient.name}, {patient.age}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed truncate">
                        {patient.diagnosis}
                      </p>
                    </div>
                    <span className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${patient.todayTreated ? 'bg-green-400' : 'bg-red-400'}`}>
                      {patient.todayTreated ? '已治' : '待治'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 科室患儿分布 */}
          <div className="mb-20">
            <h3 className="text-sm font-bold text-slate-700 mb-4 pl-1">科室患儿分布</h3>
            <div className="space-y-3">
              {initialDepartments.map(dept => {
                const deptPatients = getDepartmentPatients(dept.id);
                const pending = deptPatients.filter(p => p.status === 'active' && !p.todayTreated).length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => navigateTo('patients', dept)}
                    className="w-full list-item-rounded p-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100">
                      {dept.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-700 text-sm">{dept.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {deptPatients.length} 位患儿
                        </span>
                        {pending > 0 && (
                          <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {pending} 待治
                          </span>
                        )}
                      </div>
                    </div>
                    {userRole === 'therapist' && (
                      <Share2 size={16} className="text-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAB按钮 */}
        {userRole === 'therapist' && (
          <div className="absolute bottom-8 right-6 z-20">
            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className="fab-pink w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
            >
              <Plus size={28} strokeWidth={3} color="white" className={`transition-transform ${showFabMenu ? 'rotate-45' : ''}`} />
            </button>

            {showFabMenu && (
              <div className="absolute bottom-16 right-0 p-2 min-w-[180px] list-item-rounded animate-scale-in">
                <FabMenuItem icon={<Sparkles size={18} />} label="AI智能收治" color="text-emerald-500" onClick={() => { setShowAIModal(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<Zap size={18} />} label="批量生成日报" color="text-amber-500" onClick={() => { initBatchGenerate(); setShowFabMenu(false); }} />
                <FabMenuItem icon={<BookOpen size={18} />} label="治疗模板库" color="text-sky-500" onClick={() => { setShowTemplates(true); setShowFabMenu(false); }} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    );
  };

  // 患儿列表页 - Glassmorphism 风格
  const PatientsPage = () => {
    const deptPatients = getDepartmentPatients(selectedDepartment.id);
    const activePatients = deptPatients.filter(p => p.status === 'active');
    const completedPatients = deptPatients.filter(p => p.status === 'completed');

    return (
      <div className="min-h-screen pb-24">
        <Header title={selectedDepartment.name} showBack />

        <div className="px-4 py-4">
          {/* 进行中 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#6BEE9F] rounded-full" />
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
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                已完成/出院 ({completedPatients.length})
              </h3>
              <div className="space-y-3 opacity-60">
                {completedPatients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} onClick={() => navigateTo('patientDetail', patient)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PatientCard = React.memo(({ patient, onClick }) => (
    <button
      onClick={onClick}
      className="w-full patient-card text-left"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 avatar-clay clay-icon-peach flex items-center justify-center text-2xl">
          {patient.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-800">{patient.name}</h4>
            <span className="text-xs text-gray-500">{patient.age} · {patient.gender}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{patient.bedNo}</span>
          </div>
          <p className="text-sm text-[#6BEE9F] font-medium mb-2">{patient.diagnosis}</p>

          {/* 标签区 */}
          <div className="flex flex-wrap gap-1.5">
            {patient.safetyAlerts?.map((alert, i) => (
              <span key={i} className="status-badge status-pending text-[10px]">
                <AlertTriangle size={10} className="mr-0.5" />
                {alert}
              </span>
            ))}
            {patient.todayTreated ? (
              <span className="status-badge status-completed text-[10px]">
                <CheckCircle2 size={10} className="mr-0.5" />
                今日已治疗
              </span>
            ) : patient.status === 'active' && (
              <span className="status-badge status-warning text-[10px]">
                <Clock size={10} className="mr-0.5" />
                待治疗
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-300 mt-2" />
      </div>
    </button>
  ));

  // 患儿详情页 - Glassmorphism 风格
  const PatientDetailPage = () => {
    const patient = selectedPatient;
    if (!patient) return null;

    return (
      <div className="min-h-screen pb-24">
        <Header
          title="患儿详情"
          showBack
          rightAction={
            <div className="flex gap-2">
              {/* 打印按钮 */}
              <button
                onClick={() => printPatientRecord(patient)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="打印患者档案"
              >
                <Printer size={20} className="text-gray-600" />
              </button>
              {/* 编辑按钮 - 仅治疗师可见 */}
              {userRole === 'therapist' && (
                <>
                  {isEditingDetail && (
                    <button
                      onClick={savePatientEdit}
                      className="p-2 bg-[#a8ff78]/20 text-[#2d5a3d] rounded-xl transition-all duration-200 hover:bg-[#a8ff78]/30"
                      title="保存"
                    >
                      <Check size={20} />
                    </button>
                  )}
                  <button
                    onClick={toggleEditMode}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      isEditingDetail
                        ? 'bg-[#4a7c59]/10 text-[#4a7c59] hover:bg-[#4a7c59]/20'
                        : 'hover:bg-[#4a7c59]/10 text-[#4a7c59]'
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
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-[#ff4d6d]/10 rounded-xl transition-all duration-200"
                  title="删除患者"
                >
                  <Trash2 size={20} className="text-[#ff4d6d]" />
                </button>
              )}
            </div>
          }
        />

        <div className="px-4 py-4">
          {/* 基础信息卡片 */}
          <div className="card-organic p-5 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#a8ff78]/20 to-[#00e5cc]/20 rounded-2xl flex items-center justify-center text-3xl border border-[#4a7c59]/10">
                {patient.avatar}
              </div>
              <div className="flex-1">
                {isEditingDetail && editedPatient ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editedPatient.name}
                        onChange={(e) => setEditedPatient({ ...editedPatient, name: e.target.value })}
                        className="text-xl font-bold text-[#1a2f23] border-b border-[#00e5cc] focus:border-[#00e5cc] outline-none bg-transparent w-24"
                        placeholder="姓名"
                      />
                      <input
                        type="text"
                        value={editedPatient.age}
                        onChange={(e) => setEditedPatient({ ...editedPatient, age: e.target.value })}
                        className="text-sm text-[#4a7c59] border-b border-[#00e5cc] focus:border-[#00e5cc] outline-none bg-transparent w-16"
                        placeholder="年龄"
                      />
                      <select
                        value={editedPatient.gender}
                        onChange={(e) => setEditedPatient({ ...editedPatient, gender: e.target.value })}
                        className="text-sm text-[#4a7c59] border-b border-[#00e5cc] focus:border-[#00e5cc] outline-none bg-transparent"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-[#4a7c59]">床号：</span>
                      <input
                        type="text"
                        value={editedPatient.bedNo}
                        onChange={(e) => setEditedPatient({ ...editedPatient, bedNo: e.target.value })}
                        className="text-sm text-[#1a2f23] border-b border-[#00e5cc] focus:border-[#00e5cc] outline-none bg-transparent w-16"
                        placeholder="床号"
                      />
                      <span className="text-[#4a7c59]/40">·</span>
                      <input
                        type="text"
                        value={editedPatient.department}
                        onChange={(e) => setEditedPatient({ ...editedPatient, department: e.target.value })}
                        className="text-sm text-[#1a2f23] border-b border-[#00e5cc] focus:border-[#00e5cc] outline-none bg-transparent w-24"
                        placeholder="科室"
                      />
                    </div>
                    <input
                      type="text"
                      value={editedPatient.diagnosis}
                      onChange={(e) => setEditedPatient({ ...editedPatient, diagnosis: e.target.value })}
                      className="text-[#4a7c59] font-medium border-b border-[#00e5cc] focus:border-[#00e5cc] outline-none bg-transparent w-full"
                      placeholder="诊断"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-[#1a2f23]">{patient.name}</h2>
                      <span className="text-sm text-[#4a7c59]/60">{patient.age} · {patient.gender}</span>
                    </div>
                    <p className="text-sm text-[#4a7c59]/70 mb-1">床号：{patient.bedNo} · {patient.department}</p>
                    <p className="text-[#4a7c59] font-semibold">{patient.diagnosis}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 家庭作业 */}
          {patient.homework?.length > 0 && (
            <div className="card-organic p-4 mb-4">
              <h4 className="text-sm font-bold text-[#1a2f23] mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-[#ffd93d]" />
                家庭作业 (Home Program)
              </h4>
              <div className="space-y-2">
                {patient.homework.map(hw => (
                  <div key={hw.id} className="flex items-center gap-3 p-3 bg-[#4a7c59]/5 rounded-2xl">
                    {hw.completed ? (
                      <CheckCircle2 size={20} className="text-[#a8ff78]" />
                    ) : (
                      <Circle size={20} className="text-[#4a7c59]/30" />
                    )}
                    <span className={`text-sm flex-1 ${hw.completed ? 'text-[#4a7c59]/60' : 'text-[#1a2f23]'}`}>
                      {hw.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <div className="card-organic p-4">
              {/* 治疗目标 - 有机风格 */}
              <div className="bg-gradient-to-r from-[#00e5cc]/10 to-[#a8ff78]/10 border border-[#00e5cc]/20 rounded-2xl p-4 mb-4">
                <h5 className="text-sm font-bold text-[#1a2f23] flex items-center gap-2 mb-2">
                  <Target size={16} className="text-[#00e5cc]" />
                  治疗目标
                </h5>
                {isEditingDetail && editedPatient ? (
                  <textarea
                    value={editedPatient.treatmentPlan?.focus || ''}
                    onChange={(e) => setEditedPatient({
                      ...editedPatient,
                      treatmentPlan: { ...editedPatient.treatmentPlan, focus: e.target.value }
                    })}
                    className="text-sm text-[#1a2f23] leading-relaxed w-full bg-white/50 border border-[#00e5cc]/30 rounded-xl p-2 focus:border-[#00e5cc] outline-none resize-none"
                    rows={2}
                    placeholder="治疗目标"
                  />
                ) : (
                  <p className="text-sm text-[#1a2f23] leading-relaxed">{patient.treatmentPlan?.focus}</p>
                )}
              </div>

              {/* 个性化重点 */}
              {patient.treatmentPlan?.highlights?.length > 0 && (
                <div className="bg-gradient-to-r from-[#ffd93d]/10 to-[#ffb347]/10 border border-[#ffd93d]/20 rounded-2xl p-4 mb-4">
                  <h5 className="text-sm font-bold text-[#1a2f23] flex items-center gap-2 mb-2">
                    <Star size={16} className="text-[#ffd93d]" />
                    今日个性化重点
                  </h5>
                  <ul className="text-sm text-[#1a2f23] space-y-1.5">
                    {patient.treatmentPlan.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#ffd93d] mt-0.5">•</span>
                        <span className="flex-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 注意事项 */}
              {patient.treatmentPlan?.precautions?.length > 0 && (
                <div className="bg-gradient-to-r from-[#ff4d6d]/10 to-[#ff6b81]/10 border border-[#ff4d6d]/20 rounded-2xl p-4 mb-4">
                  <h5 className="text-sm font-bold text-[#1a2f23] flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-[#ff4d6d]" />
                    注意事项
                  </h5>
                  <ul className="text-sm text-[#1a2f23] space-y-1.5">
                    {patient.treatmentPlan.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#ff4d6d] mt-0.5">⚠</span>
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 治疗项目列表 */}
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-bold text-[#1a2f23]">治疗项目</h5>
                {/* 治疗师视角显示生成日志按钮 */}
                {userRole === 'therapist' && (
                  <button
                    onClick={() => generateTodayLog(patient)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#4a7c59] to-[#2d5a3d] text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <FileText size={14} />
                    生成今日日志
                  </button>
                )}
              </div>
              {patient.treatmentPlan?.items?.length > 0 ? (
                <div className="space-y-2">
                  {patient.treatmentPlan.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleTreatmentItem(patient.id, item.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                        item.completed
                          ? 'bg-[#a8ff78]/10 border-[#a8ff78]/30'
                          : 'bg-white border-[#4a7c59]/10 hover:border-[#00e5cc]/30'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${item.completed ? 'text-[#2d5a3d]' : 'text-[#1a2f23]'}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-[#4a7c59]/60">{item.duration}</span>
                        </div>
                        <p className="text-xs text-[#4a7c59]/60">{item.note}</p>
                      </div>
                      {item.completed ? (
                        <CheckCircle2 size={24} className="text-[#a8ff78]" />
                      ) : (
                        <Circle size={24} className="text-[#4a7c59]/30" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#4a7c59]/60">
                  <ClipboardList size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无治疗安排</p>
                  {userRole === 'therapist' && (
                    <button
                      onClick={() => setShowQuickEntry(true)}
                      className="mt-3 bg-gradient-to-r from-[#4a7c59] to-[#2d5a3d] text-white px-4 py-2 rounded-full text-sm hover:shadow-md transition"
                    >
                      快速录入
                    </button>
                  )}
                </div>
              )}

              {/* 完成治疗按钮 */}
              {userRole === 'therapist' && patient.treatmentPlan?.items?.length > 0 && !patient.todayTreated && (
                <button
                  onClick={() => {
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
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23] py-3 rounded-2xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  完成今日治疗
                </button>
              )}

              {patient.todayTreated && (
                <div className="mt-4 text-center text-[#2d5a3d] flex items-center justify-center gap-2 font-semibold">
                  <CheckCircle2 size={20} className="text-[#a8ff78]" />
                  今日治疗已完成
                </div>
              )}
            </div>
          )}

          {/* 治疗日志（时间轴） */}
          {detailTab === 'logs' && (
            <div className="card-organic p-4">
              {patient.treatmentLogs?.length > 0 ? (
                <div className="relative">
                  {/* 时间轴线 */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#4a7c59]/20" />

                  <div className="space-y-6">
                    {patient.treatmentLogs.map((log, i) => (
                      <div key={i} className="relative pl-10">
                        {/* 时间轴圆点 */}
                        <div className="absolute left-2.5 top-1 w-3 h-3 bg-[#00e5cc] rounded-full border-2 border-white shadow-[0_0_6px_rgba(0,229,204,0.5)]" />

                        <div className="bg-[#4a7c59]/5 rounded-2xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-[#1a2f23]">{log.date}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#4a7c59]/60">{log.therapist}</span>
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
                                  className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 亮点标注 */}
                          <div className="bg-[#ffd93d]/10 border border-[#ffd93d]/20 rounded-xl p-2 mb-2">
                            {isEditingDetail && editedPatient ? (
                              <textarea
                                value={editedPatient.treatmentLogs?.[i]?.highlight || log.highlight}
                                onChange={(e) => {
                                  const newLogs = [...(editedPatient.treatmentLogs || patient.treatmentLogs.map(l => ({...l})))];
                                  if (!newLogs[i]) newLogs[i] = { ...log };
                                  newLogs[i].highlight = e.target.value;
                                  setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                                }}
                                className="text-sm text-[#1a2f23] w-full bg-transparent border-none outline-none resize-none"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm text-[#1a2f23] flex items-center gap-1">
                                <Star size={14} className="text-[#ffd93d]" />
                                {log.highlight}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.items.map((item, j) => (
                              <span key={j} className="text-xs bg-[#00e5cc]/20 text-[#1a2f23] px-2 py-0.5 rounded-xl font-medium">
                                {typeof item === 'string' ? item : item.name}
                              </span>
                            ))}
                          </div>

                          {/* 详细记录 */}
                          {(log.detailRecord || isEditingDetail) && (
                            <div className="bg-[#4a7c59]/10 rounded-xl p-2 mb-2">
                              {isEditingDetail && editedPatient ? (
                                <textarea
                                  value={editedPatient.treatmentLogs?.[i]?.detailRecord || log.detailRecord || ''}
                                  onChange={(e) => {
                                    const newLogs = [...(editedPatient.treatmentLogs || patient.treatmentLogs.map(l => ({...l})))];
                                    if (!newLogs[i]) newLogs[i] = { ...log };
                                    newLogs[i].detailRecord = e.target.value;
                                    setEditedPatient({ ...editedPatient, treatmentLogs: newLogs });
                                  }}
                                  className="text-xs text-[#1a2f23] leading-relaxed w-full bg-transparent border-none outline-none resize-none"
                                  rows={3}
                                  placeholder="详细记录"
                                />
                              ) : (
                                <p className="text-xs text-[#1a2f23] leading-relaxed whitespace-pre-wrap">{log.detailRecord}</p>
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
                              className="text-xs text-[#4a7c59] w-full bg-white border border-[#4a7c59]/20 rounded-xl p-2 outline-none resize-none"
                              rows={2}
                              placeholder="备注"
                            />
                          ) : (
                            <p className="text-xs text-[#4a7c59]/70">{log.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#4a7c59]/60">
                  <FileText size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无治疗记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TabButton = ({ children, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-[#4a7c59] to-[#2d5a3d] text-white shadow-md'
          : 'bg-white text-[#4a7c59] border border-[#4a7c59]/20 hover:border-[#4a7c59]/40'
      }`}
    >
      {children}
    </button>
  );

  // 我的页面 - 有机科技风格
  const ProfilePage = () => (
    <div className="min-h-screen pb-24" style={{ background: '#fdfbf7' }}>
      <Header title="我的" />

      <div className="px-4 py-4">
        {/* 用户卡片 - 夜空主题 */}
        <div className="bg-night-sky rounded-3xl p-5 text-white shadow-lg mb-4 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 glass-dark rounded-2xl flex items-center justify-center text-3xl">
              👨‍⚕️
            </div>
            <div>
              <h2 className="text-xl font-bold">吴大勇</h2>
              <p className="text-white/70 text-sm">康复医学科 · 主管治疗师</p>
              <p className="text-white/50 text-xs mt-1">工号：KF20180015</p>
            </div>
          </div>
        </div>

        {/* 角色切换 */}
        <div className="card-organic p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#4a7c59] mb-3">视角切换（演示用）</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUserRole('therapist')}
              className={`p-3 rounded-2xl border-2 transition ${
                userRole === 'therapist'
                  ? 'border-[#00e5cc] bg-[#00e5cc]/10'
                  : 'border-[#4a7c59]/20 bg-white'
              }`}
            >
              <Edit3 size={24} className={userRole === 'therapist' ? 'text-[#00e5cc] mx-auto mb-1' : 'text-[#4a7c59]/40 mx-auto mb-1'} />
              <p className={`text-sm font-semibold ${userRole === 'therapist' ? 'text-[#1a2f23]' : 'text-[#4a7c59]/60'}`}>
                治疗师
              </p>
              <p className="text-xs text-[#4a7c59]/50">可编辑管理</p>
            </button>
            <button
              onClick={() => setUserRole('doctor')}
              className={`p-3 rounded-2xl border-2 transition ${
                userRole === 'doctor'
                  ? 'border-[#a8ff78] bg-[#a8ff78]/10'
                  : 'border-[#4a7c59]/20 bg-white'
              }`}
            >
              <Eye size={24} className={userRole === 'doctor' ? 'text-[#a8ff78] mx-auto mb-1' : 'text-[#4a7c59]/40 mx-auto mb-1'} />
              <p className={`text-sm font-semibold ${userRole === 'doctor' ? 'text-[#1a2f23]' : 'text-[#4a7c59]/60'}`}>
                主治医生
              </p>
              <p className="text-xs text-[#4a7c59]/50">只读查看</p>
            </button>
          </div>
        </div>

        {/* 统计 */}
        <div className="card-organic p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#4a7c59] mb-3">本月统计</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#00e5cc]">156</p>
              <p className="text-xs text-[#4a7c59]/60">治疗人次</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#ffd93d]">23</p>
              <p className="text-xs text-[#4a7c59]/60">新收患儿</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#a8ff78]">12</p>
              <p className="text-xs text-[#4a7c59]/60">康复出院</p>
            </div>
          </div>
        </div>

        {/* 菜单 */}
        <div className="card-organic overflow-hidden">
          <MenuItem icon={<BookOpen size={20} />} label="治疗模板库" onClick={() => setShowTemplates(true)} />
          <MenuItem icon={<Bell size={20} />} label="消息通知" />
          <MenuItem icon={<Settings size={20} />} label="设置" />
          <MenuItem icon={<Info size={20} />} label="关于" />
        </div>
      </div>
    </div>
  );

  const MenuItem = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#4a7c59]/5 border-b border-[#4a7c59]/10 last:border-none transition"
    >
      <span className="text-[#4a7c59]">{icon}</span>
      <span className="text-[#1a2f23] font-medium">{label}</span>
      <ChevronRight size={18} className="text-[#4a7c59]/30 ml-auto" />
    </button>
  );

  // ==================== 弹窗组件 ====================

  // 新建患者弹窗 - 有机科技风格
  const AIModal = () => {
    const [newAlertInput, setNewAlertInput] = useState('');

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => { setShowAIModal(false); setAiStep(0); setAiResult(null); setUploadedImage(null); setOcrText(''); setOcrProgress(0); }}>
        <div
          className="bg-[#fdfbf7] rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto animate-slide-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-xl border-b border-[#4a7c59]/10 px-4 py-3 flex items-center justify-between z-10">
            <h3 className="text-lg font-bold text-[#1a2f23] flex items-center gap-2">
              <Sparkles className="text-[#00e5cc]" size={20} />
              AI智能建档
            </h3>
            <button onClick={() => { setShowAIModal(false); setAiStep(0); setAiResult(null); setUploadedImage(null); setOcrText(''); setOcrProgress(0); }} className="p-2 hover:bg-[#4a7c59]/10 rounded-full">
              <X size={20} className="text-[#4a7c59]" />
            </button>
          </div>

          <div className="p-4">
            {/* 步骤0：上传病历图片 */}
            {aiStep === 0 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00e5cc]/20 to-[#a8ff78]/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#00e5cc]/20">
                  <Upload size={36} className="text-[#00e5cc]" />
                </div>
                <h4 className="text-lg font-bold text-[#1a2f23] mb-2">上传病历资料</h4>
                <p className="text-sm text-[#4a7c59]/70 mb-6">上传病历图片，AI将自动识别并提取患者信息</p>

                <input
                  type="file"
                  id="medical-record-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <label
                  htmlFor="medical-record-upload"
                  className="block border-2 border-dashed border-[#4a7c59]/30 rounded-3xl p-8 mb-4 hover:border-[#00e5cc] hover:bg-[#00e5cc]/5 transition-all cursor-pointer"
                >
                  <Camera size={32} className="text-[#4a7c59]/40 mx-auto mb-2" />
                  <p className="text-sm text-[#1a2f23] font-medium">点击选择图片或拍照（支持多图）</p>
                  <p className="text-xs text-[#4a7c59]/50 mt-2">支持 JPG、PNG 等图片格式</p>
                </label>

                <p className="text-xs text-[#4a7c59]/50">图片将作为病历附件保存，方便日后查阅</p>
              </div>
            )}

            {/* 步骤1：AI识别中 */}
            {aiStep === 1 && (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  {/* 图片预览 */}
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="病历"
                      className="w-full h-full object-cover rounded-2xl opacity-50"
                    />
                  )}
                  {/* 加载动画覆盖层 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                    <Loader2 size={32} className="text-[#00e5cc] animate-spin" />
                  </div>
                </div>

                <h4 className="text-lg font-bold text-[#1a2f23] mb-2">AI识别中...</h4>
                <p className="text-sm text-[#4a7c59]/70 mb-4">正在识别病例图片，请稍候</p>

                {/* 进度条 */}
                <div className="max-w-xs mx-auto">
                  <div className="w-full bg-[#4a7c59]/10 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] h-2.5 rounded-full animate-pulse"
                      style={{ width: '100%', opacity: 0.8 }}
                    />
                  </div>
                  <p className="text-xs text-[#4a7c59]/60">识别中，请耐心等待...</p>
                </div>

                <p className="text-xs text-[#4a7c59]/50 mt-6">
                  AI智能识别 · 图片理解
                </p>
              </div>
            )}

            {/* 步骤2：填写患者信息表单 */}
            {aiStep === 2 && aiResult && (
              <div className="space-y-4">
                <div className="bg-[#a8ff78]/20 border border-[#a8ff78]/30 rounded-2xl p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-[#2d5a3d]" />
                    <span className="text-sm font-semibold text-[#2d5a3d]">AI识别完成</span>
                  </div>
                  <p className="text-xs text-[#4a7c59]">已自动填充识别到的信息，请核对并补充，然后生成训练方案。</p>
                </div>

                {/* 病历图片预览 */}
                <div className="bg-[#4a7c59]/5 rounded-2xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={16} className="text-[#4a7c59]" />
                    <span className="text-sm font-semibold text-[#1a2f23]">病历附件</span>
                    <button
                      onClick={() => { setAiStep(0); setUploadedImage(null); setAiResult(null); setOcrText(''); }}
                      className="ml-auto text-xs text-[#ff4d6d] hover:text-[#e63956] font-medium"
                    >
                      重新上传
                    </button>
                  </div>
                  <img
                    src={uploadedImage}
                    alt="病历"
                    className="w-full max-h-40 object-contain rounded-xl border border-[#4a7c59]/10"
                  />
                </div>

                {/* 基本信息 */}
                <div className="card-organic p-4">
                  <h5 className="text-sm font-bold text-[#1a2f23] mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#00e5cc]" />
                    基本信息 <span className="text-[#ff4d6d]">*</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#4a7c59]/70 mb-1 block">姓名 *</label>
                      <input
                        type="text"
                        value={aiResult.name}
                        onChange={(e) => updateFormField('name', e.target.value)}
                        placeholder="请输入患儿姓名"
                        className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#4a7c59]/70 mb-1 block">年龄 *</label>
                      <input
                        type="text"
                        value={aiResult.age}
                        onChange={(e) => updateFormField('age', e.target.value)}
                        placeholder="如：5岁3个月"
                        className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#4a7c59]/70 mb-1 block">性别 *</label>
                      <select
                        value={aiResult.gender}
                        onChange={(e) => updateFormField('gender', e.target.value)}
                        className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none bg-white"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#4a7c59]/70 mb-1 block">床号 *</label>
                      <input
                        type="text"
                        value={aiResult.bedNo}
                        onChange={(e) => updateFormField('bedNo', e.target.value)}
                        placeholder="如：301-1"
                        className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-[#4a7c59]/70 mb-1 block">所属科室 *</label>
                      <select
                        value={aiResult.department}
                        onChange={(e) => updateFormField('department', e.target.value)}
                        className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none bg-white"
                      >
                        {initialDepartments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.icon} {dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-[#4a7c59]/70 mb-1 block">诊断信息 *</label>
                      <textarea
                        value={aiResult.diagnosis}
                        onChange={(e) => updateFormField('diagnosis', e.target.value)}
                        placeholder="请输入诊断信息"
                        rows={2}
                        className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none resize-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 安全提醒 */}
                <div className="card-organic p-4">
                  <h5 className="text-sm font-bold text-[#1a2f23] mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#ff4d6d]" />
                    安全提醒
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {aiResult.safetyAlerts.map((alert, i) => (
                      <span
                        key={i}
                        className="bg-[#ff4d6d]/10 text-[#ff4d6d] text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium"
                      >
                        {alert}
                        <button onClick={() => removeSafetyAlert(i)} className="hover:text-[#e63956]">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAlertInput}
                      onChange={(e) => setNewAlertInput(e.target.value)}
                      placeholder="添加安全提醒，如：防跌倒"
                      className="flex-1 border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none bg-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSafetyAlert(newAlertInput);
                          setNewAlertInput('');
                        }
                      }}
                    />
                    <button
                      onClick={() => { addSafetyAlert(newAlertInput); setNewAlertInput(''); }}
                      className="px-3 py-2 bg-[#ff4d6d]/10 text-[#ff4d6d] rounded-xl text-sm font-semibold hover:bg-[#ff4d6d]/20"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['防跌倒', '过敏体质', '癫痫风险', '禁止负重', '监测血氧'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => addSafetyAlert(tag)}
                        className="text-xs px-2 py-0.5 bg-[#4a7c59]/10 text-[#4a7c59] rounded-lg hover:bg-[#4a7c59]/20"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 治疗计划 */}
                <div className="card-organic p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-bold text-[#1a2f23] flex items-center gap-2">
                      <ClipboardList size={16} className="text-[#a8ff78]" />
                      治疗计划（可选）
                    </h5>
                    <button
                      onClick={addTreatmentItem}
                      className="text-xs text-[#00e5cc] hover:text-[#00d4bd] font-semibold"
                    >
                      + 添加项目
                    </button>
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={aiResult.treatmentPlan.focus}
                      onChange={(e) => setAiResult(prev => ({
                        ...prev,
                        treatmentPlan: { ...prev.treatmentPlan, focus: e.target.value }
                      }))}
                      placeholder="治疗重点，如：改善呼吸功能，增强运动耐力（总时长20分钟）"
                      className="w-full border border-[#4a7c59]/20 rounded-xl px-3 py-2 text-sm focus:border-[#00e5cc] outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    {aiResult.treatmentPlan.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#4a7c59]/5 rounded-xl p-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateTreatmentItem(i, 'name', e.target.value)}
                          placeholder="项目名称"
                          className="flex-1 border border-[#4a7c59]/20 rounded-lg px-2 py-1 text-sm bg-white"
                        />
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateTreatmentItem(i, 'duration', e.target.value)}
                          placeholder="时长"
                          className="w-20 border border-[#4a7c59]/20 rounded-lg px-2 py-1 text-sm bg-white"
                        />
                        <button
                          onClick={() => removeTreatmentItem(i)}
                          className="p-1 text-[#4a7c59]/40 hover:text-[#ff4d6d]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3 pt-2 pb-4">
                  <button
                    onClick={() => { setAiStep(0); setAiResult(null); setUploadedImage(null); setOcrText(''); setOcrProgress(0); }}
                    className="flex-1 border border-[#4a7c59]/30 text-[#4a7c59] py-3 rounded-2xl font-semibold hover:bg-[#4a7c59]/5 transition"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isOcrProcessing}
                    className="flex-1 bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23] py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-60"
                  >
                    <Sparkles size={20} />
                    生成方案
                  </button>
                  <button
                    onClick={confirmAdmission}
                    disabled={isSavingPatient || isOcrProcessing}
                    className={`flex-1 btn-glow-red py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-white ${
                      isSavingPatient ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSavingPatient ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        建档中...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        确认建档
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 批量生成日报弹窗 - 有机科技风格
  const BatchGenerateModal = () => {
    const current = batchPatients[currentBatchIndex];
    const [editingRecord, setEditingRecord] = useState(current?.generatedRecord || null);

    useEffect(() => {
      if (current) {
        setEditingRecord(current.generatedRecord);
      }
    }, [currentBatchIndex]);

    if (!current) return null;

    const allConfirmed = batchPatients.every(p => p.generatedRecord.confirmed);

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowBatchGenerate(false)}>
        <div
          className="bg-[#fdfbf7] rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-xl border-b border-[#4a7c59]/10 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1a2f23] flex items-center gap-2">
              <Zap className="text-[#ffd93d]" size={20} />
              批量生成日报
            </h3>
            <button onClick={() => setShowBatchGenerate(false)} className="p-2 hover:bg-[#4a7c59]/10 rounded-full">
              <X size={20} className="text-[#4a7c59]" />
            </button>
          </div>

          {/* 进度指示 */}
          <div className="px-4 py-3 bg-[#4a7c59]/5 flex items-center gap-2 overflow-x-auto">
            {batchPatients.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setCurrentBatchIndex(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                  i === currentBatchIndex
                    ? 'bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23] font-semibold'
                    : p.generatedRecord.confirmed
                      ? 'bg-[#a8ff78]/20 text-[#2d5a3d] font-medium'
                      : 'bg-white text-[#4a7c59] border border-[#4a7c59]/20'
                }`}
              >
                {p.generatedRecord.confirmed && <Check size={14} />}
                {p.name}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* 患者信息 */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#4a7c59]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#a8ff78]/20 to-[#00e5cc]/20 rounded-2xl flex items-center justify-center text-2xl border border-[#4a7c59]/10">
                {current.avatar}
              </div>
              <div>
                <h4 className="font-bold text-[#1a2f23]">{current.name}</h4>
                <p className="text-sm text-[#4a7c59]/70">{current.bedNo} · {current.diagnosis}</p>
              </div>
            </div>

            {current.generatedRecord.confirmed ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-[#a8ff78] mx-auto mb-3" />
                <p className="text-[#2d5a3d] font-semibold">已确认</p>
              </div>
            ) : (
              <>
                {/* 治疗项目 */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-[#1a2f23] mb-2">治疗项目</h5>
                  <div className="flex flex-wrap gap-2">
                    {editingRecord?.items.map((item, i) => (
                      <span key={i} className="bg-[#00e5cc]/20 text-[#1a2f23] text-sm px-3 py-1 rounded-xl font-medium">{item}</span>
                    ))}
                  </div>
                </div>

                {/* 个性化亮点 */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-[#1a2f23] mb-2 flex items-center gap-2">
                    <Star size={16} className="text-[#ffd93d]" />
                    今日亮点（可编辑）
                  </h5>
                  <textarea
                    value={editingRecord?.highlight || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, highlight: e.target.value }))}
                    className="w-full border border-[#4a7c59]/20 rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/30 focus:border-[#00e5cc] bg-white"
                    rows={2}
                  />
                </div>

                {/* 备注 */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-[#1a2f23] mb-2">治疗备注</h5>
                  <textarea
                    value={editingRecord?.notes || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-[#4a7c59]/20 rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/30 focus:border-[#00e5cc] bg-white"
                    rows={2}
                  />
                </div>

                <button
                  onClick={() => confirmBatchItem(currentBatchIndex, editingRecord)}
                  className="w-full bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23] py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <Check size={20} />
                  确认此记录 ({currentBatchIndex + 1}/{batchPatients.length})
                </button>
              </>
            )}

            {allConfirmed && (
              <div className="mt-4 space-y-3">
                {/* 打印全部按钮 */}
                <button
                  onClick={() => printBatchRecords(batchPatients)}
                  className="w-full bg-gradient-to-r from-[#4a7c59] to-[#2d5a3d] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Printer size={20} />
                  打印全部日报
                </button>
                {/* 关闭按钮 */}
                <button
                  onClick={() => setShowBatchGenerate(false)}
                  className="w-full bg-gradient-to-r from-[#a8ff78] to-[#00e5cc] text-[#1a2f23] px-6 py-3 rounded-2xl font-bold"
                >
                  全部完成，关闭
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 模板库弹窗 - 有机科技风格
  const TemplatesModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowTemplates(false)}>
      <div
        className="bg-[#fdfbf7] rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-xl border-b border-[#4a7c59]/10 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1a2f23] flex items-center gap-2">
            <BookOpen className="text-[#a8ff78]" size={20} />
            治疗模板库
          </h3>
          <button onClick={() => setShowTemplates(false)} className="p-2 hover:bg-[#4a7c59]/10 rounded-full">
            <X size={20} className="text-[#4a7c59]" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {treatmentTemplates.map(category => (
            <div key={category.id} className="card-organic p-4">
              <h4 className="font-bold text-[#1a2f23] mb-3 flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                {category.category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item, i) => (
                  <div key={i} className="bg-[#4a7c59]/5 rounded-2xl p-3 flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1a2f23]">{item.name}</p>
                      <p className="text-xs text-[#4a7c59]/60">{item.duration}</p>
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

  // 快速录入弹窗 - 有机科技风格
  const QuickEntryModal = () => {
    const [selectedItems, setSelectedItems] = useState([]);

    const toggleItem = (item) => {
      setSelectedItems(prev =>
        prev.find(i => i.name === item.name)
          ? prev.filter(i => i.name !== item.name)
          : [...prev, item]
      );
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowQuickEntry(false)}>
        <div
          className="bg-[#fdfbf7] rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-xl border-b border-[#4a7c59]/10 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1a2f23] flex items-center gap-2">
              <ClipboardList className="text-[#a8ff78]" size={20} />
              快速录入
            </h3>
            <button onClick={() => setShowQuickEntry(false)} className="p-2 hover:bg-[#4a7c59]/10 rounded-full">
              <X size={20} className="text-[#4a7c59]" />
            </button>
          </div>

          <div className="p-4">
            {/* 已选项目 */}
            {selectedItems.length > 0 && (
              <div className="bg-[#00e5cc]/10 border border-[#00e5cc]/20 rounded-2xl p-3 mb-4">
                <h5 className="text-sm font-semibold text-[#1a2f23] mb-2">已选择 ({selectedItems.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item, i) => (
                    <span key={i} className="bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23] text-sm px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                      {item.icon} {item.name}
                      <X size={14} className="cursor-pointer hover:text-[#ff4d6d]" onClick={() => toggleItem(item)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 模板选择 */}
            {treatmentTemplates.map(category => (
              <div key={category.id} className="mb-4">
                <h5 className="text-sm font-semibold text-[#1a2f23] mb-2 flex items-center gap-2">
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
                            ? 'bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23]'
                            : 'bg-[#4a7c59]/10 text-[#4a7c59] hover:bg-[#4a7c59]/20'
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
              className="w-full bg-gradient-to-r from-[#00e5cc] to-[#a8ff78] text-[#1a2f23] py-3 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg"
              onClick={() => setShowQuickEntry(false)}
            >
              确认添加 ({selectedItems.length} 项)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <div className="max-w-md mx-auto min-h-screen relative" style={{ background: '#fdfbf7' }}>
      {/* 页面路由 */}
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'patients' && <PatientsPage />}
      {currentPage === 'patientDetail' && <PatientDetailPage />}
      {currentPage === 'profile' && <ProfilePage />}

      {/* 底部导航 */}
      <BottomNav />

      {/* 弹窗 */}
      {showAIModal && <AIModal />}
      {showBatchGenerate && <BatchGenerateModal />}
      {showTemplates && <TemplatesModal />}
      {showQuickEntry && <QuickEntryModal />}

      {/* 全部患者弹窗 */}
      {showAllPatients && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowAllPatients(false)}>
          <div className="bg-[#fdfbf7] rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-xl border-b border-[#4a7c59]/10 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a2f23]">全部患者 ({patients.length})</h3>
              <button onClick={() => setShowAllPatients(false)} className="p-2 hover:bg-[#4a7c59]/10 rounded-full">
                <X size={20} className="text-[#4a7c59]" />
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
                  className="w-full card-organic p-3 flex items-center gap-3 hover:shadow-lg transition"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#a8ff78]/20 to-[#00e5cc]/20 rounded-2xl flex items-center justify-center text-xl border border-[#4a7c59]/10">
                    {patient.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1a2f23]">{patient.name}</span>
                      <span className="text-xs text-[#4a7c59]/60">{patient.age}</span>
                      <span className="text-xs bg-[#4a7c59]/10 text-[#4a7c59] px-1.5 rounded-lg">{patient.bedNo}</span>
                    </div>
                    <p className="text-xs text-[#4a7c59]/70">{patient.department} · {patient.diagnosis}</p>
                  </div>
                  <ChevronRight size={18} className="text-[#4a7c59]/30" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[#fdfbf7] rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff4d6d]/10 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-[#ff4d6d]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a2f23]">确认删除</h3>
                <p className="text-sm text-[#4a7c59]/70">此操作无法撤销</p>
              </div>
            </div>
            <p className="text-[#1a2f23] mb-6">
              确定要删除患者 <span className="font-bold">{selectedPatient.name}</span> 的所有信息吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[#4a7c59]/10 text-[#4a7c59] rounded-2xl font-semibold hover:bg-[#4a7c59]/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => deletePatient(selectedPatient.id)}
                className="flex-1 px-4 py-2.5 btn-glow-red text-white rounded-2xl font-semibold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日志确认对话框 */}
      {showLogConfirm && generatedLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowLogConfirm(false)}>
          <div className="bg-[#fdfbf7] rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#a8ff78]/20 rounded-2xl flex items-center justify-center">
                <FileText size={24} className="text-[#2d5a3d]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a2f23]">确认治疗日志</h3>
                <p className="text-sm text-[#4a7c59]/70">{generatedLog.date}</p>
              </div>
            </div>

            {/* 今日重点 - 可编辑 */}
            <div className="bg-gradient-to-r from-[#ffd93d]/10 to-[#ffb347]/10 border border-[#ffd93d]/20 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <Star size={16} className="text-[#ffd93d] mt-0.5" />
                <div className="flex-1">
                  <textarea
                    value={generatedLog.highlight}
                    onChange={(e) => setGeneratedLog({ ...generatedLog, highlight: e.target.value })}
                    className="w-full text-sm font-semibold text-[#1a2f23] leading-relaxed bg-transparent border-none outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* 训练项目 */}
            <div className="mb-4">
              <label className="text-xs text-[#4a7c59]/70 mb-2 block font-medium">完成项目</label>
              <div className="flex flex-wrap gap-2">
                {generatedLog.items.map((item, i) => (
                  <span key={i} className="bg-[#00e5cc]/20 text-[#1a2f23] px-3 py-1.5 rounded-xl text-sm font-medium">
                    {item.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 详细记录 - 可编辑 */}
            <div className="mb-6">
              <label className="text-xs text-[#4a7c59]/70 mb-2 block font-medium">详细记录</label>
              <textarea
                value={generatedLog.detailRecord}
                onChange={(e) => setGeneratedLog({ ...generatedLog, detailRecord: e.target.value })}
                className="w-full bg-white rounded-2xl p-4 text-sm text-[#1a2f23] leading-relaxed border border-[#4a7c59]/20 focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/10 outline-none resize-none"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-[#4a7c59]/10 text-[#4a7c59] rounded-2xl font-semibold hover:bg-[#4a7c59]/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSaveLog}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#a8ff78] to-[#00e5cc] text-[#1a2f23] rounded-2xl font-bold hover:shadow-lg transition-all"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast提示 */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-slide-up ${
          toast.type === 'success' ? 'bg-gradient-to-r from-[#a8ff78] to-[#00e5cc] text-[#1a2f23]' : 'bg-[#ff4d6d] text-white'
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
