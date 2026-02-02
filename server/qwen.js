function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getDashscopeBaseUrl() {
  return process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com';
}

function getModelName() {
  return process.env.QWEN_MODEL || 'qwen3-vl-plus';
}

function buildExtractPrompt() {
  return [
    '你是儿科医院康复治疗师的助手。',
    '请根据用户提供的病例图片，抽取患儿/病人的结构化资料，输出严格 JSON（不要输出 Markdown，不要输出多余文本）。',
    '首要任务：尽最大努力从图片中提取 4 个关键字段：姓名(name)、年龄(age)、床号(bedNo)、诊断(diagnosis)。这些字段通常出现在：床头卡/腕带、入院记录首页、医嘱单页眉、检查/检验单标题区域。',
    '注意：',
    '- 年龄字段可以是“X岁Y月/出生日期YYYY-MM-DD/出生年月”，只要能反映年龄信息即可；不要凭空推算。',
    '- 床号可能写作“床号/床位/Bed/床位号”，格式可能是“301-1/30101/A301-1/3床”等，原样输出即可。',
    '- 诊断可能写作“诊断/入院诊断/主要诊断”，优先取明确写出的诊断文字。',
    '必须包含字段：',
    '{',
    '  "patient": { "name": string, "gender": "男"|"女"|"未知", "age": string, "bedNo": string, "department": string, "diagnosis": string, "admissionDate": string|null },',
    '  "risks": string[],',
    '  "contraindications": string[],',
    '  "monitoring": string[],',
    '  "keyFindings": string[],',
    '  "missingFields": string[],',
    '  "confidence": { "patient": number, "diagnosis": number, "overall": number }',
    '}',
    '要求：',
    '- 识别否定语义：例如“无过敏史/否认癫痫/未见异常”不要当作风险。',
    '- 如果关键字段在图片中找不到，才填 "未知" 或 null，并把字段名放到 missingFields（例如：patient.name、patient.bedNo）。',
    '- risks/contraindications/monitoring/keyFindings 每项尽量简短、可执行。',
  ].join('\n');
}

function buildExtractPromptForMissing(missing = []) {
  const missingText = Array.isArray(missing) && missing.length ? missing.join('、') : '姓名/年龄/床号/诊断';
  return [
    '你是儿科医院康复治疗师的助手。',
    `当前解析缺失关键字段：${missingText}。请重新查看图片中最上方/患者信息卡片/摘要区域，补齐缺失字段。`,
    '只输出严格 JSON（不要 Markdown，不要多余文本）。',
    '输出格式：',
    '{ "patient": { "name": string, "gender": "男"|"女"|"未知", "age": string, "bedNo": string, "department": string, "diagnosis": string } }',
    '要求：',
    '- 只要图片里有，就必须填入；找不到才写 "未知"。',
    '- 床号可能写作“病区床号/床位/Bed/床位号”，请原样输出。',
    '- 年龄可以是“12岁/出生日期/出生年月”。',
  ].join('\n');
}

