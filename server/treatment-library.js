/**
 * 治疗项目库和模板系统
 * 根据诊断、年龄、状态智能推荐治疗方案
 */

// 治疗项目库 - 按类别组织
const treatmentLibrary = {
  // 被动训练（适合昏迷、意识障碍、配合度差的患儿）
  passive: [
    {
      id: 'passive_rom',
      name: '被动关节活动度训练',
      icon: '🤲',
      duration: '15分钟',
      category: 'passive',
      适用状态: ['昏迷', '意识障碍', '配合度差', '疲劳'],
      禁忌: ['急性期', '骨折未愈合', '关节脱位'],
      note: '频次：每日2次\n强度：轻柔、无痛范围\n步骤：从远端至近端依次进行肩、肘、腕、髋、膝、踝关节的被动屈伸和旋转；每个关节重复5-8次，动作缓慢平稳\n监测：观察患儿面部表情及肢体抵抗程度\n停止：患儿出现明显疼痛或抗拒'
    },
    {
      id: 'passive_positioning',
      name: '体位管理与摆放',
      icon: '🛏️',
      duration: '持续',
      category: 'passive',
      适用状态: ['昏迷', '意识障碍', '长期卧床'],
      禁忌: ['不稳定骨折', '颅内压增高'],
      note: '频次：每2小时翻身一次\n体位：仰卧位、侧卧位交替，避免压疮\n要点：保持关节功能位，使用软枕支撑\n监测：皮肤完整性、呼吸状况'
    },
    {
      id: 'passive_chest_pt',
      name: '被动胸部物理治疗',
      icon: '🫁',
      duration: '10分钟',
      category: 'passive',
      适用状态: ['昏迷', '意识障碍', '呼吸困难'],
      禁忌: ['气胸', '肋骨骨折', '严重心衰'],
      note: '频次：每日3-4次\n手法：叩击、震颤、体位引流\n体位：根据痰液部位选择引流体位\n监测：血氧饱和度、呼吸频率\n停止：血氧<90%、呼吸窘迫'
    },
    {
      id: 'passive_sensory',
      name: '感觉刺激（触觉、听觉）',
      icon: '👂',
      duration: '10分钟',
      category: 'passive',
      适用状态: ['昏迷', '意识障碍'],
      禁忌: [],
      note: '频次：每日多次\n方法：轻柔触摸、播放熟悉音乐或家人声音、冷热刺激\n目的：促进意识恢复\n监测：观察患儿反应（眼动、表情变化）'
    }
  ],

  // 辅助主动训练（需要一定配合度）
  assisted: [
    {
      id: 'assisted_breathing',
      name: '辅助呼吸训练',
      icon: '🫁',
      duration: '10分钟',
      category: 'assisted',
      适用状态: ['意识清醒', '配合度一般', '呼吸功能下降'],
      禁忌: ['气胸', '严重呼吸窘迫'],
      note: '频次：每日3次\n方法：治疗师辅助腹式呼吸，手放于腹部引导\n强度：低强度，以舒适为度\n监测：血氧饱和度、呼吸频率'
    },
    {
      id: 'assisted_sitting',
      name: '辅助坐位训练',
      icon: '🪑',
      duration: '15分钟',
      category: 'assisted',
      适用状态: ['意识清醒', '配合度一般', '躯干控制差'],
      禁忌: ['脊柱不稳定', '严重低血压'],
      note: '频次：每日2次\n方法：从半卧位逐渐过渡到坐位，治疗师提供支撑\n进阶：减少支撑，增加坐位时间\n监测：血压、头晕症状'
    },
    {
      id: 'assisted_standing',
      name: '辅助站立训练',
      icon: '🧍',
      duration: '10分钟',
      category: 'assisted',
      适用状态: ['意识清醒', '配合度良好', '下肢力量弱'],
      禁忌: ['骨折未愈合', '严重骨质疏松'],
      note: '频次：每日1-2次\n方法：使用站立架或治疗师辅助，从短时间开始\n进阶：逐渐增加站立时间和减少支撑\n监测：下肢承重情况、疲劳程度'
    }
  ],

  // 主动训练（需要良好配合度）
  active: [
    {
      id: 'active_breathing',
      name: '主动呼吸训练',
      icon: '🫁',
      duration: '15分钟',
      category: 'active',
      适用状态: ['意识清醒', '配合度良好', '理解能力正常'],
      禁忌: ['严重呼吸窘迫'],
      note: '频次：每日3次\n方法：腹式呼吸、缩唇呼吸、深呼吸练习\n指导：吸气3秒，呼气5秒，配合节拍器\n监测：血氧饱和度、呼吸模式'
    },
    {
      id: 'active_exercise',
      name: '主动运动训练',
      icon: '🏃',
      duration: '20分钟',
      category: 'active',
      适用状态: ['意识清醒', '配合度良好', '运动能力尚可'],
      禁忌: ['急性期', '严重心肺功能不全'],
      note: '频次：每日1-2次\n内容：步行、爬楼梯、平衡训练\n强度：根据心率和疲劳程度调整\n监测：心率、血氧、疲劳评分'
    },
    {
      id: 'active_coordination',
      name: '精细动作协调训练',
      icon: '✋',
      duration: '15分钟',
      category: 'active',
      适用状态: ['意识清醒', '配合度良好', '手功能障碍'],
      禁忌: [],
      note: '频次：每日2次\n内容：抓握、捏取、串珠、拼图等\n进阶：从大物体到小物体，从简单到复杂\n监测：完成度、精确度'
    }
  ],

  // 游戏化训练（适合儿童，需要配合）
  playBased: [
    {
      id: 'play_breathing',
      name: '游戏呼吸训练（吹泡泡）',
      icon: '🎈',
      duration: '10分钟',
      category: 'playBased',
      适用状态: ['意识清醒', '配合度良好', '年龄<8岁'],
      禁忌: [],
      note: '频次：每日2-3次\n方法：吹泡泡、吹风车、吹蜡烛游戏\n目的：训练呼吸控制，提高趣味性\n监测：参与度、呼吸模式'
    },
    {
      id: 'play_balance',
      name: '平衡游戏训练',
      icon: '⚖️',
      duration: '15分钟',
      category: 'playBased',
      适用状态: ['意识清醒', '配合度良好', '平衡功能差'],
      禁忌: ['严重共济失调', '癫痫发作期'],
      note: '频次：每日1-2次\n内容：平衡板、独木桥、接球游戏\n进阶：从静态到动态，从简单到复杂\n监测：跌倒风险、完成度'
    },
    {
      id: 'play_sensory',
      name: '感觉统合游戏',
      icon: '🎨',
      duration: '20分钟',
      category: 'playBased',
      适用状态: ['意识清醒', '配合度良好', '感觉统合失调'],
      禁忌: [],
      note: '频次：每日1次\n内容：触觉刷、摇摆、滑梯、球池\n目的：改善感觉处理能力\n监测：情绪反应、参与度'
    }
  ],

  // 特殊技术
  special: [
    {
      id: 'special_ndt',
      name: 'NDT神经发育疗法',
      icon: '🧠',
      duration: '30分钟',
      category: 'special',
      适用状态: ['脑瘫', '运动发育迟缓'],
      禁忌: ['急性期'],
      note: '频次：每日1次\n方法：抑制异常姿势反射，促进正常运动模式\n要点：个体化设计，需专业治疗师操作'
    },
    {
      id: 'special_bobath',
      name: 'Bobath技术',
      icon: '🤸',
      duration: '30分钟',
      category: 'special',
      适用状态: ['脑瘫', '肌张力异常'],
      禁忌: ['急性期'],
      note: '频次：每日1次\n方法：通过关键点控制，促进正常运动发育\n要点：需专业培训的治疗师操作'
    }
  ]
};

