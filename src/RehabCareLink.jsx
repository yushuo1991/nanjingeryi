// Version: 2.0.2 - Performance optimization
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// ==================== 设计系统配色 ====================
// 基于医院logo的配色方案
const colors = {
  primary: {
    navy: '#1E3A5F',      // 深靛蓝 - 主色
    navyLight: '#2d4a6f', // 浅靛蓝
    navyDark: '#0f2744',  // 更深靛蓝
  },
  secondary: {
    rose: '#E91E63',      // 玫瑰粉 - 次要色
    roseLight: '#f06292', // 浅玫瑰
    roseDark: '#c2185b',  // 深玫瑰
  },
  accent: {
    gold: '#FFB300',      // 金黄色 - 点缀
    goldLight: '#FFD54F',
    goldDark: '#FF8F00',
  }
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
  const toggleTreatmentItem = useCallback((patientId, itemId) => {
    if (userRole !== 'therapist') return;
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newItems = p.treatmentPlan.items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...p, treatmentPlan: { ...p.treatmentPlan, items: newItems } };
      }
      return p;
    }));
  }, [userRole]);

  // 更新患者信息
  const updatePatient = (patientId, updates) => {
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, ...updates } : p
    ));
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(prev => ({ ...prev, ...updates }));
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
        setOcrProgress(0);

        try {
          const caseId = await createCaseWithFiles(files);

          // 模拟进度（使用ref避免重新渲染Modal）
          progressIntervalRef.current = setInterval(() => {
            setOcrProgress(prev => Math.min(prev + 10, 90));
          }, 500); // 降低更新频率从300ms到500ms

          const { profile } = await extractProfile(caseId);
          const { plan } = await generatePlan(caseId, profile);

          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setOcrProgress(100);

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
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
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

    // 生成详细记录
    const itemNames = items.map(i => i.name).join('、');
    const detailRecord = `今日康复训练记录（${dateStr}）训练重点：${highlights} 完成项目：${itemNames} 配合度：良好；耐受：良好 安全提醒：${patient.treatmentPlan.precautions[0] || '注意观察患儿反应'}`;

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
  const confirmSaveLog = useCallback(() => {
    if (!generatedLog || !selectedPatient) return;

    // 更新患者的治疗日志
    const updatedLogs = [generatedLog, ...(selectedPatient.treatmentLogs || [])];

    updatePatient(selectedPatient.id, {
      treatmentLogs: updatedLogs,
      todayTreated: true
    });

    setShowLogConfirm(false);
    setGeneratedLog(null);
    setDetailTab('logs');
    showToast('今日治疗日志已保存', 'success');
  }, [generatedLog, selectedPatient, updatePatient, showToast]);

  // 切换编辑模式
  const toggleEditMode = useCallback(() => {
    if (!isEditingDetail) {
      // 进入编辑模式，复制患者数据
      setEditedPatient({ ...selectedPatient });
      setIsEditingDetail(true);
    } else {
      // 退出编辑模式，放弃更改
      setEditedPatient(null);
      setIsEditingDetail(false);
    }
  }, [isEditingDetail, selectedPatient]);

  // 保存编辑
  const savePatientEdit = useCallback(() => {
    if (!editedPatient) return;

    updatePatient(editedPatient.id, editedPatient);
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
    (async () => {
      try {
        const res = await api('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient: newPatient, plan: newPatient.treatmentPlan, caseId: aiResult._caseId || null }),
        });
        if (!res?.success) throw new Error(res?.error || '保存失败');
        const listRes = await api('/api/patients');
        const list = Array.isArray(listRes?.items) ? listRes.items : [];
        setPatients(list);
        const created = list.find((p) => p.id === res.patientId) || list[list.length - 1];

        // 关闭弹窗并重置状态
        setShowAIModal(false);
        setAiStep(0);
        setAiResult(null);
        setUploadedImage(null);

        // 跳转到患儿详情页（navigateTo会自动设置selectedPatient）
        if (created) {
          navigateTo('patientDetail', created);
        }

        showToast('建档成功', 'success');
      } catch (e) {
        showToast(e.message || '保存失败', 'error');
        return;
      }
    })();
    setOcrText('');
    setOcrProgress(0);
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

  // 顶部Header - Apple风格毛玻璃效果
  const Header = ({ title, showBack = false, rightAction = null, showLogo = false }) => (
    <div className="sticky top-0 z-40">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50" />
      <div className="relative px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={goBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95">
              <ChevronLeft size={24} className="text-slate-700" />
            </button>
          )}
          {showLogo && <HospitalLogo size={36} />}
          <div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h1>
            {showLogo && <p className="text-xs text-slate-500 -mt-0.5">康复云查房助手</p>}
          </div>
        </div>
        {rightAction}
      </div>
    </div>
  );

  // 底部导航 - Apple风格
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60" />
      <div className="relative px-2 py-2 flex items-center justify-around safe-area-bottom">
        <NavItem
          icon={<Home size={22} />}
          label="首页"
          active={['home', 'patients', 'patientDetail'].includes(currentPage)}
          onClick={() => navigateTo('home')}
        />

        {/* 中间悬浮按钮 - 渐变设计 */}
        {userRole === 'therapist' && (
          <div className="relative -mt-6">
            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 ${
                showFabMenu
                  ? 'bg-slate-800 rotate-45'
                  : 'bg-gradient-to-br from-rose-500 to-rose-600'
              }`}
              style={{ boxShadow: '0 8px 24px -4px rgba(233, 30, 99, 0.4)' }}
            >
              <Plus size={26} className="text-white" />
            </button>

            {/* FAB菜单 - 毛玻璃卡片 */}
            {showFabMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 min-w-[200px] border border-gray-100">
                <FabMenuItem icon={<Sparkles size={20} />} label="AI智能收治" color="text-rose-500" onClick={() => { setShowAIModal(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<Zap size={20} />} label="批量生成日报" color="text-amber-500" onClick={() => { initBatchGenerate(); setShowFabMenu(false); }} />
                <FabMenuItem icon={<BookOpen size={20} />} label="治疗模板库" color="text-indigo-500" onClick={() => { setShowTemplates(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<ClipboardList size={20} />} label="快速录入" color="text-emerald-500" onClick={() => { setShowQuickEntry(true); setShowFabMenu(false); }} />
              </div>
            )}
          </div>
        )}
        {userRole === 'doctor' && <div className="w-14" />}

        <NavItem icon={<User size={22} />} label="我的" active={currentPage === 'profile'} onClick={() => navigateTo('profile')} />
      </div>
    </div>
  );

  const NavItem = React.memo(({ icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
        active ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${active ? 'text-rose-500' : ''}`}>{label}</span>
    </button>
  ));

  const FabMenuItem = ({ icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 active:scale-98"
    >
      <span className={color}>{icon}</span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );

  // 首页 - Apple风格重新设计
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

    return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-rose-50/30 pb-24">
      <Header
        title="南京儿童医院"
        showLogo
        rightAction={
          userRole === 'therapist' && (
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-3.5 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
              style={{ boxShadow: '0 4px 14px -2px rgba(233, 30, 99, 0.4)' }}
            >
              <Sparkles size={16} />
              <span>AI收治</span>
            </button>
          )
        }
      />

      {/* 用户信息卡片 - 渐变玻璃效果 */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl p-5" style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2d4a6f 50%, #1E3A5F 100%)',
          boxShadow: '0 20px 40px -12px rgba(30, 58, 95, 0.35)'
        }}>
          {/* 装饰图案 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full -ml-8 -mb-8" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                👨‍⚕️
              </div>
              <div>
                <h2 className="font-semibold text-white text-lg">吴大勇 {userRole === 'therapist' ? '' : '（医生视角）'}</h2>
                <p className="text-white/70 text-sm">康复医学科 · 主管治疗师</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{todayPending.length}</p>
              <p className="text-xs text-white/60">今日待治疗</p>
            </div>
          </div>
        </div>
      </div>

      {/* 今日统计卡片 */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowAllPatients(true)}
            className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 active:scale-98"
          >
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users size={20} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{activePatients.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">在治患儿</div>
          </button>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{todayTreated.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">今日已治疗</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock size={20} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{todayPending.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">待治疗</div>
          </div>
        </div>
      </div>

      {/* 最近建档患者 */}
      {recentPatients.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-rose-500 rounded-full" />
            最近建档
          </h3>
          <div className="space-y-2.5">
            {recentPatients.map(patient => (
              <button
                key={patient.id}
                onClick={() => navigateTo('patientDetail', patient)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-100 transition-all duration-200 active:scale-[0.99]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-50 rounded-xl flex items-center justify-center text-xl">
                  {patient.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{patient.name}</span>
                    <span className="text-xs text-slate-400">{patient.age}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{patient.bedNo}</span>
                  </div>
                  <p className="text-sm text-indigo-600 mt-0.5">{patient.diagnosis}</p>
                </div>
                <div className="flex items-center gap-2">
                  {patient.safetyAlerts.length > 0 && (
                    <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={14} className="text-red-500" />
                    </div>
                  )}
                  {!patient.todayTreated && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-medium">待治疗</span>
                  )}
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 科室列表 */}
      <div className="px-4 mt-6">
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
          科室患儿分布
        </h3>
        <div className="space-y-2.5">
          {initialDepartments.map(dept => {
            const deptPatients = getDepartmentPatients(dept.id);
            const pending = deptPatients.filter(p => p.status === 'active' && !p.todayTreated).length;
            return (
              <div key={dept.id} className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('patients', dept)}
                  className="flex-1 bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${dept.color} flex items-center justify-center text-2xl`}>
                      {dept.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-800">{dept.name}</h4>
                      <p className="text-sm text-slate-500">{deptPatients.length} 位患儿</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pending > 0 && (
                      <span className="bg-amber-50 text-amber-600 text-xs px-2.5 py-1 rounded-lg font-medium">
                        {pending} 待治疗
                      </span>
                    )}
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </button>
                {/* 分享按钮 */}
                {userRole === 'therapist' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyShareLink(dept);
                    }}
                    className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                    title={`分享${dept.name}链接`}
                  >
                    <Share2 size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 快捷操作 */}
      {userRole === 'therapist' && (
        <div className="px-4 mt-6 mb-4">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-amber-500 rounded-full" />
            快捷操作
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="relative overflow-hidden rounded-2xl p-4 text-left shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
              <Sparkles size={24} className="text-white/90 mb-2" />
              <h4 className="font-semibold text-white">AI智能收治</h4>
              <p className="text-xs text-white/70 mt-0.5">上传病历自动建档</p>
            </button>
            <button
              onClick={initBatchGenerate}
              className="relative overflow-hidden rounded-2xl p-4 text-left shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FF8F00 0%, #FF6F00 100%)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
              <Zap size={24} className="text-white/90 mb-2" />
              <h4 className="font-semibold text-white">批量生成日报</h4>
              <p className="text-xs text-white/70 mt-0.5">一键生成今日记录</p>
            </button>
          </div>
        </div>
      )}
    </div>
    );
  };

  const StatCard = ({ icon, value, label, color }) => (
    <div className={`${color} rounded-xl p-3 text-center`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );

  const QuickActionCard = ({ icon, label, desc, color, onClick }) => (
    <button
      onClick={onClick}
      className={`${color} text-white rounded-2xl p-4 text-left shadow-md hover:shadow-lg transition active:scale-[0.98]`}
    >
      <div className="mb-2 opacity-90">{icon}</div>
      <h4 className="font-semibold">{label}</h4>
      <p className="text-xs opacity-80 mt-0.5">{desc}</p>
    </button>
  );

  // 患儿列表页 - Apple风格
  const PatientsPage = () => {
    const deptPatients = getDepartmentPatients(selectedDepartment.id);
    const activePatients = deptPatients.filter(p => p.status === 'active');
    const completedPatients = deptPatients.filter(p => p.status === 'completed');

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
        <Header title={selectedDepartment.name} showBack />

        <div className="px-4 py-4">
          {/* 进行中 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              进行中 ({activePatients.length})
            </h3>
            <div className="space-y-2.5">
              {activePatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} onClick={() => navigateTo('patientDetail', patient)} />
              ))}
            </div>
          </div>

          {/* 已完成/出院 */}
          {completedPatients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                已完成/出院 ({completedPatients.length})
              </h3>
              <div className="space-y-2.5 opacity-60">
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
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-100 transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-50 rounded-xl flex items-center justify-center text-2xl">
          {patient.avatar}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800">{patient.name}</h4>
            <span className="text-xs text-slate-400">{patient.age} · {patient.gender}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{patient.bedNo}</span>
          </div>
          <p className="text-sm text-indigo-600 mb-2">{patient.diagnosis}</p>

          {/* 标签区 */}
          <div className="flex flex-wrap gap-1.5">
            {patient.safetyAlerts.map((alert, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-lg font-medium">
                <AlertTriangle size={10} />
                {alert}
              </span>
            ))}
            {patient.todayTreated ? (
              <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-medium">
                <CheckCircle2 size={10} />
                今日已治疗
              </span>
            ) : patient.status === 'active' && (
              <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg font-medium">
                <Clock size={10} />
                待治疗
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-300 mt-2" />
      </div>
    </button>
  ));

  // 患儿详情页 - Apple风格
  const PatientDetailPage = () => {
    const patient = selectedPatient;
    if (!patient) return null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
        <Header
          title="患儿详情"
          showBack
          rightAction={
            <div className="flex gap-2">
              {/* 打印按钮 */}
              <button
                onClick={() => printPatientRecord(patient)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
                title="打印患者档案"
              >
                <Printer size={20} className="text-slate-600" />
              </button>
              {/* 编辑按钮 - 仅治疗师可见 */}
              {userRole === 'therapist' && (
                <>
                  {isEditingDetail && (
                    <button
                      onClick={savePatientEdit}
                      className="p-2 bg-emerald-100 text-emerald-600 rounded-xl transition-all duration-200 hover:bg-emerald-200"
                      title="保存"
                    >
                      <Check size={20} />
                    </button>
                  )}
                  <button
                    onClick={toggleEditMode}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      isEditingDetail
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'hover:bg-slate-100 text-slate-600'
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
                  className="p-2 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="删除患者"
                >
                  <Trash2 size={20} className="text-red-500" />
                </button>
              )}
            </div>
          }
        />

        <div className="px-4 py-4">
          {/* 基础信息卡片 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                {patient.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                  <span className="text-sm text-slate-500">{patient.age} · {patient.gender}</span>
                </div>
                <p className="text-sm text-slate-500 mb-1">床号：{patient.bedNo} · {patient.department}</p>
                <p className="text-indigo-600 font-medium">{patient.diagnosis}</p>
              </div>
            </div>
          </div>

          {/* 家庭作业 */}
          {patient.homework.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-amber-500" />
                家庭作业 (Home Program)
              </h4>
              <div className="space-y-2">
                {patient.homework.map(hw => (
                  <div key={hw.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    {hw.completed ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                    <span className={`text-sm flex-1 ${hw.completed ? 'text-slate-500' : 'text-slate-700'}`}>
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {/* 治疗目标 - 优化排版 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h5 className="text-sm font-semibold text-indigo-700 flex items-center gap-2 mb-2">
                  <Target size={16} className="text-indigo-500" />
                  治疗目标
                </h5>
                <p className="text-sm text-indigo-900 leading-relaxed">{patient.treatmentPlan.focus}</p>
              </div>

              {/* 个性化重点 */}
              {patient.treatmentPlan.highlights.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <h5 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-500" />
                    今日个性化重点
                  </h5>
                  <ul className="text-sm text-amber-800 space-y-1.5">
                    {patient.treatmentPlan.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span className="flex-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 注意事项 - 优化排版 */}
              {patient.treatmentPlan.precautions.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mb-4">
                  <h5 className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-red-500" />
                    注意事项
                  </h5>
                  <ul className="text-sm text-red-700 space-y-1.5">
                    {patient.treatmentPlan.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <span className="flex-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 治疗项目列表 */}
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-gray-700">治疗项目</h5>
                {/* 治疗师视角显示生成日志按钮 */}
                {userRole === 'therapist' && (
                  <button
                    onClick={() => generateTodayLog(patient)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <FileText size={14} />
                    生成今日日志
                  </button>
                )}
              </div>
              {patient.treatmentPlan.items.length > 0 ? (
                <div className="space-y-2">
                  {patient.treatmentPlan.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleTreatmentItem(patient.id, item.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        item.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.completed ? 'text-green-700' : 'text-gray-800'}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-500">{item.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500">{item.note}</p>
                      </div>
                      {item.completed ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} className="text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无治疗安排</p>
                  {userRole === 'therapist' && (
                    <button
                      onClick={() => setShowQuickEntry(true)}
                      className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition"
                    >
                      快速录入
                    </button>
                  )}
                </div>
              )}

              {/* 完成治疗按钮 */}
              {userRole === 'therapist' && patient.treatmentPlan.items.length > 0 && !patient.todayTreated && (
                <button
                  onClick={() => {
                    const newLog = {
                      date: '2026-01-11',
                      items: patient.treatmentPlan.items.filter(i => i.completed).map(i => i.name),
                      highlight: patient.treatmentPlan.highlights[0] || '常规训练',
                      notes: '治疗顺利完成',
                      therapist: '吴大勇'
                    };
                    updatePatient(patient.id, {
                      todayTreated: true,
                      treatmentLogs: [newLog, ...patient.treatmentLogs]
                    });
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  完成今日治疗
                </button>
              )}

              {patient.todayTreated && (
                <div className="mt-4 text-center text-green-600 flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} />
                  今日治疗已完成
                </div>
              )}
            </div>
          )}

          {/* 治疗日志（时间轴） */}
          {detailTab === 'logs' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {patient.treatmentLogs.length > 0 ? (
                <div className="relative">
                  {/* 时间轴线 */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-6">
                    {patient.treatmentLogs.map((log, i) => (
                      <div key={i} className="relative pl-10">
                        {/* 时间轴圆点 */}
                        <div className="absolute left-2.5 top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />

                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">{log.date}</span>
                            <span className="text-xs text-gray-500">{log.therapist}</span>
                          </div>

                          {/* 亮点标注 */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                            <p className="text-sm text-amber-800 flex items-center gap-1">
                              <Star size={14} className="text-amber-500" />
                              {log.highlight}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.items.map((item, j) => (
                              <span key={j} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">{log.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
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
      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-slate-800 text-white shadow-md'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );

  // 我的页面
  const ProfilePage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="我的" />

      <div className="px-4 py-4">
        {/* 用户卡片 */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-5 text-white shadow-lg mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              👨‍⚕️
            </div>
            <div>
              <h2 className="text-xl font-bold">吴大勇</h2>
              <p className="text-white/80 text-sm">康复医学科 · 主管治疗师</p>
              <p className="text-white/60 text-xs mt-1">工号：KF20180015</p>
            </div>
          </div>
        </div>

        {/* 角色切换 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">视角切换（演示用）</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUserRole('therapist')}
              className={`p-3 rounded-xl border-2 transition ${
                userRole === 'therapist'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Edit3 size={24} className={userRole === 'therapist' ? 'text-blue-600 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'} />
              <p className={`text-sm font-medium ${userRole === 'therapist' ? 'text-blue-700' : 'text-gray-600'}`}>
                治疗师
              </p>
              <p className="text-xs text-gray-500">可编辑管理</p>
            </button>
            <button
              onClick={() => setUserRole('doctor')}
              className={`p-3 rounded-xl border-2 transition ${
                userRole === 'doctor'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Eye size={24} className={userRole === 'doctor' ? 'text-blue-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'} />
              <p className={`text-sm font-medium ${userRole === 'doctor' ? 'text-blue-700' : 'text-gray-600'}`}>
                主治医生
              </p>
              <p className="text-xs text-gray-500">只读查看</p>
            </button>
          </div>
        </div>

        {/* 统计 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">本月统计</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">156</p>
              <p className="text-xs text-gray-500">治疗人次</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">23</p>
              <p className="text-xs text-gray-500">新收患儿</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">12</p>
              <p className="text-xs text-gray-500">康复出院</p>
            </div>
          </div>
        </div>

        {/* 菜单 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 border-b border-gray-100 last:border-none transition"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="text-gray-700">{label}</span>
      <ChevronRight size={18} className="text-gray-400 ml-auto" />
    </button>
  );

  // ==================== 弹窗组件 ====================

  // 新建患者弹窗 - 真实的患者录入表单
  const AIModal = () => {
    const [newAlertInput, setNewAlertInput] = useState('');

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => { setShowAIModal(false); setAiStep(0); setAiResult(null); setUploadedImage(null); setOcrText(''); setOcrProgress(0); }}>
        <div
          className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="text-rose-500" size={20} />
              AI智能建档
            </h3>
            <button onClick={() => { setShowAIModal(false); setAiStep(0); setAiResult(null); setUploadedImage(null); setOcrText(''); setOcrProgress(0); }} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {/* 步骤0：上传病历图片 */}
            {aiStep === 0 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={36} className="text-rose-500" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">上传病历资料</h4>
                <p className="text-sm text-slate-500 mb-6">上传病历图片，AI将自动识别并提取患者信息</p>

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
                  className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 mb-4 hover:border-rose-400 hover:bg-rose-50/50 transition-all cursor-pointer"
                >
                  <Camera size={32} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">点击选择图片或拍照（支持多图）</p>
                  <p className="text-xs text-slate-400 mt-2">支持 JPG、PNG 等图片格式</p>
                </label>

                <p className="text-xs text-slate-400">图片将作为病历附件保存，方便日后查阅</p>
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
                    <Loader2 size={32} className="text-indigo-500 animate-spin" />
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-800 mb-2">AI识别中...</h4>
                <p className="text-sm text-slate-500 mb-4">通义千问3-VL-Plus 正在识别病例图片，请稍候</p>

                {/* 进度条 */}
                <div className="max-w-xs mx-auto">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{ocrProgress}% 完成</p>
                </div>

                <p className="text-xs text-slate-400 mt-6">
                  通义千问3-VL-Plus · 图片理解
                </p>
              </div>
            )}

            {/* 步骤2：填写患者信息表单 */}
            {aiStep === 2 && aiResult && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">AI识别完成</span>
                  </div>
                  <p className="text-xs text-emerald-600">已自动填充识别到的信息，请核对并补充，然后生成训练方案。</p>
                </div>

                {/* 病历图片预览 */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={16} className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">病历附件</span>
                    <button
                      onClick={() => { setAiStep(0); setUploadedImage(null); setAiResult(null); setOcrText(''); }}
                      className="ml-auto text-xs text-rose-500 hover:text-rose-600"
                    >
                      重新上传
                    </button>
                  </div>
                  <img
                    src={uploadedImage}
                    alt="病历"
                    className="w-full max-h-40 object-contain rounded-lg border border-slate-200"
                  />
                </div>

                {/* 基本信息 */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <User size={16} className="text-indigo-500" />
                    基本信息 <span className="text-red-500">*</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">姓名 *</label>
                      <input
                        type="text"
                        value={aiResult.name}
                        onChange={(e) => updateFormField('name', e.target.value)}
                        placeholder="请输入患儿姓名"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">年龄 *</label>
                      <input
                        type="text"
                        value={aiResult.age}
                        onChange={(e) => updateFormField('age', e.target.value)}
                        placeholder="如：5岁3个月"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">性别 *</label>
                      <select
                        value={aiResult.gender}
                        onChange={(e) => updateFormField('gender', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">床号 *</label>
                      <input
                        type="text"
                        value={aiResult.bedNo}
                        onChange={(e) => updateFormField('bedNo', e.target.value)}
                        placeholder="如：301-1"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">所属科室 *</label>
                      <select
                        value={aiResult.department}
                        onChange={(e) => updateFormField('department', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                      >
                        {initialDepartments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.icon} {dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">诊断信息 *</label>
                      <textarea
                        value={aiResult.diagnosis}
                        onChange={(e) => updateFormField('diagnosis', e.target.value)}
                        placeholder="请输入诊断信息"
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 安全提醒 */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    安全提醒
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {aiResult.safetyAlerts.map((alert, i) => (
                      <span
                        key={i}
                        className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        {alert}
                        <button onClick={() => removeSafetyAlert(i)} className="hover:text-red-800">
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
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSafetyAlert(newAlertInput);
                          setNewAlertInput('');
                        }
                      }}
                    />
                    <button
                      onClick={() => { addSafetyAlert(newAlertInput); setNewAlertInput(''); }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['防跌倒', '过敏体质', '癫痫风险', '禁止负重', '监测血氧'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => addSafetyAlert(tag)}
                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 治疗计划 */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <ClipboardList size={16} className="text-emerald-500" />
                      治疗计划（可选）
                    </h5>
                    <button
                      onClick={addTreatmentItem}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
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
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-rose-400 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    {aiResult.treatmentPlan.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateTreatmentItem(i, 'name', e.target.value)}
                          placeholder="项目名称"
                          className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateTreatmentItem(i, 'duration', e.target.value)}
                          placeholder="时长"
                          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => removeTreatmentItem(i)}
                          className="p-1 text-slate-400 hover:text-red-500"
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
                    className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isOcrProcessing}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-60"
                    style={{ boxShadow: '0 4px 14px -2px rgba(30, 58, 95, 0.35)' }}
                  >
                    <Sparkles size={20} />
                    生成方案
                  </button>
                  <button
                    onClick={confirmAdmission}
                    disabled={isOcrProcessing}
                    className={`flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 ${
                      isOcrProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ boxShadow: '0 4px 14px -2px rgba(233, 30, 99, 0.4)' }}
                  >
                    {isOcrProcessing ? (
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

  // 批量生成日报弹窗
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowBatchGenerate(false)}>
        <div
          className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="text-orange-500" size={20} />
              批量生成日报
            </h3>
            <button onClick={() => setShowBatchGenerate(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* 进度指示 */}
          <div className="px-4 py-3 bg-gray-50 flex items-center gap-2 overflow-x-auto">
            {batchPatients.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setCurrentBatchIndex(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                  i === currentBatchIndex
                    ? 'bg-blue-500 text-white'
                    : p.generatedRecord.confirmed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {p.generatedRecord.confirmed && <Check size={14} />}
                {p.name}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* 患者信息 */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                {current.avatar}
              </div>
              <div>
                <h4 className="font-semibold">{current.name}</h4>
                <p className="text-sm text-gray-500">{current.bedNo} · {current.diagnosis}</p>
              </div>
            </div>

            {current.generatedRecord.confirmed ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">已确认</p>
              </div>
            ) : (
              <>
                {/* 治疗项目 */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">治疗项目</h5>
                  <div className="flex flex-wrap gap-2">
                    {editingRecord?.items.map((item, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>

                {/* 个性化亮点 */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Star size={16} className="text-amber-500" />
                    今日亮点（可编辑）
                  </h5>
                  <textarea
                    value={editingRecord?.highlight || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, highlight: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* 备注 */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">治疗备注</h5>
                  <textarea
                    value={editingRecord?.notes || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <button
                  onClick={() => confirmBatchItem(currentBatchIndex, editingRecord)}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
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
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  打印全部日报
                </button>
                {/* 关闭按钮 */}
                <button
                  onClick={() => setShowBatchGenerate(false)}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-xl font-medium"
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

  // 模板库弹窗
  const TemplatesModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowTemplates(false)}>
      <div
        className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="text-blue-500" size={20} />
            治疗模板库
          </h3>
          <button onClick={() => setShowTemplates(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {treatmentTemplates.map(category => (
            <div key={category.id} className={`rounded-2xl border ${category.color} p-4`}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                {category.category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-2 shadow-sm">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.duration}</p>
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

  // 快速录入弹窗
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowQuickEntry(false)}>
        <div
          className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="text-green-500" size={20} />
              快速录入
            </h3>
            <button onClick={() => setShowQuickEntry(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {/* 已选项目 */}
            {selectedItems.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <h5 className="text-sm font-medium text-blue-700 mb-2">已选择 ({selectedItems.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item, i) => (
                    <span key={i} className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      {item.icon} {item.name}
                      <X size={14} className="cursor-pointer" onClick={() => toggleItem(item)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 模板选择 */}
            {treatmentTemplates.map(category => (
              <div key={category.id} className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  {category.icon} {category.category}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, i) => {
                    const isSelected = selectedItems.find(s => s.name === item.name);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem(item)}
                        className={`px-3 py-1.5 rounded-full text-sm transition ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowAllPatients(false)}>
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">全部患者 ({patients.length})</h3>
              <button onClick={() => setShowAllPatients(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
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
                  className="w-full bg-gray-50 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    {patient.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-xs text-gray-500">{patient.age}</span>
                      <span className="text-xs bg-gray-200 px-1.5 rounded">{patient.bedNo}</span>
                    </div>
                    <p className="text-xs text-gray-500">{patient.department} · {patient.diagnosis}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认删除</h3>
                <p className="text-sm text-gray-500">此操作无法撤销</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              确定要删除患者 <span className="font-semibold text-gray-800">{selectedPatient.name}</span> 的所有信息吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => deletePatient(selectedPatient.id)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日志确认对话框 */}
      {showLogConfirm && generatedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLogConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">确认治疗日志</h3>
                <p className="text-sm text-gray-500">{generatedLog.date}</p>
              </div>
            </div>

            {/* 今日重点 - 可编辑 */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <Star size={16} className="text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <textarea
                    value={generatedLog.highlight}
                    onChange={(e) => setGeneratedLog({ ...generatedLog, highlight: e.target.value })}
                    className="w-full text-sm font-medium text-amber-900 leading-relaxed bg-transparent border-none outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* 训练项目 - 蓝色标签 */}
            <div className="mb-4">
              <label className="text-xs text-slate-500 mb-2 block">完成项目</label>
              <div className="flex flex-wrap gap-2">
                {generatedLog.items.map((item, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {item.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 详细记录 - 可编辑 */}
            <div className="mb-6">
              <label className="text-xs text-slate-500 mb-2 block">详细记录</label>
              <textarea
                value={generatedLog.detailRecord}
                onChange={(e) => setGeneratedLog({ ...generatedLog, detailRecord: e.target.value })}
                className="w-full bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSaveLog}
                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast提示 */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
