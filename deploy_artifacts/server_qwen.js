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
    '基于给定的结构化患者资料，为患儿制定“今日康复训练方案”和“注意事项/禁忌/监测项”。输出严格 JSON（不要 Markdown）。
重要：方案必须结合 diagnosis/keyFindings/risks/contraindications/monitoring，避免通用模板；每个训练项目的 notes 用 1-2 句话说明与本患儿病情/机体情况的关联。',
    '输入资料如下（JSON）：',
    JSON.stringify(profile),
    '输出必须包含字段：',
    '{',
    '  "gasGoals": [ { "name": string, "target": number, "current": number } ],',
    '  "focus": string,',
    '  "items": [ { "name": string, "duration": string, "frequency": string, "intensity": string, "steps": string[], "monitoring": string[], "stopCriteria": string[], "notes": string } ],',
    '  "precautions": string[],',
    '  "familyEducation": string[],',
    '  "review": { "when": string, "metrics": string[] }',
    '}',
    '要求：',
    '- gasGoals 给出 2 个目标即可（current 可以先给 0 或根据资料估计）。',
    '- 方案必须可执行，项目数量 3-6 个为宜。',
    '- 明确监测项（如血氧/疼痛/心率/疲劳）和停止条件。',
    '- 避免编造无法从资料推出的特异检查结果；不确定则写“需复核/遵医嘱”。',
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

async function callQwenVision({ imageDataUrls, prompt, requestTag }) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(requestTag ? { 'X-Request-Tag': requestTag } : {}),
    },
    body: JSON.stringify(payload),
  });

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
  extractJsonFromText,
};