// 疾病模板库
const diseaseTemplates = {
  // 脑瘫
  cerebralPalsy: {
    name: '脑瘫康复方案',
    keywords: ['脑瘫', '脑性瘫痪', 'CP'],
    baseItems: ['passive_rom', 'special_ndt', 'special_bobath'],
    状态调整: {
      昏迷: ['passive_rom', 'passive_positioning', 'passive_sensory'],
      意识障碍: ['passive_rom', 'passive_positioning', 'passive_sensory', 'passive_chest_pt'],
      配合度差: ['passive_rom', 'assisted_sitting', 'play_sensory'],
      配合度良好: ['special_ndt', 'special_bobath', 'active_coordination', 'play_balance']
    }
  },

  // 发育迟缓
  developmentalDelay: {
    name: '发育迟缓康复方案',
    keywords: ['发育迟缓', '运动发育迟缓', '全面发育迟缓'],
    baseItems: ['assisted_sitting', 'play_sensory', 'active_coordination'],
    状态调整: {
      配合度差: ['passive_rom', 'passive_sensory', 'play_sensory'],
      配合度良好: ['assisted_sitting', 'play_balance', 'play_sensory', 'active_coordination']
    }
  },

  // 呼吸系统疾病
  respiratory: {
    name: '呼吸系统疾病康复方案',
    keywords: ['肺炎', '哮喘', '支气管炎', '呼吸功能', '呼吸衰竭'],
    baseItems: ['passive_chest_pt', 'assisted_breathing', 'active_breathing'],
    状态调整: {
      昏迷: ['passive_chest_pt', 'passive_positioning'],
      意识障碍: ['passive_chest_pt', 'passive_positioning'],
      配合度差: ['passive_chest_pt', 'assisted_breathing'],
      配合度良好: ['active_breathing', 'play_breathing', 'active_exercise']
    }
  },

  // 骨科术后
  orthopedic: {
    name: '骨科术后康复方案',
    keywords: ['骨折', '术后', '骨科手术', '关节置换'],
    baseItems: ['passive_rom', 'assisted_standing', 'active_exercise'],
    状态调整: {
      急性期: ['passive_positioning'],
      配合度差: ['passive_rom', 'assisted_sitting'],
      配合度良好: ['passive_rom', 'assisted_standing', 'active_exercise']
    }
  },

  // 神经系统疾病
  neurological: {
    name: '神经系统疾病康复方案',
    keywords: ['脑炎', '脑膜炎', '癫痫', '神经', '颅脑损伤', '脑出血', '脑梗'],
    baseItems: ['passive_rom', 'passive_sensory', 'assisted_sitting'],
    状态调整: {
      昏迷: ['passive_rom', 'passive_positioning', 'passive_sensory'],
      意识障碍: ['passive_rom', 'passive_sensory', 'assisted_sitting'],
      配合度差: ['passive_rom', 'assisted_sitting', 'passive_sensory'],
      配合度良好: ['assisted_sitting', 'assisted_standing', 'active_coordination']
    }
  }
};

