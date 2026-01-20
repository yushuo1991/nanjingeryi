/**
 * Qwen Vision Service - Uses Alibaba Cloud Qwen3-VL-Plus for medical image analysis
 * and personalized rehabilitation plan generation
 */

const https = require('https');

/**
 * Call Qwen3-VL-Plus API to analyze medical images and generate rehabilitation plan
 * @param {string[]} base64Images - Array of base64 encoded images
 * @param {object} options - Configuration options
 * @param {string} options.apiKey - DashScope API key
 * @returns {Promise<object>} Analysis result with patient info and rehabilitation plan
 */
async function analyzeWithQwen(base64Images, options = {}) {
  const apiKey = options.apiKey || process.env.QWEN_API_KEY;

  if (!apiKey) {
    throw new Error('未配置 QWEN_API_KEY');
  }

  if (!base64Images || base64Images.length === 0) {
    throw new Error('请提供至少一张图片');
  }

  // Prepare image content for API
  const imageContents = base64Images.map((base64) => ({
    type: 'image_url',
    image_url: {
      url: `data:image/jpeg;base64,${base64}`,
    },
  }));

  // Construct prompt for rehabilitation plan generation
  const prompt = `请仔细分析这些医疗图片（包括患者基本信息、诊断结果、近期表现等），然后生成详细的个性化康复训练方案。

请以JSON格式返回以下内容：

{
  "patient": {
    "name": "患者姓名",
    "gender": "男/女",
    "birthDate": "YYYY-MM-DD格式的出生日期",
    "age": "年龄（岁）",
    "guardianName": "监护人姓名",
    "phone": "联系电话",
    "department": "科室",
    "bedNo": "床号",
    "diagnosis": "主要诊断"
  },
  "rehabPlan": {
    "focus": "康复训练重点（简短概括，如：运动功能训练、语言认知训练等）",
    "goals": [
      "康复目标1",
      "康复目标2",
      "康复目标3"
    ],
    "items": [
      {
        "name": "训练项目名称1",
        "description": "详细说明和操作要点",
        "frequency": "频率（如：每日2次，每次20分钟）",
        "duration": "持续时间（如：2周）"
      },
      {
        "name": "训练项目名称2",
        "description": "详细说明和操作要点",
        "frequency": "频率",
        "duration": "持续时间"
      }
    ],
    "precautions": [
      "注意事项1",
      "注意事项2",
      "注意事项3"
    ],
    "highlights": [
      "训练亮点或重点关注1",
      "训练亮点或重点关注2"
    ]
  }
}

注意：
1. 请基于图片中的实际信息生成个性化方案
2. 如果某项信息在图片中找不到，请留空字符串
3. 康复训练方案要具体、可操作、符合儿童康复医学标准
4. 训练项目至少3-5个，注意事项至少3个
5. 只返回JSON，不要有其他说明文字`;

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...imageContents,
      ],
    },
  ];

  const requestBody = JSON.stringify({
    model: 'qwen-vl-plus',
    messages: messages,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dashscope.aliyuncs.com',
      port: 443,
      path: '/compatible-mode/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.error('Qwen API Error Response:', data);
            reject(new Error(`API请求失败 (${res.statusCode}): ${data}`));
            return;
          }

          const response = JSON.parse(data);

          if (!response.choices || !response.choices[0] || !response.choices[0].message) {
            reject(new Error('API返回格式错误'));
            return;
          }

          const content = response.choices[0].message.content;

          // Extract JSON from response (might be wrapped in markdown code blocks)
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);

          if (!jsonMatch) {
            console.error('Cannot extract JSON from response:', content);
            reject(new Error('无法从AI响应中提取JSON数据'));
            return;
          }

          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const result = JSON.parse(jsonStr);

          // Validate result structure
          if (!result.patient || !result.rehabPlan) {
            reject(new Error('AI返回的数据格式不完整'));
            return;
          }

          resolve(result);
        } catch (err) {
          console.error('Parse error:', err.message, 'Raw data:', data);
          reject(new Error(`解析AI响应失败: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`网络请求失败: ${err.message}`));
    });

    req.write(requestBody);
    req.end();
  });
}

module.exports = {
  analyzeWithQwen,
};
