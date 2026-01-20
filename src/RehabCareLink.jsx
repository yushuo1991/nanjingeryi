import React, { useState, useEffect } from 'react';
import {
  Home, Calendar, MessageSquare, User, Plus, ChevronRight, ChevronLeft,
  AlertTriangle, Shield, Baby, Stethoscope, Brain, Bone, Heart, Lung,
  Clock, CheckCircle2, Circle, FileText, Upload, Sparkles, X, Check,
  Edit3, Trash2, Activity, Target, TrendingUp, Clipboard, Send,
  Play, Pause, RotateCcw, Zap, BookOpen, Star, Filter, Search,
  Bell, Settings, LogOut, Eye, EyeOff, Camera, File, ArrowRight,
  Users, Building2, Bed, ClipboardList, Timer, Coffee, Utensils,
  Moon, Sun, Award, Flag, AlertCircle, Info, ThumbsUp, MessageCircle,
  Download
} from 'lucide-react';

// ==================== Mock 数据 ====================
const initialDepartments = [
  { id: 1, name: '呼吸内科', icon: '🫁', color: 'bg-blue-100 text-blue-600', patients: 8, pending: 5 },
  { id: 2, name: '神经内科', icon: '🧠', color: 'bg-purple-100 text-purple-600', patients: 12, pending: 7 },
  { id: 3, name: '骨科', icon: '🦴', color: 'bg-orange-100 text-orange-600', patients: 6, pending: 4 },
  { id: 4, name: '心内科', icon: '❤️', color: 'bg-red-100 text-red-600', patients: 4, pending: 2 },
  { id: 5, name: '消化内科', icon: '🍎', color: 'bg-green-100 text-green-600', patients: 5, pending: 3 },
];