function buildPlanPrompt(profile) {
  return [
    '你是儿科医院康复治疗师的助手。',
    '基于给定的结构化患者资料，为患儿制定"今日康复训练方案"和"注意事项/禁忌/监测项"。输出严格 JSON（不要 Markdown，不要多余文本）。',
    '目标：体现治疗师的专业判断与个体化（根据诊断、年龄、主诉/关键发现、风险、禁忌、监测要求来调整）。',
    '',
    '⚠️ 重要：康复目标必须从康复治疗角度设定，而非单纯疾病治疗角度。',
    '- 错误示例（疾病角度）："控制血糖"、"减少发热次数"、"提高免疫力"',
    '- 正确示例（康复角度）："改善步态对称性"、"提高肩关节外展角度至90度"、"增强核心稳定性"、"改善精细动作协调性"',
    '- 康复目标应聚焦于：功能改善（运动、感知、认知）、能力提升（ADL、社交）、身体结构优化（关节活动度、肌力、平衡）',
    '',
    '输入资料如下（JSON）：',
    JSON.stringify(profile),
    '输出必须包含字段：',
    '{',
    '  "gasGoals": [ { "name": string, "target": number, "current": number } ],',
    '  "highlights": string[],',
    '  "focus": string,',
    '  "items": [ { "name": string, "duration": string, "frequency": string, "intensity": string, "steps": string[], "monitoring": string[], "stopCriteria": string[], "notes": string } ],',
    '  "precautions": string[],',
    '  "familyEducation": string[],',
    '  "review": { "when": string, "metrics": string[] }',
    '}',
    '要求：',
    '- gasGoals：只给 2 个目标，必须是可量化的康复功能目标（如"肘关节屈曲90度→120度"、"独立站立时间5秒→30秒"），不能是疾病指标（如血压、血糖）。',
    '- highlights：只给 2 条"今日个体化重点"（例如：为什么这样安排/重点防什么风险/要监测什么）。',
    '- items：只给 3 个训练项目；每个项目必须可执行，steps <= 4 条；monitoring <= 2 条；stopCriteria <= 2 条。',
    '- 今日训练总时长不超过 20 分钟；请在 duration 中明确写"X分钟"。',
    '- precautions：只给 2 条，必须和患者风险/禁忌/监测匹配，避免泛泛而谈。',
    '- familyEducation：只给 2 条（家属怎么配合/家庭注意事项）。',
    '- 明确监测项（如血氧/疼痛/心率/疲劳）和停止条件，不能编造无法从资料推出的检查结果；不确定则写"需复核/遵医嘱"。',
    '- 避免编造无法从资料推出的特异检查结果；不确定则写"需复核/遵医嘱"。',
  ].join('\n');
}

function buildLogPrompt(context) {
  const { patient, treatmentPlan, completedItems, previousLogs, date } = context;

  return [
    '你是儿科医院康复治疗师，正在为患儿撰写今日治疗日志。',
    '请基于患儿信息、治疗计划和历史记录，生成一份个性化的治疗日志。输出严格 JSON（不要 Markdown，不要多余文本）。',
    '',
    '⚠️ 重要要求：',
    '- 每次生成的内容必须不同，体现治疗过程的自然变化和进展',
    '- 配合度和耐受性应该有变化（优秀/良好/一般/需改进），不要总是"良好"',
    '- 观察要具体，反映患儿当天的真实状态（精神、情绪、体力等）',
    '- 如果有历史记录，要体现进步或变化趋势',
    '- 语言要专业但自然，像真实的治疗师记录',
    '',
    `患儿信息：`,
    `- 姓名：${patient.name}`,
    `- 年龄：${patient.age}`,
    `- 诊断：${patient.diagnosis}`,
    `- 入院日期：${patient.admissionDate || '未知'}`,
    '',
    `治疗计划：`,
    `- 治疗重点：${treatmentPlan.focus || '功能训练'}`,
    `- 计划项目：${treatmentPlan.items?.map(i => i.name).join('、') || '无'}`,
    `- 注意事项：${treatmentPlan.precautions?.join('；') || '无'}`,
    '',
    completedItems?.length > 0 ? `今日已完成项目：${completedItems.map(i => i.name).join('、')}` : '今日完成项目：按计划执行',
    '',
    previousLogs?.length > 0 ? `最近3次治疗记录（供参考进展）：\n${previousLogs.slice(0, 3).map(log =>
      `${log.date}: ${log.highlight || log.notes || '常规训练'}`
    ).join('\n')}` : '这是首次治疗记录',
    '',
    '输出格式：',
    '{',
    '  "highlight": string,  // 今日治疗重点/亮点，30-50字，要具体且每次不同',
    '  "items": [{ "name": string, "duration": string }],  // 实际完成的项目',
    '  "cooperation": string,  // 配合度：优秀/良好/一般/需改进（要有变化）',
    '  "tolerance": string,  // 耐受性：优秀/良好/一般/较差（要有变化）',
    '  "notes": string,  // 详细观察记录，80-150字，包括：患儿精神状态、训练表现、特殊情况、进步或问题',
    '  "safety": string  // 安全提醒或注意事项',
    '}',
    '',
    '示例（仅供参考格式，内容必须根据实际情况生成）：',
    '{',
    '  "highlight": "患儿今日精神状态佳，主动配合训练，呼吸训练时间较昨日延长3分钟",',
    '  "items": [{"name": "呼吸训练", "duration": "15分钟"}, {"name": "运动训练", "duration": "20分钟"}],',
    '  "cooperation": "优秀",',
    '  "tolerance": "良好",',
    '  "notes": "患儿今日精神饱满，情绪稳定。呼吸训练时能主动配合腹式呼吸，较前次明显进步。运动训练中步行距离达50米，血氧维持在97-99%。训练后略感疲劳但无不适主诉。家属反馈夜间睡眠质量改善。",',
    '  "safety": "继续监测血氧饱和度，如低于94%立即停止训练"',
    '}',
  ].join('\n');
}

