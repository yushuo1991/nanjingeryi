import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Calendar, MessageSquare, User, Plus, ChevronRight, ChevronLeft,
  AlertTriangle, Shield, Baby, Stethoscope, Brain, Bone, Heart,
  Clock, CheckCircle2, Circle, FileText, Upload, Sparkles, X, Check,
  Edit3, Trash2, Activity, Target, TrendingUp, Clipboard, Send,
  Play, Pause, RotateCcw, Zap, BookOpen, Star, Filter, Search,
  Bell, Settings, LogOut, Eye, EyeOff, Camera, File, ArrowRight,
  Users, Building2, Bed, ClipboardList, Timer, Coffee, Utensils, Printer,
  Moon, Sun, Award, Flag, AlertCircle, Info, ThumbsUp, MessageCircle,
  Share2, Link, ExternalLink, Loader2
} from 'lucide-react';

import { api } from './lib/api';

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
  { id: 1, name: '呼吸内科', icon: '🫁', color: 'bg-brand-blue-100 text-brand-blue-600', patients: 8, pending: 5 },
  { id: 6, name: '新生儿科', icon: '👶', color: 'bg-brand-pink-100 text-brand-pink-600', patients: 3, pending: 2 },
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
    color: 'bg-brand-blue-50 border-brand-blue-200',
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
    color: 'bg-brand-pink-50 border-brand-pink-200',
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
      deptName: params.get('deptName') || '',
      readonly: params.get('readonly') === 'true'
    };
  };

  const urlParams = getUrlParams();
  const isSharedVisitorInit = Boolean(urlParams.deptId) && urlParams.readonly;

  // 状态管理
  const [currentPage, setCurrentPage] = useState(() => {
    // 分享链接访问：默认进入首页（隐藏最近建档，并限制访问科室）
    if (isSharedVisitorInit) return 'home';
    // 非分享：如果URL有科室参数，直接进入该科室患者列表
    if (urlParams.deptId) return 'patients';
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
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [detailTab, setDetailTab] = useState('today'); // today | logs
  const [showAllPatients, setShowAllPatients] = useState(false); // 显示全部患者弹窗
  const [toast, setToast] = useState(null); // 提示消息

  // AI收治状态
  const [aiStep, setAiStep] = useState(0); // 0:上传, 1:AI识别中, 2:表单填写
  const [aiResult, setAiResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // 上传的图片预览
  const [uploadedFilesMeta, setUploadedFilesMeta] = useState({ count: 0, names: [] });
  const [caseAttachments, setCaseAttachments] = useState({ caseId: null, items: [], loading: false, error: null });

  // 识别状态（沿用变量名，不影响功能）
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  // Stability: ignore out-of-order async responses when user re-uploads quickly.
  const uploadRunRef = useRef(0);
  const uploadAbortRef = useRef(null);

  const normalizeTreatmentPlan = (plan) => {
    const p = plan && typeof plan === 'object' ? plan : {};
    return {
      focus: p.focus || '',
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      items: Array.isArray(p.items) ? p.items : [],
      precautions: Array.isArray(p.precautions) ? p.precautions : [],
      familyEducation: Array.isArray(p.familyEducation) ? p.familyEducation : [],
      review: p.review && typeof p.review === 'object' ? p.review : null,
    };
  };

  function toLocalIsoDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const normalizePatient = (patient) => {
    const p = patient && typeof patient === 'object' ? patient : {};
    const logs = Array.isArray(p.treatmentLogs) ? p.treatmentLogs : [];
    const treatedToday = logs.length ? String(logs[0]?.date || '') === toLocalIsoDate() : Boolean(p.todayTreated);
    return { ...p, treatmentPlan: normalizeTreatmentPlan(p.treatmentPlan), todayTreated: treatedToday, treatmentLogs: logs };
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtDateCn(iso) {
    const s = String(iso || '').trim();
    if (!s) return '';
    // Expect YYYY-MM-DD
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return s;
    return `${m[1]}年${m[2]}月${m[3]}日`;
  }

  function buildFormalReportHtml(patient) {
    const p = patient || {};
    const now = new Date();
    const todayIso = toLocalIsoDate(now);
    const title = `康复治疗记录单（${escapeHtml(p.department || '')}）`;

    const safety = Array.isArray(p.safetyAlerts) ? p.safetyAlerts : [];
    const gasGoals = Array.isArray(p.gasGoals) ? p.gasGoals : [];
    const plan = p.treatmentPlan && typeof p.treatmentPlan === 'object' ? p.treatmentPlan : {};
    const items = Array.isArray(plan.items) ? plan.items : [];
    const precautions = Array.isArray(plan.precautions) ? plan.precautions : [];
    const highlights = Array.isArray(plan.highlights) ? plan.highlights : [];

    const logs = Array.isArray(p.treatmentLogs) ? p.treatmentLogs : [];
    const latestLog = logs.length ? logs[0] : null;
    const todayLog = logs.find((l) => String(l?.date || '') === todayIso) || null;

    const itemRows = items.map((it, idx) => {
      const done = Boolean(it?.completed);
      return `
        <tr>
          <td class="c center">${idx + 1}</td>
          <td class="c">${escapeHtml(it?.name || '')}</td>
          <td class="c center">${escapeHtml(it?.duration || '')}</td>
          <td class="c center">${done ? '√' : ''}</td>
          <td class="c">${escapeHtml(it?.note || it?.notes || '')}</td>
        </tr>
      `;
    }).join('');

    const goalRows = gasGoals.slice(0, 2).map((g, idx) => `
      <tr>
        <td class="c center">${idx + 1}</td>
        <td class="c">${escapeHtml(g?.name || '')}</td>
        <td class="c center">${escapeHtml(g?.current ?? '')}</td>
        <td class="c center">${escapeHtml(g?.target ?? '')}</td>
      </tr>
    `).join('');

    const logRows = logs.slice(0, 7).map((l) => {
      const date = fmtDateCn(l?.date);
      const itemsText = Array.isArray(l?.items) ? l.items.join('、') : '';
      return `
        <tr>
          <td class="c center">${escapeHtml(date)}</td>
          <td class="c">${escapeHtml(itemsText)}</td>
          <td class="c">${escapeHtml(l?.highlight || '')}</td>
          <td class="c">${escapeHtml(l?.notes || '')}</td>
          <td class="c center">${escapeHtml(l?.therapist || '')}</td>
        </tr>
      `;
    }).join('');

    const printDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    html, body { background: #fff; color: #000; }
    body { font-family: "SimSun","Songti SC",serif; font-size: 12pt; line-height: 1.35; }
    .wrap { width: 100%; }
    .h1 { text-align: center; font-size: 18pt; font-weight: 700; margin: 0 0 6mm; }
    .meta { display: flex; justify-content: space-between; font-size: 10.5pt; margin-bottom: 4mm; }
    .meta div { white-space: nowrap; }
    .box { border: 1px solid #000; padding: 3mm; margin-bottom: 4mm; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 2.2mm 2.4mm; vertical-align: top; }
    th { text-align: center; font-weight: 700; }
    .center { text-align: center; }
    .small { font-size: 10.5pt; }
    .section { font-weight: 700; margin: 0 0 2mm; }
    .sig { display: flex; justify-content: space-between; gap: 10mm; margin-top: 6mm; }
    .sig .line { flex: 1; border-bottom: 1px solid #000; height: 10mm; }
    .muted { color: #000; }
    .nowrap { white-space: nowrap; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="h1">${escapeHtml(title)}</div>
    <div class="meta">
      <div>打印日期：${escapeHtml(fmtDateCn(printDate))}</div>
      <div>记录日期：${escapeHtml(fmtDateCn(todayLog?.date || latestLog?.date || todayIso))}</div>
    </div>

    <div class="box">
      <div class="section">一、患者基本信息</div>
      <table class="small">
        <tr>
          <th class="nowrap">姓名</th><td>${escapeHtml(p.name || '')}</td>
          <th class="nowrap">性别</th><td>${escapeHtml(p.gender || '')}</td>
          <th class="nowrap">年龄</th><td>${escapeHtml(p.age || '')}</td>
        </tr>
        <tr>
          <th class="nowrap">床号</th><td>${escapeHtml(p.bedNo || '')}</td>
          <th class="nowrap">科室</th><td>${escapeHtml(p.department || '')}</td>
          <th class="nowrap">入院日期</th><td>${escapeHtml(fmtDateCn(p.admissionDate || ''))}</td>
        </tr>
        <tr>
          <th class="nowrap">诊断</th>
          <td colspan="5">${escapeHtml(p.diagnosis || '')}</td>
        </tr>
      </table>
    </div>

    <div class="box">
      <div class="section">二、安全提醒 / 风险提示（黑白打印）</div>
      <div class="small">${escapeHtml((safety.slice(0, 2).join('；')) || '无')}</div>
    </div>

    <div class="box">
      <div class="section">三、康复目标（GAS）</div>
      <table class="small">
        <tr><th style="width:10mm">序号</th><th>目标</th><th style="width:22mm">当前</th><th style="width:22mm">目标</th></tr>
        ${goalRows || '<tr><td class="c center">1</td><td class="c"></td><td class="c center"></td><td class="c center"></td></tr><tr><td class="c center">2</td><td class="c"></td><td class="c center"></td><td class="c center"></td></tr>'}
      </table>
    </div>

    <div class="box">
      <div class="section">四、今日个体化重点</div>
      <div class="small">${escapeHtml(highlights.slice(0, 2).join('；') || '—')}</div>
    </div>

    <div class="box">
      <div class="section">五、今日治疗计划与执行情况</div>
      <div class="small" style="margin-bottom:2mm;"><b>治疗重点：</b>${escapeHtml(plan.focus || '')}</div>
      <table class="small">
        <tr>
          <th style="width:10mm">序号</th>
          <th>训练项目</th>
          <th style="width:22mm">时长</th>
          <th style="width:14mm">完成</th>
          <th>要点/备注</th>
        </tr>
        ${itemRows || '<tr><td class="c center">1</td><td class="c"></td><td class="c center"></td><td class="c center"></td><td class="c"></td></tr><tr><td class="c center">2</td><td class="c"></td><td class="c center"></td><td class="c center"></td><td class="c"></td></tr><tr><td class="c center">3</td><td class="c"></td><td class="c center"></td><td class="c center"></td><td class="c"></td></tr>'}
      </table>
      <div class="small" style="margin-top:3mm;"><b>注意事项/禁忌（2条）：</b>${escapeHtml(precautions.slice(0, 2).join('；') || '—')}</div>
    </div>

    <div class="box">
      <div class="section">六、当日治疗记录（供管床医生查阅）</div>
      <table class="small">
        <tr>
          <th style="width:28mm">记录日期</th>
          <th style="width:42mm">已执行项目</th>
          <th>当日要点</th>
          <th>备注/反应</th>
        </tr>
        <tr>
          <td class="c center">${escapeHtml(fmtDateCn(todayLog?.date || todayIso))}</td>
          <td class="c">${escapeHtml(Array.isArray(todayLog?.items) ? todayLog.items.join('、') : (items.filter((it) => it.completed).map((it) => it.name).join('、')))}</td>
          <td class="c">${escapeHtml(todayLog?.highlight || '')}</td>
          <td class="c">${escapeHtml(todayLog?.notes || '')}</td>
        </tr>
      </table>
      <div class="sig small">
        <div>治疗师签名：<span class="line"></span></div>
        <div>管床医生签名：<span class="line"></span></div>
      </div>
    </div>

    <div class="box">
      <div class="section">七、近期治疗记录（最近7条）</div>
      <table class="small">
        <tr>
          <th style="width:24mm">日期</th>
          <th style="width:46mm">项目</th>
          <th>要点</th>
          <th>备注</th>
          <th style="width:22mm">治疗师</th>
        </tr>
        ${logRows || '<tr><td class="c center"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c center"></td></tr>'}
      </table>
    </div>

    <div class="small muted">说明：本记录供临床沟通与病区查房使用；请结合实际情况与医嘱复核。</div>
  </div>
  <script>
    // Auto-open print dialog when user chooses “Save as PDF” in browser.
    // Commented out by default to avoid unexpected behavior.
    // window.addEventListener('load', () => window.print());
  </script>
</body>
</html>`;
  }

  async function exportFormalReportPdf(patient) {
    const pid = Number(patient?.id);
    if (!pid) {
      showToast('该患者尚未保存到数据库，无法导出 PDF', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/patients/${pid}/report.pdf`, { method: 'GET' });
      if (!res.ok) {
        let msg = `导出失败：${res.status}`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const safeName = String(patient?.name || '患者').replace(/[\\/:*?"<>|]/g, '_');
      const safeBed = String(patient?.bedNo || '').replace(/[\\/:*?"<>|]/g, '_');
      const fileName = `治疗记录_${safeName}${safeBed ? '_' + safeBed : ''}_${toLocalIsoDate()}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 6000);
    } catch (e) {
      showToast(e?.message || '导出失败', 'error');
    }
  }

  const formatPlanItemNote = (it) => {
    const parts = [];
    if (it?.frequency) parts.push(`频次：${it.frequency}`);
    if (it?.intensity) parts.push(`强度：${it.intensity}`);
    if (Array.isArray(it?.steps) && it.steps.filter(Boolean).length) parts.push(`步骤：${it.steps.filter(Boolean).join('；')}`);
    if (Array.isArray(it?.monitoring) && it.monitoring.filter(Boolean).length) parts.push(`监测：${it.monitoring.filter(Boolean).join('；')}`);
    if (Array.isArray(it?.stopCriteria) && it.stopCriteria.filter(Boolean).length) parts.push(`停止：${it.stopCriteria.filter(Boolean).join('；')}`);
    if (it?.notes) parts.push(`备注：${it.notes}`);
    return parts.join('\n');
  };

  const mergeUniqueStrings = (...arrays) => {
    const out = [];
    const seen = new Set();
    for (const arr of arrays) {
      if (!Array.isArray(arr)) continue;
      for (const raw of arr) {
        const v = String(raw || '').trim();
        if (!v) continue;
        if (seen.has(v)) continue;
        seen.add(v);
        out.push(v);
      }
    }
    return out;
  };

  function copyText(text) {
    const value = String(text || '');
    if (!value.trim()) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(
        () => showToast('已复制'),
        () => showToast('复制失败，请手动复制', 'error')
      );
      return;
    }
    const input = document.createElement('textarea');
    input.value = value;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast('已复制');
    } catch {
      showToast('复制失败，请手动复制', 'error');
    } finally {
      document.body.removeChild(input);
    }
  }

  function buildDoctorPlanText(patient) {
    const p = normalizePatient(patient);
    const lines = [];
    lines.push('康复训练方案（供管床医生参考）');
    lines.push(`患者：${p.name || '-'}  床号：${p.bedNo || '-'}  科室：${p.department || '-'}`);
    lines.push(`诊断：${p.diagnosis || '-'}`);
    lines.push('');
    if (Array.isArray(p.gasGoals) && p.gasGoals.length) {
      lines.push('康复目标（GAS）：');
      p.gasGoals.slice(0, 3).forEach((g, idx) => lines.push(`${idx + 1}. ${g.name}（当前${g.current}/${g.target}）`));
      lines.push('');
    }
    lines.push(`训练重点：${p.treatmentPlan.focus || '康复训练'}`);
    if (Array.isArray(p.safetyAlerts) && p.safetyAlerts.length) {
      lines.push(`安全提醒：${p.safetyAlerts.slice(0, 6).join('；')}`);
    }
    if (Array.isArray(p.treatmentPlan.precautions) && p.treatmentPlan.precautions.length) {
      lines.push(`注意事项：${p.treatmentPlan.precautions.slice(0, 6).join('；')}`);
    }
    lines.push('');
    lines.push('今日训练清单：');
    (p.treatmentPlan.items || []).slice(0, 8).forEach((it, idx) => {
      const head = `${idx + 1}. ${it.name || '-'}${it.duration ? `（${it.duration}）` : ''}`;
      const note = String(it.note || '').split('\n').filter(Boolean)[0] || '';
      lines.push(note ? `${head}：${note}` : head);
    });
    return lines.join('\n');
  }

  // 批量生成状态
  const [batchPatients, setBatchPatients] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [isSavingAdmission, setIsSavingAdmission] = useState(false);
  const [showCompleteSession, setShowCompleteSession] = useState(false);
  const [sessionDraft, setSessionDraft] = useState(null); // { patientId, tolerance, cooperation, extra }

  // 从后端加载患者数据（MySQL）
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api('/api/patients');
        if (cancelled) return;
        const list = Array.isArray(res?.items) ? res.items : [];
        if (list.length) setPatients(list.map(normalizePatient));
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

  // 病历附件（多图）：根据 caseId 拉取文件列表，用于患者详情页展示
  useEffect(() => {
    const caseId = selectedPatient?.caseId ? Number(selectedPatient.caseId) : null;
    if (!caseId) {
      setCaseAttachments({ caseId: null, items: [], loading: false, error: null });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setCaseAttachments((prev) => ({ ...prev, caseId, loading: true, error: null }));
        const res = await api(`/api/cases/${caseId}/files`);
        if (cancelled) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        setCaseAttachments({ caseId, items, loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setCaseAttachments({ caseId, items: [], loading: false, error: e?.message || '加载附件失败' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPatient?.caseId]);

  // 显示Toast提示
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 生成分享链接
  const generateShareLink = (deptId) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const dept = (initialDepartments || []).find((d) => d.id === deptId) || null;
    const deptName = dept?.name ? encodeURIComponent(dept.name) : '';
    return `${baseUrl}?dept=${deptId}${deptName ? `&deptName=${deptName}` : ''}&readonly=true`;
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

  // 保持selectedPatient与patients数组同步
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatient = patients.find(p => p.id === selectedPatient.id);
      if (updatedPatient && JSON.stringify(updatedPatient) !== JSON.stringify(selectedPatient)) {
        setSelectedPatient(updatedPatient);
      }
    }
  }, [patients]);

  // 导航函数
  const navigateTo = (page, data = null) => {
    // 分享链接：只能访问指定科室
    if (page === 'patients' && data && sharedDeptId && data.id !== sharedDeptId) {
      showToast('您无权限访问其他科室', 'error');
      return;
    }
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
      // 如果有选中的科室，返回该科室的患者列表
      if (selectedDepartment) {
        setCurrentPage('patients');
      } else if (!sharedDeptId) {
        // 非分享模式才能返回首页
        setCurrentPage('home');
      }
      setSelectedPatient(null);
    } else if (currentPage === 'patients') {
      // 医生/分享视角也允许回到首页（分享权限仍由 sharedDeptId 控制）
      setCurrentPage('home');
      setSelectedDepartment(null);
    }
  };

  const isSharedVisitor = Boolean(sharedDeptId) && urlParams.readonly;
  const visiblePatients = isSharedVisitor ? patients.filter((p) => p.departmentId === sharedDeptId) : patients;
  const sharedDeptName = isSharedVisitor
    ? (urlParams.deptName || initialDepartments.find((d) => d.id === sharedDeptId)?.name || selectedDepartment?.name || '科室')
    : '';

  // 获取科室患者
  const getDepartmentPatients = (deptId) => {
    return visiblePatients.filter(p => p.departmentId === deptId);
  };

  // 完成治疗项目
  const toggleTreatmentItem = (patientId, itemId) => {
    if (userRole !== 'therapist') return;
    const current = patients.find((p) => p.id === patientId);
    if (!current) return;
    const updated = normalizePatient({
      ...current,
      treatmentPlan: {
        ...current.treatmentPlan,
        items: current.treatmentPlan.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      },
    });
    setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
    if (selectedPatient?.id === patientId) setSelectedPatient(updated);
    (async () => {
      try {
        await api(`/api/patients/${patientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient: updated }),
        });
      } catch (e) {
        showToast(e.message || '保存失败', 'error');
      }
    })();
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

  async function createCaseWithFiles(files) {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    const res = await api('/api/cases', { method: 'POST', body: form });
    if (!res?.success) throw new Error(res?.error || '创建病例失败');
    return res.caseId;
  }

  async function analyzeCase(caseId, signal) {
    const res = await api(`/api/cases/${caseId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal,
    });
    if (!res?.success) throw new Error(res?.error || 'AI 分析失败');
    return { runId: res.runId, profile: res.profile, plan: res.plan };
  }

  // AI分析 - 处理图片上传并调用通义千问3-VL-Plus（无需 OCR）
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter(Boolean);
    e.target.value = '';
    if (files.length) {
      const unsupported = files.find((f) => {
        const t = String(f?.type || '');
        return t && !['image/jpeg', 'image/png', 'image/webp'].includes(t);
      });
      if (unsupported) {
        showToast(`暂不支持该图片格式：${unsupported.type || unsupported.name}，请转为 JPG/PNG/WebP`, 'error');
        setUploadedFilesMeta({ count: 0, names: [] });
        return;
      }
      const tooLarge = files.find((f) => Number(f?.size || 0) > 15 * 1024 * 1024);
      if (tooLarge) {
        showToast(`图片过大（单张最大 15MB）：${tooLarge.name || ''}`, 'error');
        setUploadedFilesMeta({ count: 0, names: [] });
        return;
      }
      setUploadedFilesMeta({ count: files.length, names: files.map((f) => f?.name || '').filter(Boolean) });
      const first = files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const token = ++uploadRunRef.current;
        try {
          uploadAbortRef.current?.abort?.();
        } catch {
          // ignore
        }
        const controller = new AbortController();
        uploadAbortRef.current = controller;

        setUploadedImage(reader.result);
        setAiStep(1); // 进入AI识别步骤
        setIsOcrProcessing(true);
        setOcrProgress(0);

        let progressInterval = null;
        try {
          const caseId = await createCaseWithFiles(files);

          // 模拟进度（模型接口无进度回调，预估 1-2 分钟）
          progressInterval = setInterval(() => {
            setOcrProgress(prev => Math.min(prev + 2, 95));
          }, 1000);

          const { profile, plan } = await analyzeCase(caseId, controller.signal);
          if (token !== uploadRunRef.current) return;
          setOcrProgress(100);

          // 初始化表单数据
          const safeGender = ['男', '女', '未知'].includes(profile?.patient?.gender) ? profile.patient.gender : '未知';
          const planGasGoals = Array.isArray(plan?.gasGoals) ? plan.gasGoals : [];
          const profileRisks = Array.isArray(profile?.risks) ? profile.risks : [];
          const contraindications = Array.isArray(profile?.contraindications) ? profile.contraindications : [];
          const monitoring = Array.isArray(profile?.monitoring) ? profile.monitoring : [];
          const keyFindings = Array.isArray(profile?.keyFindings) ? profile.keyFindings : [];
          const missingFields = Array.isArray(profile?.missingFields) ? profile.missingFields : [];
          const confidence = profile?.confidence && typeof profile.confidence === 'object' ? profile.confidence : null;
          // 产品要求：每类只保留两条“可执行”的提示，过多会降低核对效率
          const autoAlerts = mergeUniqueStrings(profileRisks, contraindications, monitoring).slice(0, 2);
          const aiFilled = {
            name: Boolean(String(profile?.patient?.name || '').trim()) && String(profile?.patient?.name || '').trim() !== '未知',
            age: Boolean(String(profile?.patient?.age || '').trim()) && String(profile?.patient?.age || '').trim() !== '未知',
            bedNo: Boolean(String(profile?.patient?.bedNo || '').trim()) && String(profile?.patient?.bedNo || '').trim() !== '未知',
            diagnosis: Boolean(String(profile?.patient?.diagnosis || '').trim()) && String(profile?.patient?.diagnosis || '').trim() !== '未知',
          };
          setAiResult({
            _caseId: caseId,
            name: profile?.patient?.name || '',
            age: profile?.patient?.age || '',
            gender: safeGender || '未知',
            diagnosis: profile?.patient?.diagnosis || '',
            department: profile?.patient?.department || '呼吸内科',
            bedNo: profile?.patient?.bedNo || '',
            medicalRecordImage: reader.result,
            profileRaw: profile && typeof profile === 'object' ? profile : null,
            aiFilled,
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
              highlights: Array.isArray(plan?.highlights) ? plan.highlights.slice(0, 2).map((h) => String(h || '').trim()).filter(Boolean) : [],
              items: Array.isArray(plan?.items)
                ? plan.items.slice(0, 3).map((it, idx) => ({
                    id: Date.now() + idx,
                    name: it.name || '',
                    icon: '🎯',
                    duration: it.duration || '',
                    completed: false,
                    note: formatPlanItemNote(it),
                  }))
                : [],
              precautions: Array.isArray(plan?.precautions) ? plan.precautions.slice(0, 2) : [],
              familyEducation: Array.isArray(plan?.familyEducation) ? plan.familyEducation.slice(0, 2) : [],
              review: plan?.review && typeof plan.review === 'object' ? plan.review : null,
            },
            safetyAlerts: autoAlerts,
            extractedMeta: {
              risks: profileRisks,
              contraindications,
              monitoring,
              keyFindings,
              missingFields,
              confidence,
            },
          });

          setAiStep(2); // 进入表单填写步骤

        } catch (error) {
          if (error?.name === 'AbortError') return;
          if (token !== uploadRunRef.current) return;
          console.error('AI识别失败:', error);
          showToast('AI识别失败，请重新上传更清晰/包含关键信息的截图', 'error');
          setAiResult(null);
          setAiStep(0);
          setUploadedImage(null);
          setUploadedFilesMeta({ count: 0, names: [] });
          setOcrText('');
          setOcrProgress(0);
        } finally {
          if (progressInterval) clearInterval(progressInterval);
          if (token === uploadRunRef.current) setIsOcrProcessing(false);
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
        risks: aiResult.extractedMeta?.risks || aiResult.safetyAlerts || [],
        contraindications: aiResult.extractedMeta?.contraindications || [],
        monitoring: aiResult.extractedMeta?.monitoring || [],
        keyFindings: aiResult.extractedMeta?.keyFindings || [],
      };
      const { plan } = await generatePlan(aiResult._caseId, profile);
      setAiResult((prev) => ({
        ...prev,
        gasGoals: Array.isArray(plan?.gasGoals) && plan.gasGoals.length
          ? plan.gasGoals.slice(0, 2).map((g) => ({
              name: g.name || '',
              target: Number(g.target || 100),
              current: Number(g.current || 0),
            }))
          : prev.gasGoals,
        treatmentPlan: {
          focus: plan.focus || prev.treatmentPlan.focus,
          highlights: Array.isArray(plan?.highlights) ? plan.highlights.slice(0, 2).map((h) => String(h || '').trim()).filter(Boolean) : prev.treatmentPlan.highlights,
          items: Array.isArray(plan.items)
            ? plan.items.map((it, idx) => ({
                id: Date.now() + idx,
                name: it.name || '',
                icon: '🎯',
                duration: it.duration || '',
                completed: false,
                note: formatPlanItemNote(it),
              }))
            : prev.treatmentPlan.items,
          precautions: Array.isArray(plan.precautions) ? plan.precautions : prev.treatmentPlan.precautions,
          familyEducation: Array.isArray(plan?.familyEducation) ? plan.familyEducation : prev.treatmentPlan.familyEducation,
          review: plan?.review && typeof plan.review === 'object' ? plan.review : prev.treatmentPlan.review,
        },
      }));
      showToast('方案已生成，可编辑后确认建档', 'success');
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
    // 强制要求关键字段必须由 AI 成功识别（不允许手动补齐绕过）
    const requiredAiFields = ['name', 'age', 'bedNo', 'diagnosis'];
    const missingAi = requiredAiFields.filter((k) => !aiResult?.aiFilled?.[k]);
    if (missingAi.length > 0) {
      // 已在表单顶部展示“关键字段未完整识别”的红色提示，这里避免重复 toast 打扰。
      return false;
    }
    return true;
  };

  // 确认收治 - 真正保存患者数据
  const confirmAdmission = async () => {
    if (isSavingAdmission) return;
    if (!validateForm()) return;
    setIsSavingAdmission(true);

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

    // 计算GAS分数
    const gasScore = aiResult.gasGoals.length > 0
      ? Math.round(aiResult.gasGoals.reduce((sum, g) => sum + (g.current / g.target * 100), 0) / aiResult.gasGoals.length)
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
      caseId: aiResult._caseId || null,
      medicalRecordImage: aiResult.medicalRecordImage, // 保存病历图片
      safetyAlerts: aiResult.safetyAlerts,
      gasScore: gasScore,
      gasGoals: aiResult.gasGoals.filter(g => g.name.trim()),
      treatmentPlan: {
        focus: aiResult.treatmentPlan.focus || '康复训练',
        highlights: aiResult.treatmentPlan.highlights.filter(h => h.trim()).slice(0, 2),
        items: aiResult.treatmentPlan.items.filter(item => item.name.trim()).slice(0, 3),
        precautions: aiResult.treatmentPlan.precautions.filter(p => p.trim()).slice(0, 2),
        familyEducation: (aiResult.treatmentPlan.familyEducation || []).filter(p => String(p || '').trim()).slice(0, 2),
        review: aiResult.treatmentPlan.review || null,
      },
      treatmentLogs: [],
      homework: []
    };

    const planForDb = {
      gasGoals: newPatient.gasGoals,
      focus: newPatient.treatmentPlan.focus,
      highlights: newPatient.treatmentPlan.highlights,
      items: newPatient.treatmentPlan.items.map((i) => ({ name: i.name, duration: i.duration, notes: i.note })),
      precautions: newPatient.treatmentPlan.precautions,
      familyEducation: newPatient.treatmentPlan.familyEducation,
      review: newPatient.treatmentPlan.review,
    };

    // 写入后端（MySQL）并刷新列表（等待完成后再跳转，避免跳回首页/空白页）
    let createdPatient = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      const res = await api(
        '/api/patients',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient: newPatient, plan: planForDb, caseId: aiResult._caseId || null }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (!res?.success) throw new Error(res?.error || '保存失败');
      createdPatient = normalizePatient({ ...newPatient, id: res.patientId });
      setSelectedPatient(createdPatient);
      setPatients((prev) => {
        const exists = prev.some((p) => p.id === createdPatient.id);
        return exists ? prev.map((p) => (p.id === createdPatient.id ? createdPatient : p)) : [...prev, createdPatient];
      });

      // Best-effort refresh from DB (don't block navigation on this)
      try {
        const listRes = await api('/api/patients');
        const list = Array.isArray(listRes?.items) ? listRes.items : [];
        setPatients(list.map(normalizePatient));
      } catch {
        // ignore
      }
    } catch (e) {
      const msg = e?.name === 'AbortError' ? '建档保存超时（45s），请稍后重试' : (e.message || '保存失败');
      showToast(msg, 'error');
      setIsSavingAdmission(false);
      return;
    }

    // 关闭弹窗并重置状态
    setShowAIModal(false);
    setAiStep(0);
    setAiResult(null);
    setUploadedImage(null);
    setUploadedFilesMeta({ count: 0, names: [] });
    setOcrText('');
    setOcrProgress(0);

    // 显示成功提示
    showToast(`患者「${newPatient.name}」建档成功！`);

    // 产品需求：新建档案后默认回到首页（便于继续处理其他患者/查看科室列表）
    if (createdPatient) setCurrentPage('home');
    setIsSavingAdmission(false);
  };

  // 删除患者
  const deletePatient = (patientId) => {
    if (!window.confirm('确定要删除此患者档案吗？此操作不可恢复。')) return;
    (async () => {
      try {
        await api(`/api/patients/${patientId}`, { method: 'DELETE' });
        const listRes = await api('/api/patients');
        const list = Array.isArray(listRes?.items) ? listRes.items : [];
        setPatients(list.map(normalizePatient));
        if (selectedPatient?.id === patientId) {
          setSelectedPatient(null);
          goBack();
        }
        showToast('患者档案已删除');
      } catch (e) {
        showToast(e.message || '删除失败', 'error');
      }
    })();
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
          {showLogo && (
            <img
              src="/logo1.png"
              alt="医院 Logo"
              className="flex-shrink-0"
              style={{ height: 36, width: 'auto' }}
              onError={(e) => {
                // Fallback to the bundled SVG if logo1.png isn't deployed yet.
                if (e.currentTarget.dataset.fallback === '1') {
                  // Both missing: hide to avoid broken-image icon.
                  e.currentTarget.style.display = 'none';
                  return;
                }
                e.currentTarget.dataset.fallback = '1';
                e.currentTarget.src = '/hospital-logo.svg';
              }}
            />
          )}
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
        <NavItem icon={<Home size={22} />} label="首页" active={currentPage === 'home'} onClick={() => navigateTo('home')} />
        <NavItem icon={<Calendar size={22} />} label="排班" active={currentPage === 'schedule'} onClick={() => navigateTo('schedule')} />

        {/* 中间悬浮按钮 - 渐变设计 */}
        {userRole === 'therapist' && (
          <div className="relative -mt-6">
            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 ${
                showFabMenu
                  ? 'bg-slate-800 rotate-45'
                  : 'bg-gradient-to-br from-brand-pink-500 to-brand-pink-600'
              }`}
              style={{ boxShadow: '0 8px 24px -4px rgba(232, 76, 136, 0.35)' }}
            >
              <Plus size={26} className="text-white" />
            </button>

            {/* FAB菜单 - 毛玻璃卡片 */}
            {showFabMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 min-w-[200px] border border-gray-100">
                <FabMenuItem icon={<Sparkles size={20} />} label="AI智能收治" color="text-brand-pink-500" onClick={() => { setShowAIModal(true); setShowFabMenu(false); }} />
                <FabMenuItem icon={<Zap size={20} />} label="批量生成日报" color="text-brand-gold-600" onClick={() => { initBatchGenerate(); setShowFabMenu(false); }} />
                <FabMenuItem icon={<BookOpen size={20} />} label="治疗模板库" color="text-brand-blue-500" onClick={() => { setShowTemplates(true); setShowFabMenu(false); }} />
                <FabMenuItem
                  icon={<ClipboardList size={20} />}
                  label="快速录入"
                  color="text-emerald-500"
                  onClick={() => {
                    setShowFabMenu(false);
                    if (currentPage !== 'patientDetail' || !selectedPatient?.id) {
                      showToast('请先进入患者详情页再快速录入', 'error');
                      return;
                    }
                    setShowQuickEntry(true);
                  }}
                />
              </div>
            )}
          </div>
        )}
        {userRole === 'doctor' && <div className="w-14" />}

        <NavItem icon={<MessageSquare size={22} />} label="沟通" active={currentPage === 'messages'} onClick={() => navigateTo('messages')} badge={2} />
        <NavItem icon={<User size={22} />} label="我的" active={currentPage === 'profile'} onClick={() => navigateTo('profile')} />
      </div>
    </div>
  );

  const NavItem = ({ icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
        active ? 'text-brand-pink-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-brand-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${active ? 'text-brand-pink-500' : ''}`}>{label}</span>
    </button>
  );

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
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-pink-50/30 pb-24">
      <Header
        title="南京儿童医院"
        showLogo
        rightAction={
          userRole === 'therapist' && (
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-brand-pink-500 to-brand-pink-600 text-white px-3.5 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
              style={{ boxShadow: '0 4px 14px -2px rgba(232, 76, 136, 0.35)' }}
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
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-pink-500/10 rounded-full -ml-8 -mb-8" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                {isSharedVisitor ? '👨‍⚕️' : '👨‍⚕️'}
              </div>
              <div>
                {isSharedVisitor ? (
                  <>
                    <h2 className="font-semibold text-white text-lg">{sharedDeptName}医生视角</h2>
                    <p className="text-white/70 text-sm">仅可查看该分享链接对应科室</p>
                  </>
                ) : (
                  <>
                    <h2 className="font-semibold text-white text-lg">吴大勇 {userRole === 'therapist' ? '' : '（医生视角）'}</h2>
                    <p className="text-white/70 text-sm">康复医学科 · 主管治疗师</p>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{visiblePatients.filter(p => p.status === 'active' && !p.todayTreated).length}</p>
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
            <div className="w-10 h-10 bg-brand-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users size={20} className="text-brand-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{visiblePatients.filter(p => p.status === 'active').length}</div>
            <div className="text-xs text-slate-500 mt-0.5">在治患儿</div>
          </button>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{visiblePatients.filter(p => p.todayTreated).length}</div>
            <div className="text-xs text-slate-500 mt-0.5">今日已治疗</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-brand-gold-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock size={20} className="text-brand-gold-600" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{visiblePatients.filter(p => p.status === 'active' && !p.todayTreated).length}</div>
            <div className="text-xs text-slate-500 mt-0.5">待治疗</div>
          </div>
        </div>
      </div>

      {/* 最近建档患者 */}
      {!isSharedVisitor && visiblePatients.filter(p => p.status === 'active').slice(-3).reverse().length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-brand-pink-500 rounded-full" />
            最近建档
          </h3>
          <div className="space-y-2.5">
            {visiblePatients.filter(p => p.status === 'active').slice(-3).reverse().map(patient => (
              <button
                key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setCurrentPage('patientDetail');
                  setDetailTab('today');
                }}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-pink-100 transition-all duration-200 active:scale-[0.99]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-pink-100 to-brand-pink-50 rounded-xl flex items-center justify-center text-xl">
                  {patient.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{patient.name}</span>
                    <span className="text-xs text-slate-400">{patient.age}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{patient.bedNo}</span>
                  </div>
                  <p className="text-sm text-brand-blue-600 mt-0.5">{patient.diagnosis}</p>
                </div>
                <div className="flex items-center gap-2">
                  {patient.safetyAlerts.length > 0 && (
                    <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle size={14} className="text-red-500" />
                    </div>
                  )}
                  {!patient.todayTreated && (
                    <span className="text-xs bg-brand-gold-50 text-brand-gold-700 px-2 py-1 rounded-lg font-medium">待治疗</span>
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
          <div className="w-1 h-4 bg-brand-blue-500 rounded-full" />
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
                  className="flex-1 bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-blue-100 transition-all duration-200 active:scale-[0.99]"
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
                      <span className="bg-brand-gold-50 text-brand-gold-700 text-xs px-2.5 py-1 rounded-lg font-medium">
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
                    className="w-12 h-12 bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 rounded-xl flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
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
            <div className="w-1 h-4 bg-brand-gold-600 rounded-full" />
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

  const PatientCard = ({ patient, onClick }) => (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-pink-100 transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-pink-100 to-brand-pink-50 rounded-xl flex items-center justify-center text-2xl">
          {patient.avatar}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800">{patient.name}</h4>
            <span className="text-xs text-slate-400">{patient.age} · {patient.gender}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">{patient.bedNo}</span>
          </div>
          <p className="text-sm text-brand-blue-600 mb-2">{patient.diagnosis}</p>

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
              <span className="flex items-center gap-1 text-xs bg-brand-gold-50 text-brand-gold-700 px-2 py-0.5 rounded-lg font-medium">
                <Clock size={10} />
                待治疗
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-300 mt-2" />
      </div>
    </button>
  );

  // 患儿详情页 - Apple风格
  const PatientDetailPage = () => {
    const patient = selectedPatient;
    if (!patient) return null;
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
        <Header
          title="患儿详情"
          showBack
          rightAction={
            userRole === 'therapist' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (isExportingPdf) return;
                    setIsExportingPdf(true);
                    await exportFormalReportPdf(patient);
                    setIsExportingPdf(false);
                  }}
                  disabled={isExportingPdf}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  title="导出正式治疗记录（A4黑白）"
                >
                  {isExportingPdf ? <Loader2 size={20} className="text-slate-600 animate-spin" /> : <Printer size={20} className="text-slate-600" />}
                </button>
                <button
                  onClick={() => copyText(buildDoctorPlanText(patient))}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  title="复制方案（给医生）"
                >
                  <Share2 size={20} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200">
                  <Edit3 size={20} className="text-slate-600" />
                </button>
              </div>
            )
          }
        />

        {/* 安全警示横幅 */}
        {patient.safetyAlerts.length > 0 && (
          <div className="mx-4 mt-2 bg-gradient-to-r from-red-500 to-brand-pink-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {patient.safetyAlerts.join(' · ')}
            </span>
          </div>
        )}

        <div className="px-4 py-4">
          {/* 基础信息卡片 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-pink-100 to-brand-pink-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                {patient.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                  <span className="text-sm text-slate-500">{patient.age} · {patient.gender}</span>
                </div>
                <p className="text-sm text-slate-500 mb-1">床号：{patient.bedNo} · {patient.department}</p>
                <p className="text-brand-blue-600 font-medium">{patient.diagnosis}</p>
              </div>
            </div>

            {/* GAS目标进度 */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-brand-pink-500" />
                  GAS目标达成度
                </h4>
                <span className="text-lg font-bold text-brand-pink-500">{patient.gasScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
                <div
                  className="bg-gradient-to-r from-brand-pink-200 to-brand-pink-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${patient.gasScore}%` }}
                />
              </div>
              <div className="space-y-2.5">
                {patient.gasGoals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 w-20 font-medium">{goal.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-brand-blue-200 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-500 w-14 text-right font-medium">{goal.current}/{goal.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 家庭作业 */}
          {patient.homework.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-brand-gold-600" />
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
              {/* 病历附件（多图） */}
              {(patient.caseId || patient.medicalRecordImage) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">病历附件</span>
                    {patient.caseId && (
                      <span className="text-xs text-slate-500">
                        {caseAttachments.loading ? '加载中…' : `共 ${(caseAttachments.caseId === Number(patient.caseId) ? caseAttachments.items.length : 0) || 0} 张`}
                      </span>
                    )}
                    {!patient.caseId && patient.medicalRecordImage && (
                      <span className="text-xs text-slate-500">共 1 张</span>
                    )}
                    {caseAttachments.error && (
                      <span className="ml-auto text-xs text-red-600">{caseAttachments.error}</span>
                    )}
                  </div>

                  {patient.caseId && caseAttachments.caseId === Number(patient.caseId) && caseAttachments.items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {caseAttachments.items.slice(0, 2).map((f) => (
                        <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={f.url}
                            alt="病历"
                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  ) : patient.medicalRecordImage ? (
                    <a href={patient.medicalRecordImage} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={patient.medicalRecordImage}
                        alt="病历"
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-500">暂无附件</p>
                  )}
                </div>
              )}

              {/* 个性化重点 */}
              {patient.treatmentPlan.highlights.length > 0 && (
                <div className="bg-gradient-to-r from-brand-gold-50 to-orange-50 border border-brand-gold-200 rounded-xl p-3 mb-4">
                  <h5 className="text-sm font-medium text-brand-gold-700 flex items-center gap-2 mb-2">
                    <Star size={16} className="text-brand-gold-600" />
                    今日个性化重点
                  </h5>
                  {patient.treatmentPlan.highlights.map((h, i) => (
                    <p key={i} className="text-sm text-slate-800">{h}</p>
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

              {/* 家属宣教 */}
              {Array.isArray(patient.treatmentPlan.familyEducation) && patient.treatmentPlan.familyEducation.length > 0 && (
                <div className="bg-brand-blue-50 border border-brand-blue-100 rounded-xl p-3 mb-4">
                  <h5 className="text-sm font-medium text-brand-blue-700 flex items-center gap-2 mb-2">
                    <Info size={16} />
                    家属宣教
                  </h5>
                  <ul className="text-sm text-brand-blue-700 space-y-1">
                    {patient.treatmentPlan.familyEducation.map((p, i) => (
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
                        <p className="text-xs text-gray-500 whitespace-pre-wrap">{item.note}</p>
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
                      className="mt-3 bg-brand-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-brand-blue-600 transition"
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
                    setSessionDraft({
                      patientId: patient.id,
                      tolerance: '良好',
                      cooperation: '良好',
                      extra: '',
                    });
                    setShowCompleteSession(true);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-brand-blue-700 to-brand-blue-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
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
                        <div className="absolute left-2.5 top-1 w-3 h-3 bg-brand-blue-500 rounded-full border-2 border-white" />

                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">{log.date}</span>
                            <span className="text-xs text-gray-500">{log.therapist}</span>
                          </div>

                          {/* 亮点标注 */}
                          <div className="bg-brand-gold-50 border border-brand-gold-200 rounded-lg p-2 mb-2">
                            <p className="text-sm text-slate-800 flex items-center gap-1">
                              <Star size={14} className="text-brand-gold-600" />
                              {log.highlight}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.items.map((item, j) => (
                              <span key={j} className="text-xs bg-brand-blue-100 text-brand-blue-700 px-2 py-0.5 rounded-full">
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

  // 排班页面
  const SchedulePage = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="今日排班" />

      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">2026年1月11日 周六</h3>
            <span className="text-sm text-brand-blue-600">{scheduleData.filter(s => s.type === 'treatment').length} 项治疗</span>
          </div>

          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {scheduleData.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-sm text-gray-500 w-12 pt-2">{item.time}</span>
                  <div className={`flex-1 p-3 rounded-xl border ${
                    item.type === 'treatment' ? 'bg-brand-blue-50 border-brand-blue-200' :
                    item.type === 'meeting' ? 'bg-brand-blue-50 border-brand-blue-200' :
                    item.type === 'consultation' ? 'bg-purple-50 border-purple-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'treatment' && <Stethoscope size={16} className="text-brand-blue-600" />}
                      {item.type === 'meeting' && <Users size={16} className="text-brand-blue-600" />}
                      {item.type === 'consultation' && <MessageSquare size={16} className="text-purple-600" />}
                      {item.type === 'break' && <Coffee size={16} className="text-gray-500" />}
                      <span className="font-medium text-gray-800">{item.title}</span>
                    </div>
                    {item.location && (
                      <p className="text-xs text-gray-500">{item.location}</p>
                    )}
                    {item.patients && (
                      <p className="text-xs text-brand-blue-600 mt-1">{item.patients} 位患儿</p>
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
            <div key={msg.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${msg.unread ? 'border-brand-blue-200' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  msg.type === 'alert' ? 'bg-red-100' :
                  msg.type === 'system' ? 'bg-gray-100' : 'bg-brand-blue-100'
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
                        <span className="w-2 h-2 bg-brand-blue-500 rounded-full" />
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
        <div className="bg-gradient-to-r from-brand-blue-700 to-brand-blue-500 rounded-2xl p-5 text-white shadow-lg mb-4">
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
                  ? 'border-brand-blue-600 bg-brand-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Edit3 size={24} className={userRole === 'therapist' ? 'text-brand-blue-600 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'} />
              <p className={`text-sm font-medium ${userRole === 'therapist' ? 'text-brand-blue-700' : 'text-gray-600'}`}>
                治疗师
              </p>
              <p className="text-xs text-gray-500">可编辑管理</p>
            </button>
            <button
              onClick={() => setUserRole('doctor')}
              className={`p-3 rounded-xl border-2 transition ${
                userRole === 'doctor'
                  ? 'border-brand-blue-500 bg-brand-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Eye size={24} className={userRole === 'doctor' ? 'text-brand-blue-500 mx-auto mb-1' : 'text-gray-400 mx-auto mb-1'} />
              <p className={`text-sm font-medium ${userRole === 'doctor' ? 'text-brand-blue-700' : 'text-gray-600'}`}>
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
              <p className="text-2xl font-bold text-brand-blue-600">156</p>
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
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={() => {
          // Prevent accidental close while processing/saving (stability).
          if (isOcrProcessing || isSavingAdmission) return;
          setShowAIModal(false);
          setAiStep(0);
          setAiResult(null);
          setUploadedImage(null);
          setUploadedFilesMeta({ count: 0, names: [] });
          setOcrText('');
          setOcrProgress(0);
        }}
      >
        <div
          className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="text-brand-pink-500" size={20} />
              AI智能建档
            </h3>
            <button
              onClick={() => {
                if (isOcrProcessing || isSavingAdmission) return;
                setShowAIModal(false);
                setAiStep(0);
                setAiResult(null);
                setUploadedImage(null);
                setUploadedFilesMeta({ count: 0, names: [] });
                setOcrText('');
                setOcrProgress(0);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {/* 步骤0：上传病历图片 */}
            {aiStep === 0 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-brand-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={36} className="text-brand-pink-500" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">上传病历资料</h4>
                <p className="text-sm text-slate-500 mb-6">上传病历图片，AI将自动识别并提取患者信息</p>

                <input
                  type="file"
                  id="medical-record-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isOcrProcessing || isSavingAdmission}
                  className="hidden"
                />

                <label
                  htmlFor="medical-record-upload"
                  className={`block border-2 border-dashed border-slate-300 rounded-2xl p-8 mb-4 hover:border-brand-pink-500 hover:bg-brand-pink-50/50 transition-all cursor-pointer ${
                    isOcrProcessing || isSavingAdmission ? 'opacity-60 pointer-events-none' : ''
                  }`}
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
                    <Loader2 size={32} className="text-brand-blue-500 animate-spin" />
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-800 mb-2">AI识别中...</h4>
                <p className="text-sm text-slate-500 mb-4">通义千问3-VL-Plus 正在识别病例图片，预计 1-2 分钟</p>
                {uploadedFilesMeta.count > 1 && (
                  <p className="text-xs text-slate-400 mb-4">已上传 {uploadedFilesMeta.count} 张图片（AI 将综合分析）</p>
                )}

                {/* 进度条 */}
                <div className="max-w-xs mx-auto">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 h-2.5 rounded-full transition-all duration-300"
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
                {(() => {
                  const requiredAiFields = ['name', 'age', 'bedNo', 'diagnosis'];
                  const missingAi = requiredAiFields.filter((k) => !aiResult?.aiFilled?.[k]);
                  return missingAi.length ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={16} className="text-red-600" />
                        <span className="text-sm font-medium text-red-700">关键字段未完整识别</span>
                      </div>
                      <p className="text-xs text-red-700">
                        缺失：{
                          missingAi
                            .map((k) => ({ name: '姓名', age: '年龄/出生日期', bedNo: '床号', diagnosis: '诊断' }[k] || k))
                            .join('、')
                        }。为保证准确性，本系统不允许手动补齐关键字段；请点击“重新上传”，上传包含关键信息的清晰截图。
                      </p>
                    </div>
                  ) : null;
                })()}

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">AI识别完成</span>
                  </div>
                  <p className="text-xs text-emerald-600">已自动填充信息并生成康复目标/训练方案，请核对后确认建档。</p>
                </div>

                {(aiResult.extractedMeta?.missingFields?.length > 0 || aiResult.extractedMeta?.keyFindings?.length > 0) && (
                  <div className="bg-brand-gold-50 border border-brand-gold-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={16} className="text-brand-gold-700" />
                      <span className="text-sm font-medium text-slate-800">识别摘要</span>
                    </div>
                    {aiResult.extractedMeta?.missingFields?.length > 0 && (
                      <p className="text-xs text-brand-gold-700">
                        未识别字段：{aiResult.extractedMeta.missingFields.join('、')}（为保证准确性，请重新上传包含关键信息的清晰截图）
                      </p>
                    )}
                    {aiResult.extractedMeta?.keyFindings?.length > 0 && (
                      <ul className="text-xs text-brand-gold-700 mt-2 space-y-1">
                        {aiResult.extractedMeta.keyFindings.slice(0, 6).map((t, i) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 病历图片预览 */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={16} className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">病历附件</span>
                    {uploadedFilesMeta.count > 1 && (
                      <span className="text-xs text-slate-500">共 {uploadedFilesMeta.count} 张</span>
                    )}
                    <button
                      onClick={() => { setAiStep(0); setUploadedImage(null); setUploadedFilesMeta({ count: 0, names: [] }); setAiResult(null); setOcrText(''); }}
                      className="ml-auto text-xs text-brand-pink-500 hover:text-brand-pink-600"
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
                    <User size={16} className="text-brand-blue-500" />
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
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">年龄 *</label>
                      <input
                        type="text"
                        value={aiResult.age}
                        onChange={(e) => updateFormField('age', e.target.value)}
                        placeholder="如：5岁3个月"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">性别 *</label>
                      <select
                        value={aiResult.gender}
                        onChange={(e) => updateFormField('gender', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none"
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
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">所属科室 *</label>
                      <select
                        value={aiResult.department}
                        onChange={(e) => updateFormField('department', e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none"
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
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none resize-none"
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
                  <p className="text-xs text-slate-500 mb-2">说明：下方“快捷添加”是常用标签，不代表 AI 已识别。</p>
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
                  {(aiResult.extractedMeta?.contraindications?.length > 0 || aiResult.extractedMeta?.monitoring?.length > 0) && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-3">
                      {aiResult.extractedMeta?.contraindications?.length > 0 && (
                        <p className="text-xs text-slate-600">
                          禁忌：{aiResult.extractedMeta.contraindications.slice(0, 6).join('、')}
                        </p>
                      )}
                      {aiResult.extractedMeta?.monitoring?.length > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          监测：{aiResult.extractedMeta.monitoring.slice(0, 6).join('、')}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAlertInput}
                      onChange={(e) => setNewAlertInput(e.target.value)}
                      placeholder="添加安全提醒，如：防跌倒"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none"
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
                        快捷添加：{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 康复目标 GAS */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Target size={16} className="text-brand-gold-600" />
                      康复目标 (GAS)
                    </h5>
                    <button
                      onClick={addGasGoal}
                      className="text-xs text-brand-blue-600 hover:text-brand-blue-700 font-medium"
                    >
                      + 添加目标
                    </button>
                  </div>
                  <div className="space-y-2">
                    {aiResult.gasGoals.map((goal, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                        <input
                          type="text"
                          value={goal.name}
                          onChange={(e) => updateGasGoal(i, 'name', e.target.value)}
                          placeholder="目标名称"
                          className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">当前</span>
                          <input
                            type="number"
                            value={goal.current}
                            onChange={(e) => updateGasGoal(i, 'current', parseInt(e.target.value) || 0)}
                            className="w-14 border border-slate-200 rounded px-2 py-1 text-sm text-center"
                          />
                          <span className="text-xs text-slate-500">/</span>
                          <input
                            type="number"
                            value={goal.target}
                            onChange={(e) => updateGasGoal(i, 'target', parseInt(e.target.value) || 100)}
                            className="w-14 border border-slate-200 rounded px-2 py-1 text-sm text-center"
                          />
                        </div>
                        <button
                          onClick={() => removeGasGoal(i)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                      className="text-xs text-brand-blue-600 hover:text-brand-blue-700 font-medium"
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
                      placeholder="治疗重点，如：改善呼吸功能，增强运动耐力"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 outline-none"
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
                    onClick={() => { setAiStep(0); setAiResult(null); setUploadedImage(null); setUploadedFilesMeta({ count: 0, names: [] }); setOcrText(''); setOcrProgress(0); }}
                    disabled={isOcrProcessing || isSavingAdmission}
                    className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isOcrProcessing || isSavingAdmission}
                    className="flex-1 bg-gradient-to-r from-brand-blue-700 to-brand-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ boxShadow: '0 4px 14px -2px rgba(30, 58, 95, 0.35)' }}
                  >
                    <Sparkles size={20} />
                    重新生成方案
                  </button>
                  <button
                    onClick={confirmAdmission}
                    disabled={
                      isOcrProcessing ||
                      isSavingAdmission ||
                      ['name', 'age', 'bedNo', 'diagnosis'].some((k) => !aiResult?.aiFilled?.[k])
                    }
                    className="flex-1 bg-gradient-to-r from-brand-pink-500 to-brand-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ boxShadow: '0 4px 14px -2px rgba(232, 76, 136, 0.35)' }}
                  >
                    {isSavingAdmission ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                    {isSavingAdmission ? '建档中...' : '确认建档'}
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
                    ? 'bg-brand-blue-500 text-white'
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
              <div className="w-12 h-12 bg-brand-blue-100 rounded-full flex items-center justify-center text-2xl">
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
                      <span key={i} className="bg-brand-blue-100 text-brand-blue-700 text-sm px-3 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>

                {/* 个性化亮点 */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Star size={16} className="text-brand-gold-600" />
                    今日亮点（可编辑）
                  </h5>
                  <textarea
                    value={editingRecord?.highlight || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, highlight: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                    rows={2}
                  />
                </div>

                {/* 备注 */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">治疗备注</h5>
                  <textarea
                    value={editingRecord?.notes || ''}
                    onChange={e => setEditingRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                    rows={2}
                  />
                </div>

                <button
                  onClick={() => confirmBatchItem(currentBatchIndex, editingRecord)}
                  className="w-full bg-gradient-to-r from-brand-blue-700 to-brand-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
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
            <BookOpen className="text-brand-blue-500" size={20} />
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
    const [isQuickEntrySaving, setIsQuickEntrySaving] = useState(false);

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
              <div className="bg-brand-blue-50 rounded-xl p-3 mb-4">
                <h5 className="text-sm font-medium text-brand-blue-700 mb-2">已选择 ({selectedItems.length})</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item, i) => (
                    <span key={i} className="bg-brand-blue-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
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
                            ? 'bg-brand-blue-500 text-white'
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
              disabled={selectedItems.length === 0 || isQuickEntrySaving}
              className="w-full bg-gradient-to-r from-brand-blue-700 to-brand-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              onClick={async () => {
                if (isQuickEntrySaving) return;
                if (!selectedPatient?.id) {
                  showToast('请先进入患者详情页再快速录入', 'error');
                  return;
                }
                const existing = Array.isArray(selectedPatient.treatmentPlan?.items) ? selectedPatient.treatmentPlan.items : [];
                const existingNames = new Set(existing.map((i) => i.name));
                const toAdd = selectedItems
                  .filter((it) => it?.name && !existingNames.has(it.name))
                  .map((it, idx) => ({
                    id: Date.now() + idx,
                    name: it.name,
                    icon: it.icon || '🎯',
                    duration: it.duration || '',
                    completed: false,
                    note: '',
                  }));

                if (toAdd.length === 0) {
                  showToast('所选项目已在今日训练清单中', 'error');
                  return;
                }

                const updated = normalizePatient({
                  ...selectedPatient,
                  treatmentPlan: {
                    ...selectedPatient.treatmentPlan,
                    focus: selectedPatient.treatmentPlan?.focus || '康复训练',
                    items: [...existing, ...toAdd],
                  },
                });

                setIsQuickEntrySaving(true);
                try {
                  await api(`/api/patients/${selectedPatient.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patient: updated }),
                  });
                  setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updated : p)));
                  setSelectedPatient(updated);
                  setShowQuickEntry(false);
                  showToast(`已添加 ${toAdd.length} 项治疗项目`, 'success');
                } catch (e) {
                  showToast(e.message || '保存失败', 'error');
                } finally {
                  setIsQuickEntrySaving(false);
                }
              }}
            >
              确认添加 ({selectedItems.length} 项)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 完成今日治疗弹窗（计划→执行→记录闭环）
  const CompleteSessionModal = () => {
    if (!showCompleteSession || !sessionDraft?.patientId) return null;
    const patient = patients.find((p) => p.id === sessionDraft.patientId) || selectedPatient;
    if (!patient) return null;

    const completedItems = (patient.treatmentPlan?.items || []).filter((i) => i.completed);
    const completedNames = completedItems.map((i) => i.name).filter(Boolean);

    const highlight = patient.treatmentPlan?.highlights?.[0] || patient.treatmentPlan?.focus || '常规训练';
    const date = toLocalIsoDate();

    const autoNote = (() => {
      const lines = [];
      lines.push(`今日康复训练记录（${date}）`);
      lines.push(`训练重点：${patient.treatmentPlan?.focus || '康复训练'}`);
      if (completedNames.length) lines.push(`完成项目：${completedNames.join('、')}`);
      lines.push(`配合度：${sessionDraft.cooperation}；耐受：${sessionDraft.tolerance}`);
      if (Array.isArray(patient.safetyAlerts) && patient.safetyAlerts.length) {
        lines.push(`安全提醒：${patient.safetyAlerts.slice(0, 6).join('；')}`);
      }
      if (sessionDraft.extra?.trim()) lines.push(`补充：${sessionDraft.extra.trim()}`);
      return lines.join('\n');
    })();

    const canConfirm = completedNames.length > 0;

    const pill = (value, current, onClick) => (
      <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1 rounded-full text-sm border transition ${
          current === value ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
        }`}
      >
        {value}
      </button>
    );

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowCompleteSession(false)}>
        <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              完成今日治疗
            </h3>
            <button onClick={() => setShowCompleteSession(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-sm text-slate-700 font-medium">{patient.name} · {patient.bedNo} · {patient.department}</p>
              <p className="text-xs text-slate-500 mt-1">重点：{highlight}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-3">已完成项目</h5>
              {completedNames.length ? (
                <div className="flex flex-wrap gap-2">
                  {completedNames.map((n) => (
                    <span key={n} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-red-600">请先在“治疗项目”里勾选已完成的训练项目。</p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-3">训练反应</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">配合度</p>
                  <div className="flex gap-2 flex-wrap">
                    {pill('良好', sessionDraft.cooperation, () => setSessionDraft((s) => ({ ...s, cooperation: '良好' })))}
                    {pill('一般', sessionDraft.cooperation, () => setSessionDraft((s) => ({ ...s, cooperation: '一般' })))}
                    {pill('欠佳', sessionDraft.cooperation, () => setSessionDraft((s) => ({ ...s, cooperation: '欠佳' })))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">耐受情况</p>
                  <div className="flex gap-2 flex-wrap">
                    {pill('良好', sessionDraft.tolerance, () => setSessionDraft((s) => ({ ...s, tolerance: '良好' })))}
                    {pill('一般', sessionDraft.tolerance, () => setSessionDraft((s) => ({ ...s, tolerance: '一般' })))}
                    {pill('欠佳', sessionDraft.tolerance, () => setSessionDraft((s) => ({ ...s, tolerance: '欠佳' })))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">补充说明（可选）</p>
                  <textarea
                    value={sessionDraft.extra}
                    onChange={(e) => setSessionDraft((s) => ({ ...s, extra: e.target.value }))}
                    rows={3}
                    placeholder="如：训练中轻度气促，休息后缓解；血氧稳定…"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-pink-500 focus:ring-2 focus:ring-brand-pink-100 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-slate-700">自动生成记录预览</h5>
                <button
                  type="button"
                  onClick={() => copyText(autoNote)}
                  className="text-xs text-brand-blue-600 hover:text-brand-blue-700 font-medium"
                >
                  复制文本
                </button>
              </div>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-100">{autoNote}</pre>
            </div>

            <button
              disabled={!canConfirm}
              className="w-full bg-gradient-to-r from-brand-blue-700 to-brand-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (!canConfirm) return;
                const newLog = {
                  date,
                  items: completedNames,
                  highlight,
                  notes: autoNote,
                  therapist: '吴大勇',
                };
                const resetItems = (patient.treatmentPlan?.items || []).map((i) => ({ ...i, completed: false }));
                const updated = normalizePatient({
                  ...patient,
                  todayTreated: true,
                  treatmentPlan: { ...patient.treatmentPlan, items: resetItems },
                  treatmentLogs: [newLog, ...(patient.treatmentLogs || [])],
                });
                setPatients((prev) => prev.map((p) => (p.id === patient.id ? updated : p)));
                setSelectedPatient(updated);
                setShowCompleteSession(false);
                setSessionDraft(null);
                (async () => {
                  try {
                    await api(`/api/patients/${patient.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ patient: updated }),
                    });
                    showToast('今日治疗记录已生成', 'success');
                  } catch (e) {
                    showToast(e.message || '保存失败', 'error');
                  }
                })();
              }}
            >
              生成并保存今日记录
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
      {showCompleteSession && <CompleteSessionModal />}

      {/* 全部患者弹窗 */}
      {showAllPatients && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowAllPatients(false)}>
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">全部患者 ({visiblePatients.length})</h3>
              <button onClick={() => setShowAllPatients(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {visiblePatients.filter(p => p.status === 'active').map(patient => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setShowAllPatients(false);
                    setSelectedPatient(patient);
                    setCurrentPage('patientDetail');
                    setDetailTab('today');
                  }}
                  className="w-full bg-gray-50 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-brand-blue-100 rounded-full flex items-center justify-center text-xl">
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
