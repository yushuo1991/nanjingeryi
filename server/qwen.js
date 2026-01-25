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

function buildAnalyzePrompt() {
  return [
    '你是儿科医院康复治疗师的助手。',
    '请基于用户提供的多张病例图片（可能是不同页），完成两件事：',
    '1) 抽取患儿结构化资料（profile）；2) 基于该资料生成“今日康复训练方案”（plan）。',
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
    '- items：只给 3 个训练项目；每项 steps <= 4 条；monitoring <= 2 条；stopCriteria <= 2 条。',
    '- 今日训练总时长不超过 20 分钟；请在 duration 中明确写"X分钟"。',
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
  buildAnalyzePrompt,
  buildAnalyzePromptForMissing,
  extractJsonFromText,
};