function buildLogTemplatesPrompt(context) {
  const { patient, treatmentPlan } = context;

  return [
    '你是儿科医院康复治疗师，需要为患儿预生成5个不同的治疗日志模板。',
    '这些模板将在未来的治疗中随机使用，所以每个模板必须有明显差异。输出严格 JSON（不要 Markdown，不要多余文本）。',
    '',
    '⚠️ 重要要求：',
    '- 生成5个完全不同的日志模板',
    '- 配合度和耐受性要有变化（优秀/良好/一般/需改进）',
    '- 观察记录要具体且多样化，反映不同的治疗状态和细节',
    '- 体现治疗过程的自然变化（有进步、有波动、有稳定期）',
    '- 每个模板的训练细节要有差异（如重复次数、持续时间、患儿反应等）',
    '- 语言要专业但自然，像真实的治疗师记录',
    '',
    `患儿信息：`,
    `- 姓名：${patient.name}`,
    `- 年龄：${patient.age}`,
    `- 诊断：${patient.diagnosis}`,
    '',
    `治疗计划：`,
    `- 治疗重点：${treatmentPlan.focus || '功能训练'}`,
    `- 计划项目：${treatmentPlan.items?.map(i => i.name).join('、') || '无'}`,
    `- 注意事项：${treatmentPlan.precautions?.join('；') || '无'}`,
    '',
    '输出格式（数组包含5个模板）：',
    '[',
    '  {',
    '    "highlight": string,  // 今日治疗重点/亮点，30-50字，要体现具体的训练细节变化',
    '    "cooperation": string,  // 配合度：优秀/良好/一般/需改进',
    '    "tolerance": string,  // 耐受性：优秀/良好/一般/较差',
    '    "notes": string,  // 详细观察记录，100-180字，包括：患儿精神状态、训练表现（具体数据如重复次数、持续时间）、特殊情况、进步或问题',
    '    "safety": string  // 安全提醒或注意事项',
    '  },',
    '  ... (共5个不同的模板)',
    ']',
    '',
    '示例（仅供参考格式，实际内容必须根据患儿情况生成）：',
    '[',
    '  {',
    '    "highlight": "患儿今日精神状态佳，主动配合训练，关节活动度训练时每侧重复8次，较前次增加2次",',
    '    "cooperation": "优秀",',
    '    "tolerance": "良好",',
    '    "notes": "患儿今日精神饱满，情绪稳定。关节活动度训练时能主动配合，肩关节屈曲达120度，肘关节屈伸顺畅，每侧重复8次，较前次明显进步。呼吸肌按摩持续3分钟，患儿面部表情平静，呼吸机参数稳定。训练后略感疲劳但无不适主诉，血氧维持在97-99%。家属反馈夜间睡眠质量改善。",',
    '    "safety": "继续监测血氧饱和度，如低于94%立即停止训练"',
    '  },',
    '  {',
    '    "highlight": "患儿配合度一般，需要鼓励和引导，关节活动度训练每侧重复5次，完成基础训练项目",',
    '    "cooperation": "一般",',
    '    "tolerance": "良好",',
    '    "notes": "患儿今日情绪略显低落，训练初期配合度不高，经鼓励后逐渐投入。关节活动度训练时动作较为被动，肩关节屈曲达100度，每侧重复5次。呼吸肌按摩时偶有躁动，缩短至2分钟。训练过程中血氧稳定在95-97%，心率波动在正常范围。建议家属多给予正面鼓励，增强患儿信心。",',
    '    "safety": "注意观察患儿情绪变化，适时调整训练强度"',
    '  },',
    '  {',
    '    "highlight": "患儿今日耐受性较好，训练时间延长至22分钟，关节活动度训练每侧重复7次，呼吸肌按摩4分钟",',
    '    "cooperation": "良好",',
    '    "tolerance": "优秀",',
    '    "notes": "患儿今日状态良好，训练积极性高。关节活动度训练时主动配合，肩关节屈曲达115度，肘关节活动流畅，每侧重复7次。呼吸肌按摩延长至4分钟，患儿耐受良好，呼吸节律平稳。训练总时长22分钟，较前次延长3分钟，全程血氧维持在98-100%，未见不适。家属表示患儿食欲有所改善。",',
    '    "safety": "继续观察训练后恢复情况，如有疲劳及时休息"',
    '  }',
    ']',
  ].join('\n');
}