const initialPatients = [
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
  },
  {
    id: 3,
    name: '小刚',
    age: '7岁',
    gender: '男',
    bedNo: '201-1',
    departmentId: 2,
    department: '神经内科',
    avatar: '👦',
    diagnosis: '脑瘫（痉挛型双瘫）',
    admissionDate: '2026-01-02',
    status: 'active',
    todayTreated: false,
    safetyAlerts: ['防跌倒', '癫痫风险'],
    gasScore: 38,
    gasGoals: [
      { name: '下肢运动功能', target: 60, current: 35 },
      { name: '平衡能力', target: 55, current: 30 },
      { name: '日常生活能力', target: 70, current: 48 }
    ],
    treatmentPlan: {
      focus: '缓解下肢痉挛，改善步态',
      highlights: ['今日重点进行下肢牵伸，痉挛程度较昨日减轻'],
      items: [
        { id: 1, name: '下肢牵伸', icon: '🦵', duration: '20min', completed: false, note: '跟腱+腘绳肌' },
        { id: 2, name: 'Bobath技术', icon: '🤸', duration: '25min', completed: false, note: '抑制异常姿势反射' },
        { id: 3, name: '平衡训练', icon: '⚖️', duration: '15min', completed: false, note: '坐位平衡→站位平衡' },
        { id: 4, name: '步态训练', icon: '🚶', duration: '20min', completed: false, note: '助行器辅助' }
      ],
      precautions: ['注意癫痫发作先兆', '避免过度疲劳', '训练时需有人保护']
    },
    treatmentLogs: [
      {
        date: '2026-01-10',
        items: ['下肢牵伸', 'Bobath技术', '平衡训练'],
        highlight: '痉挛较前减轻，MAS评分由2级降至1+级',
        notes: '家长配合度高，坚持家庭训练',
        therapist: '吴大勇'
      }
    ],
    homework: [
      { id: 1, task: '被动牵伸 2次/日，每次20分钟', completed: true, note: '' },
      { id: 2, task: '站立训练 3次/日，每次10分钟', completed: false, note: '' }
    ]
  },
  {
    id: 4,
    name: '小美',
    age: '4岁6个月',
    gender: '女',
    bedNo: '203-1',
    departmentId: 2,
    department: '神经内科',
    avatar: '👧',
    diagnosis: '发育迟缓',
    admissionDate: '2026-01-06',
    status: 'active',
    todayTreated: false,
    safetyAlerts: [],
    gasScore: 52,
    gasGoals: [
      { name: '精细运动', target: 75, current: 55 },
      { name: '认知能力', target: 70, current: 48 },
      { name: '语言表达', target: 65, current: 52 }
    ],
    treatmentPlan: {
      focus: '促进整体发育，重点提升精细运动和认知',
      highlights: ['患儿今日注意力较好，增加认知训练内容'],
      items: [
        { id: 1, name: '精细运动训练', icon: '✋', duration: '20min', completed: false, note: '串珠、拼图' },
        { id: 2, name: '感统训练', icon: '🎯', duration: '25min', completed: false, note: '前庭觉+本体觉' },
        { id: 3, name: '认知训练', icon: '🧩', duration: '15min', completed: false, note: '颜色形状配对' }
      ],
      precautions: []
    },
    treatmentLogs: [],
    homework: [
      { id: 1, task: '亲子互动游戏30分钟/日', completed: true, note: '' }
    ]
  },
  {
    id: 5,
    name: '小强',
    age: '8岁',
    gender: '男',
    bedNo: '101-2',
    departmentId: 3,
    department: '骨科',
    avatar: '👦',
    diagnosis: '右股骨骨折术后',
    admissionDate: '2026-01-04',
    status: 'active',
    todayTreated: false,
    safetyAlerts: ['禁止负重', '防跌倒'],
    gasScore: 30,
    gasGoals: [
      { name: '关节活动度', target: 90, current: 45 },
      { name: '肌力恢复', target: 80, current: 25 },
      { name: '日常生活能力', target: 85, current: 20 }
    ],
    treatmentPlan: {
      focus: '促进骨折愈合，恢复下肢功能',
      highlights: ['术后2周，开始进行轻度关节活动训练'],
      items: [
        { id: 1, name: '关节松动', icon: '🔄', duration: '15min', completed: false, note: '膝关节被动活动' },
        { id: 2, name: '肌力训练', icon: '💪', duration: '20min', completed: false, note: '股四头肌等长收缩' },
        { id: 3, name: '消肿治疗', icon: '❄️', duration: '15min', completed: false, note: '冰敷+抬高患肢' }
      ],
      precautions: ['严禁负重！', '活动幅度遵医嘱', '注意骨折部位疼痛反馈']
    },
    treatmentLogs: [],
    homework: [
      { id: 1, task: '踝泵运动 每小时20次', completed: true, note: '' }
    ]
  },
  {
    id: 6,
    name: '小丽',
    age: '6岁',
    gender: '女',
    bedNo: '305-1',
    departmentId: 1,
    department: '呼吸内科',
    avatar: '👧',
    diagnosis: '肺炎恢复期',
    admissionDate: '2025-12-28',
    status: 'completed',
    todayTreated: false,
    safetyAlerts: [],
    gasScore: 92,
    gasGoals: [
      { name: '呼吸功能', target: 95, current: 92 },
      { name: '运动耐力', target: 90, current: 88 }
    ],
    treatmentPlan: {
      focus: '维持训练效果，准备出院',
      highlights: ['康复目标基本达成，准备出院'],
      items: [],
      precautions: []
    },
    treatmentLogs: [
      {
        date: '2026-01-10',
        items: ['呼吸训练', '运动训练'],
        highlight: '出院前最后一次治疗，整体恢复良好',
        notes: 'GAS目标达成92%，建议出院后继续家庭训练',
        therapist: '吴大勇'
      }
    ],
    homework: []
  }
];

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
  // 状态管理
  const [currentPage, setCurrentPage] = useState('home'); // home, patients, patientDetail, schedule, messages, profile
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(initialPatients);
  const [userRole, setUserRole] = useState('therapist'); // therapist | doctor
  const [showAIModal, setShowAIModal] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showBatchGenerate, setShowBatchGenerate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [detailTab, setDetailTab] = useState('today'); // today | logs
  const [exportingPDF, setExportingPDF] = useState(false);

  // AI收治状态
  const [aiStep, setAiStep] = useState(0); // 0:上传, 1:分析中, 2:结果确认
  const [aiResult, setAiResult] = useState(null);

  // 批量生成状态
  const [batchPatients, setBatchPatients] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  // 导航函数
  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'patients' && data) {
      setSelectedDepartment(data);
    }
    if (page === 'patientDetail' && data) {
      setSelectedPatient(data);
      setDetailTab('today');
    }
    setShowFabMenu(false);
  };

  const goBack = () => {
    if (currentPage === 'patientDetail') {
      setCurrentPage('patients');
      setSelectedPatient(null);
    } else if (currentPage === 'patients') {
      setCurrentPage('home');
      setSelectedDepartment(null);
    }
  };

  // 获取科室患者
  const getDepartmentPatients = (deptId) => {
    return patients.filter(p => p.departmentId === deptId);
  };

  // 完成治疗项目
  const toggleTreatmentItem = (patientId, itemId) => {
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
  };

  // 更新患者信息
  const updatePatient = (patientId, updates) => {
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, ...updates } : p
    ));
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(prev => ({ ...prev, ...updates }));
    }
  };

  // AI分析模拟
  const startAIAnalysis = () => {
    setAiStep(1);
    setTimeout(() => {
      setAiResult({
        name: '小新',
        age: '4岁2个月',
        gender: '男',
        diagnosis: '脑炎恢复期，运动功能障碍',
        department: '神经内科',
        bedNo: '205-1',
        gasGoals: [
          { name: '运动功能', target: 70, current: 20 },
          { name: '平衡能力', target: 65, current: 15 },
          { name: '日常生活', target: 75, current: 25 }
        ],
        treatmentPlan: {
          focus: '促进运动功能恢复，改善平衡能力',
          highlights: ['新收患儿，需全面评估后调整方案'],
          items: [
            { id: 1, name: '运动功能评估', icon: '📋', duration: '30min', completed: false, note: 'GMFM评估' },
            { id: 2, name: '关节活动训练', icon: '🔄', duration: '20min', completed: false, note: '四肢关节' },
            { id: 3, name: '平衡训练', icon: '⚖️', duration: '15min', completed: false, note: '坐位平衡' },
            { id: 4, name: '感觉刺激', icon: '✨', duration: '15min', completed: false, note: '促进感觉输入' }
          ],
          precautions: ['注意生命体征监测', '避免过度疲劳', '警惕颅内压增高症状']
        },
        safetyAlerts: ['颅内压监测', '防跌倒']
      });
      setAiStep(2);
    }, 3000);
  };

  // 确认AI收治
  const confirmAIAdmission = () => {
    const newPatient = {
      id: patients.length + 1,
      ...aiResult,
      avatar: '👦',
      departmentId: 2,
      admissionDate: '2026-01-11',
      status: 'active',
      todayTreated: false,
      gasScore: 20,
      treatmentLogs: [],
      homework: []
    };
    setPatients(prev => [...prev, newPatient]);
    setShowAIModal(false);
    setAiStep(0);
    setAiResult(null);
    // 跳转到患者详情
    setTimeout(() => {
      navigateTo('patientDetail', newPatient);
    }, 500);
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

  // PDF导出功能
  const handleExportPDF = async (patientId) => {
    if (exportingPDF) return;

    setExportingPDF(true);
    try {
      const response = await fetch(`/api/patients/${patientId}/export-pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });

      if (!response.ok) {
        throw new Error('PDF导出失败');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'patient_record.pdf';
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('PDF导出成功');
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败: ' + error.message);
    } finally {
      setExportingPDF(false);
    }
  };

  // ==================== 渲染组件 ====================

  // 顶部Header
  const Header = ({ title, showBack = false, rightAction = null }) => (
    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={goBack} className="p-1 hover:bg-white/20 rounded-full transition">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {rightAction}
    </div>
  );

  // 底部导航
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex items-center justify-around z-50 shadow-lg">
      <NavItem icon={<Home size={22} />} label="首页" active={currentPage === 'home'} onClick={() => navigateTo('home')} />
      <NavItem icon={<Calendar size={22} />} label="排班" active={currentPage === 'schedule'} onClick={() => navigateTo('schedule')} />

      {/* 中间悬浮按钮 */}
      {userRole === 'therapist' && (
        <div className="relative -mt-8">
          <button
            onClick={() => setShowFabMenu(!showFabMenu)}
            className={`w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg flex items-center justify-center transition-transform ${showFabMenu ? 'rotate-45' : ''}`}
          >
            <Plus size={28} />
          </button>

          {/* FAB菜单 */}
          {showFabMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 min-w-[180px] border border-gray-100">
              <FabMenuItem icon={<Sparkles size={20} />} label="AI智能收治" color="text-purple-500" onClick={() => { setShowAIModal(true); setShowFabMenu(false); }} />
              <FabMenuItem icon={<Zap size={20} />} label="批量生成日报" color="text-orange-500" onClick={() => { initBatchGenerate(); setShowFabMenu(false); }} />
              <FabMenuItem icon={<BookOpen size={20} />} label="模板库" color="text-blue-500" onClick={() => { setShowTemplates(true); setShowFabMenu(false); }} />
              <FabMenuItem icon={<ClipboardList size={20} />} label="快速录入" color="text-green-500" onClick={() => { setShowQuickEntry(true); setShowFabMenu(false); }} />
            </div>
          )}
        </div>
      )}
      {userRole === 'doctor' && <div className="w-14" />}

      <NavItem icon={<MessageSquare size={22} />} label="沟通" active={currentPage === 'messages'} onClick={() => navigateTo('messages')} badge={2} />
      <NavItem icon={<User size={22} />} label="我的" active={currentPage === 'profile'} onClick={() => navigateTo('profile')} />
    </div>
  );

  const NavItem = ({ icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${active ? 'text-teal-600' : 'text-gray-400'}`}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </button>
  );

  const FabMenuItem = ({ icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl transition"
    >
      <span className={color}>{icon}</span>
      <span className="text-sm text-gray-700">{label}</span>
    </button>
  );

  // 首页
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <Header
        title="康复云查房助手"
        rightAction={
          userRole === 'therapist' && (
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm transition"
            >
              <Sparkles size={16} />
              <span>AI收治</span>
            </button>
          )
        }
      />

      {/* 用户信息卡片 */}
      <div className="px-4 -mt-1">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl">
                👨‍⚕️
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">吴大勇 {userRole === 'therapist' ? '治疗师' : '（医生视角）'}</h2>
                <p className="text-sm text-gray-500">康复医学科 · 主管治疗师</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600">{patients.filter(p => p.status === 'active' && !p.todayTreated).length}</p>
              <p className="text-xs text-gray-500">今日待治疗</p>
            </div>
          </div>
        </div>
      </div>

      {/* 今日概览 */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="📋" value={patients.filter(p => p.status === 'active').length} label="在治患儿" color="bg-blue-50 text-blue-600" />
          <StatCard icon="✅" value={patients.filter(p => p.todayTreated).length} label="今日已治疗" color="bg-green-50 text-green-600" />
          <StatCard icon="⏰" value={patients.filter(p => p.status === 'active' && !p.todayTreated).length} label="待治疗" color="bg-orange-50 text-orange-600" />
        </div>
      </div>

      {/* 科室列表 */}
      <div className="px-4 mt-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 size={18} className="text-teal-500" />
          科室患儿分布
        </h3>
        <div className="space-y-3">
          {initialDepartments.map(dept => {
            const deptPatients = getDepartmentPatients(dept.id);
            const pending = deptPatients.filter(p => p.status === 'active' && !p.todayTreated).length;
            return (
              <button
                key={dept.id}
                onClick={() => navigateTo('patients', dept)}
                className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${dept.color} flex items-center justify-center text-2xl`}>
                    {dept.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-500">{deptPatients.length} 位患儿</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pending > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2.5 py-1 rounded-full font-medium">
                      {pending} 待治疗
                    </span>
                  )}
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 快捷入口 */}
      {userRole === 'therapist' && (
        <div className="px-4 mt-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap size={18} className="text-orange-500" />
            快捷操作
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<Sparkles size={24} />}
              label="AI智能收治"
              desc="上传病历自动建档"
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              onClick={() => setShowAIModal(true)}
            />
            <QuickActionCard
              icon={<Zap size={24} />}
              label="批量生成日报"
              desc="一键生成今日记录"
              color="bg-gradient-to-br from-orange-500 to-amber-500"
              onClick={initBatchGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );

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

  // 患儿列表页
  const PatientsPage = () => {
    const deptPatients = getDepartmentPatients(selectedDepartment.id);
    const activePatients = deptPatients.filter(p => p.status === 'active');
    const completedPatients = deptPatients.filter(p => p.status === 'completed');

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header title={selectedDepartment.name} showBack />

        <div className="px-4 py-4">
          {/* 进行中 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-green-500" />
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
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gray-400" />
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

  const PatientCard = ({ patient, onClick }) => (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center text-2xl">
          {patient.avatar}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800">{patient.name}</h4>
            <span className="text-xs text-gray-500">{patient.age} · {patient.gender}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{patient.bedNo}</span>
          </div>
          <p className="text-sm text-teal-600 mb-2">{patient.diagnosis}</p>

          {/* 标签区 */}
          <div className="flex flex-wrap gap-1.5">
            {patient.safetyAlerts.map((alert, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                <AlertTriangle size={12} />
                {alert}
              </span>
            ))}
            {patient.todayTreated ? (
              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                今日已治疗
              </span>
            ) : patient.status === 'active' && (
              <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                <Clock size={12} />
                待治疗
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400 mt-2" />
      </div>
    </button>
  );

  // 患儿详情页
  const PatientDetailPage = () => {
    const patient = selectedPatient;
    if (!patient) return null;

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header
          title="患儿详情"
          showBack
          rightAction={
            <div className="flex items-center gap-2">
              {/* PDF导出按钮 - 两种权限都可以使用 */}
              <button
                onClick={() => handleExportPDF(patient.id)}
                disabled={exportingPDF}
                className="flex items-center gap-1 p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50"
                title="导出PDF"
              >
                <Download size={20} />
              </button>

              {/* 修改按钮 - 只有治疗师可以使用 */}
              {userRole === 'therapist' && (
                <button
                  className="p-2 hover:bg-white/20 rounded-full transition"
                  title="编辑"
                >
                  <Edit3 size={20} />
                </button>
              )}
            </div>
          }
        />

        {/* 安全警示横幅 */}
        {patient.safetyAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {patient.safetyAlerts.join(' · ')}
            </span>
          </div>
        )}

        <div className="px-4 py-4">
          {/* 基础信息卡片 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center text-3xl">
                {patient.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
                  <span className="text-sm text-gray-500">{patient.age} · {patient.gender}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">床号：{patient.bedNo} · {patient.department}</p>
                <p className="text-teal-600 font-medium">{patient.diagnosis}</p>
              </div>
            </div>

            {/* GAS目标进度 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Target size={16} className="text-teal-500" />
                  GAS目标达成度
                </h4>
                <span className="text-lg font-bold text-teal-600">{patient.gasScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${patient.gasScore}%` }}
                />
              </div>
              <div className="space-y-2">
                {patient.gasGoals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 w-20">{goal.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-teal-400 h-2 rounded-full"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-500 w-16 text-right">{goal.current}/{goal.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 家庭作业 */}
          {patient.homework.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-500" />
                家庭作业 (Home Program)
              </h4>
              <div className="space-y-2">
                {patient.homework.map(hw => (
                  <div key={hw.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    {hw.completed ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <Circle size={20} className="text-gray-300" />
                    )}
                    <span className={`text-sm flex-1 ${hw.completed ? 'text-gray-500' : 'text-gray-700'}`}>
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
              {/* 个性化重点 */}
              {patient.treatmentPlan.highlights.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <h5 className="text-sm font-medium text-amber-700 flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-500" />
                    今日个性化重点
                  </h5>
                  {patient.treatmentPlan.highlights.map((h, i) => (
                    <p key={i} className="text-sm text-amber-800">{h}</p>
                  ))}
                </div>
              )}

              {/* 治疗目标 */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-1">治疗目标</h5>
                <p className="text-sm text-gray-600">{patient.treatmentPlan.focus}</p>
              </div>

              {/* 注意事项 */}
              {patient.treatmentPlan.precautions.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                  <h5 className="text-sm font-medium text-red-700 flex items-center gap-2 mb-2">
                    <AlertCircle size={16} />
                    注意事项
                  </h5>
                  <ul className="text-sm text-red-600 space-y-1">
                    {patient.treatmentPlan.precautions.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 治疗项目列表 */}
              <h5 className="text-sm font-medium text-gray-700 mb-3">治疗项目</h5>
              {patient.treatmentPlan.items.length > 0 ? (
                <div className="space-y-2">
                  {patient.treatmentPlan.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleTreatmentItem(patient.id, item.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                        item.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-teal-300'
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
                      className="mt-3 bg-teal-500 text-white px-4 py-2 rounded-full text-sm hover:bg-teal-600 transition"
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
                  className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
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
                        <div className="absolute left-2.5 top-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />

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
                              <span key={j} className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
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
      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? 'bg-teal-500 text-white shadow-md'
          : 'bg-white text-gray-600 border border-gray-200'
      }`}
    >
      {children}
    </button>
  );

  // 排班页面
  const SchedulePage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="今日排班" />

      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">2026年1月11日 周六</h3>
            <span className="text-sm text-teal-600">{scheduleData.filter(s => s.type === 'treatment').length} 项治疗</span>
          </div>

          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {scheduleData.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-sm text-gray-500 w-12 pt-2">{item.time}</span>
                  <div className={`flex-1 p-3 rounded-xl border ${
                    item.type === 'treatment' ? 'bg-teal-50 border-teal-200' :
                    item.type === 'meeting' ? 'bg-blue-50 border-blue-200' :
                    item.type === 'consultation' ? 'bg-purple-50 border-purple-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'treatment' && <Stethoscope size={16} className="text-teal-600" />}
                      {item.type === 'meeting' && <Users size={16} className="text-blue-600" />}
                      {item.type === 'consultation' && <MessageSquare size={16} className="text-purple-600" />}
                      {item.type === 'break' && <Coffee size={16} className="text-gray-500" />}
                      <span className="font-medium text-gray-800">{item.title}</span>
                    </div>
                    {item.location && (
                      <p className="text-xs text-gray-500">{item.location}</p>
                    )}
                    {item.patients && (
                      <p className="text-xs text-teal-600 mt-1">{item.patients} 位患儿</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 消息页面
  const MessagesPage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="医嘱沟通" />

      <div className="px-4 py-4">
        <div className="space-y-3">
          {messagesData.map(msg => (
            <div key={msg.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${msg.unread ? 'border-teal-200' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  msg.type === 'alert' ? 'bg-red-100' :
                  msg.type === 'system' ? 'bg-gray-100' : 'bg-blue-100'
                }`}>
                  {msg.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{msg.from}</span>
                      {msg.department && (
                        <span className="text-xs text-gray-500">{msg.department}</span>
                      )}
                      {msg.unread && (
                        <span className="w-2 h-2 bg-teal-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <p className={`text-sm ${msg.type === 'alert' ? 'text-red-600' : 'text-gray-600'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 我的页面
  const ProfilePage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="我的" />

      <div className="px-4 py-4">
        {/* 用户卡片 */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg mb-4">
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
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Edit3 size={24} className={userRole === 'therapist' ? 'text-teal-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'} />
              <p className={`text-sm font-medium ${userRole === 'therapist' ? 'text-teal-700' : 'text-gray-600'}`}>
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
              <p className="text-2xl font-bold text-teal-600">156</p>
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

  // AI智能收治弹窗
  const AIModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => { setShowAIModal(false); setAiStep(0); setAiResult(null); }}>
      <div
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="text-purple-500" size={20} />
            AI智能收治
          </h3>
          <button onClick={() => { setShowAIModal(false); setAiStep(0); setAiResult(null); }} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {aiStep === 0 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={40} className="text-purple-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">上传病历资料</h4>
              <p className="text-sm text-gray-500 mb-6">支持图片、PDF格式的病历文件</p>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-4 hover:border-purple-400 transition cursor-pointer"
                   onClick={startAIAnalysis}>
                <Camera size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">点击上传或拍照</p>
              </div>

              <button
                onClick={startAIAnalysis}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium"
              >
                模拟上传并分析
              </button>
            </div>
          )}

          {aiStep === 1 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain size={40} className="text-purple-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">AI正在分析病历...</h4>
              <p className="text-sm text-gray-500">正在识别诊断信息，生成康复方案</p>

              <div className="mt-8 space-y-3">
                <AnalysisStep label="识别病历文本" done />
                <AnalysisStep label="提取诊断信息" done />
                <AnalysisStep label="分析康复需求" loading />
                <AnalysisStep label="生成治疗方案" />
              </div>
            </div>
          )}

          {aiStep === 2 && aiResult && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="text-sm text-green-700">AI分析完成，请确认以下信息</span>
              </div>

              {/* 基本信息 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">基本信息</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">姓名：</span>{aiResult.name}</div>
                  <div><span className="text-gray-500">年龄：</span>{aiResult.age}</div>
                  <div><span className="text-gray-500">性别：</span>{aiResult.gender}</div>
                  <div><span className="text-gray-500">床号：</span>{aiResult.bedNo}</div>
                  <div className="col-span-2"><span className="text-gray-500">诊断：</span>{aiResult.diagnosis}</div>
                </div>
              </div>

              {/* 安全注意 */}
              {aiResult.safetyAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    安全注意事项
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.safetyAlerts.map((alert, i) => (
                      <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{alert}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 治疗方案 */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
                <h5 className="text-sm font-medium text-teal-700 mb-2">AI生成的康复方案</h5>
                <p className="text-sm text-teal-800 mb-3">{aiResult.treatmentPlan.focus}</p>
                <div className="space-y-2">
                  {aiResult.treatmentPlan.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2">
                      <span>{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 注意事项 */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <h5 className="text-sm font-medium text-orange-700 mb-2">训练注意点</h5>
                <ul className="text-sm text-orange-800 space-y-1">
                  {aiResult.treatmentPlan.precautions.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setAiStep(0); setAiResult(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                >
                  重新上传
                </button>
                <button
                  onClick={confirmAIAdmission}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  确认建档
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AnalysisStep = ({ label, done, loading }) => (
    <div className="flex items-center gap-3 text-left px-4">
      {done ? (
        <CheckCircle2 size={20} className="text-green-500" />
      ) : loading ? (
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Circle size={20} className="text-gray-300" />
      )}
      <span className={done ? 'text-green-700' : loading ? 'text-purple-700' : 'text-gray-400'}>{label}</span>
    </div>
  );

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
                    ? 'bg-teal-500 text-white'
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
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
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
                      <span key={i} className="bg-teal-100 text-teal-700 text-sm px-3 py-1 rounded-full">{item}</span>
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
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                  />
                </div>

                {/* 备注 */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">治疗备注</h5>
                  <textarea
                    value={editingRecord?.notes || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                  />
                </div>

                <button
                  onClick={() => confirmBatchItem(currentBatchIndex, editingRecord)}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  确认此记录 ({currentBatchIndex + 1}/{batchPatients.length})
                </button>
              </>
            )}

            {allConfirmed && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowBatchGenerate(false)}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium"
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
              <div className="bg-teal-50 rounded-xl p-3 mb-4">
                <h5 className="text-sm font-medium text-teal-700 mb-2">已选择 ({selectedItems.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item, i) => (
                    <span key={i} className="bg-teal-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
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
                            ? 'bg-teal-500 text-white'
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
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
      {currentPage === 'schedule' && <SchedulePage />}
      {currentPage === 'messages' && <MessagesPage />}
      {currentPage === 'profile' && <ProfilePage />}

      {/* 底部导航 */}
      <BottomNav />

      {/* 弹窗 */}
      {showAIModal && <AIModal />}
      {showBatchGenerate && <BatchGenerateModal />}
      {showTemplates && <TemplatesModal />}
      {showQuickEntry && <QuickEntryModal />}

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