/**
 * 根据诊断和状态智能匹配治疗方案
 * @param {string} diagnosis - 诊断
 * @param {string} patientState - 患儿状态（昏迷/意识障碍/配合度差/配合度良好等）
 * @param {number} age - 年龄（月）
 * @returns {Array} 推荐的治疗项目列表
 */
function matchTreatmentPlan(diagnosis, patientState = '配合度良好', age = 60) {
  // 1. 匹配疾病模板
  let matchedTemplate = null;
  for (const [key, template] of Object.entries(diseaseTemplates)) {
    if (template.keywords.some(keyword => diagnosis.includes(keyword))) {
      matchedTemplate = template;
      break;
    }
  }

  // 2. 如果没有匹配到模板，使用通用方案
  if (!matchedTemplate) {
    matchedTemplate = {
      name: '通用康复方案',
      baseItems: ['passive_rom', 'assisted_sitting', 'active_exercise'],
      状态调整: {
        昏迷: ['passive_rom', 'passive_positioning', 'passive_sensory'],
        意识障碍: ['passive_rom', 'passive_sensory', 'assisted_sitting'],
        配合度差: ['passive_rom', 'assisted_sitting'],
        配合度良好: ['assisted_sitting', 'active_exercise', 'active_coordination']
      }
    };
  }

  // 3. 根据患儿状态调整方案
  let itemIds = matchedTemplate.状态调整[patientState] || matchedTemplate.baseItems;

  // 4. 根据年龄调整（<3岁优先游戏化）
  if (age < 36 && patientState === '配合度良好') {
    // 替换部分主动训练为游戏化训练
    itemIds = itemIds.map(id => {
      if (id === 'active_breathing') return 'play_breathing';
      if (id === 'active_coordination') return 'play_sensory';
      return id;
    });
  }

  // 5. 从项目库中获取完整信息
  const allItems = [
    ...treatmentLibrary.passive,
    ...treatmentLibrary.assisted,
    ...treatmentLibrary.active,
    ...treatmentLibrary.playBased,
    ...treatmentLibrary.special
  ];

  const selectedItems = itemIds
    .map(id => allItems.find(item => item.id === id))
    .filter(item => item !== undefined)
    .map((item, index) => ({
      id: Date.now() + index,
      ...item
    }));

  return selectedItems;
}

/**
 * 获取可替换的项目列表
 * @param {string} currentItemId - 当前项目ID
 * @param {string} category - 项目类别
 * @param {Array} currentPlan - 当前已选的治疗方案
 * @returns {Array} 可替换的项目列表
 */
function getAlternativeItems(currentItemId, category, currentPlan = []) {
  const allItems = [
    ...treatmentLibrary.passive,
    ...treatmentLibrary.assisted,
    ...treatmentLibrary.active,
    ...treatmentLibrary.playBased,
    ...treatmentLibrary.special
  ];

  // 获取同类别的项目
  const categoryItems = allItems.filter(item => item.category === category);

  // 排除当前项目和已在方案中的项目
  const currentItemIds = currentPlan.map(item => String(item.id));
  const alternatives = categoryItems.filter(
    item => String(item.id) !== String(currentItemId) && !currentItemIds.includes(String(item.id))
  );

  return alternatives;
}

/**
 * 获取所有项目（按类别分组）
 */
function getAllItemsByCategory() {
  return {
    passive: treatmentLibrary.passive,
    assisted: treatmentLibrary.assisted,
    active: treatmentLibrary.active,
    playBased: treatmentLibrary.playBased,
    special: treatmentLibrary.special
  };
}

module.exports = {
  treatmentLibrary,
  diseaseTemplates,
  matchTreatmentPlan,
  getAlternativeItems,
  getAllItemsByCategory
};