function buildAnalyzePrompt() {
  return [
    '你是儿科医院康复治疗师的助手。',
    '请基于用户提供的多张病例图片（可能是不同页），完成两件事：',
    '1) 抽取患儿结构化资料（profile）；2) 基于该资料生成"今日康复训练方案"（plan）。',
    '输出严格 JSON（不要 Markdown，不要多余文本）。',
    '',
    '首要任务：尽最大努力从图片中提取 4 个关键字段：姓名(name)、年龄(age)、床号(bedNo)、诊断(diagnosis)。',
    '这些字段通常出现在：床头卡/腕带、入院记录首页、医嘱单页眉、检查/检验单标题区域。',
    '',
    '输出 JSON 格式必须为：',
    '{',
    '  "profile": {',
    '    "patient": { "name": string, "gender": "男"|"女"|"未知", "age": string, "bedNo": string, "department": string, "diagnosis": string, "admissionDate": string|null },',
    '    "risks": string[],',
    '    "contraindications": string[],',
    '    "monitoring": string[],',
    '    "keyFindings": string[],',
    '    "missingFields": string[],',
    '    "confidence": { "patient": number, "diagnosis": number, "overall": number }',
    '  },',
    '  "plan": {',
    '    "gasGoals": [ { "name": string, "target": number, "current": number } ],',
    '    "highlights": string[],',
    '    "focus": string,',
    '    "items": [ { "name": string, "duration": string, "frequency": string, "intensity": string, "steps": string[], "monitoring": string[], "stopCriteria": string[], "notes": string } ],',
    '    "precautions": string[],',
    '    "familyEducation": string[],',
    '    "review": { "when": string, "metrics": string[] }|null',
    '  }',
    '}',
    '',
    '方案要求（体现个体化与专业性）：',
    '- gasGoals：只给 2 个目标，必须是可量化的康复功能目标（如"肘关节屈曲90度→120度"、"独立站立5秒→30秒"），不能是疾病指标（如血压、血糖）。',
    '- highlights：只给 2 条"今日个体化重点"（结合诊断/关键发现/风险/禁忌/监测）。',
    '- items：只给 3 个训练项目；每项必须包含详细信息：',
    '  * name: 训练项目名称（如"被动关节活动度训练（上肢）"）',
    '  * duration: 明确时长（如"5分钟/侧"、"3分钟"）',
    '  * frequency: 频次（如"每日1次"）',
    '  * intensity: 强度描述（如"轻柔、无痛范围"）',
    '  * steps: 操作步骤，4-5条，每条具体清晰（如"在护士协助下，确保患者处于安全体位。"）',
    '  * monitoring: 监测指标，2条（如"血氧饱和度变化"、"心率波动"）',
    '  * stopCriteria: 停止标准，2条（如"SpO2下降至90%以下"、"患儿出现烦躁或痛苦表情"）',
    '  * notes: 特殊备注（如"仅限上肢，下肢因肿胀明显暂不进行。"）',
    '- 今日训练总时长控制在 18-22 分钟；请在 duration 中明确写"X分钟"或"X分钟/侧"。',
    '- precautions：只给 2 条；familyEducation：只给 2 条。',
    '- 识别否定语义：例如"无过敏史/否认癫痫/未见异常"不要当作风险。',
    '- 如果关键字段在图片中找不到，才填 "未知" 或 null，并把字段名放到 profile.missingFields（例如：patient.name、patient.bedNo）。',
    '- 不要编造无法从资料推出的检查结果；不确定则写"需复核/遵医嘱"。',
  ].join('\n');
}

function buildAnalyzePromptForMissing(missing = []) {
  const missingText = Array.isArray(missing) && missing.length ? missing.join('、') : '姓名/年龄/床号/诊断';
  return [
    buildAnalyzePrompt(),
    '',
    `IMPORTANT：当前解析缺失关键字段：${missingText}。请优先查看图片上方/患者信息卡片/标题区域，补齐缺失字段；仍找不到才写"未知"。`,
  ].join('\n');
}

function extractJsonFromText(text) {
  if (!text) throw new Error('Empty model response');
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first < 0 || last < 0 || last <= first) throw new Error('Model did not return JSON');
  const jsonText = text.slice(first, last + 1);
  return JSON.parse(jsonText);
}

async function callQwenVision({ imageDataUrls, prompt, requestTag, timeoutMs }) {
  const apiKey = requiredEnv('DASHSCOPE_API_KEY');
  const model = getModelName();

  const url = `${getDashscopeBaseUrl()}/api/v1/services/aigc/multimodal-generation/generation`;
  const images = Array.isArray(imageDataUrls) ? imageDataUrls.filter(Boolean) : [];
  if (!images.length) throw new Error('No image provided');
  const maxImages = Number(process.env.MAX_AI_IMAGES || 3);
  const selected = images.slice(0, maxImages);

  const payload = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content: [...selected.map((img) => ({ image: img })), { text: prompt }],
        },
      ],
    },
    parameters: {
      result_format: 'message',
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(timeoutMs || process.env.QWEN_TIMEOUT_MS || 180000)); // 增加到3分钟
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(requestTag ? { 'X-Request-Tag': requestTag } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === 'AbortError') {
      const err = new Error('DashScope request timed out');
      err.code = 'ETIMEDOUT';
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  const rawText = await response.text();
  let rawJson = null;
  try {
    rawJson = JSON.parse(rawText);
  } catch {
    rawJson = { rawText };
  }

  if (!response.ok) {
    const msg = (rawJson && rawJson.message) || `DashScope error: ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    err.data = rawJson;
    throw err;
  }

  const content = rawJson?.output?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((c) => c.text).filter(Boolean).join('\n')
    : (content?.text || content || '');

  return { raw: rawJson, text: text || rawText };
}

async function extractProfileFromImage(imageDataUrl) {
  const prompt = buildExtractPrompt();
  const { raw, text } = await callQwenVision({ imageDataUrls: [imageDataUrl], prompt, requestTag: 'extract' });
  const parsed = extractJsonFromText(text);
  return { raw, parsed };
}

async function generatePlanFromProfile(profile, imageDataUrlOptional) {
  const prompt = buildPlanPrompt(profile);
  const imageDataUrl = imageDataUrlOptional;
  const { raw, text } = await callQwenVision({ imageDataUrls: [imageDataUrl], prompt, requestTag: 'plan' });
  const parsed = extractJsonFromText(text);
  return { raw, parsed };
}

module.exports = {
  callQwenVision,
  extractProfileFromImage,
  generatePlanFromProfile,
  buildExtractPrompt,
  buildExtractPromptForMissing,
  buildPlanPrompt,
  buildLogPrompt,
  buildLogTemplatesPrompt,
  buildAnalyzePrompt,
  buildAnalyzePromptForMissing,
  extractJsonFromText,
};
