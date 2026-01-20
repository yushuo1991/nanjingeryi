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
 * @param {number} options.timeout - Request timeout in ms (default: 60000)
 * @param {number} options.maxRetries - Max retry attempts (default: 2)
 * @returns {Promise<object>} Analysis result with patient info and rehabilitation plan
 */
async function analyzeWithQwen(base64Images, options = {}) {
  const apiKey = options.apiKey || process.env.QWEN_API_KEY;
  const timeout = options.timeout || 60000; // 60s timeout
  const maxRetries = options.maxRetries || 2;

  if (!apiKey) {
    throw new Error('未配置 QWEN_API_KEY');
  }

  if (!base64Images || base64Images.length === 0) {
    throw new Error('请提供至少一张图片');
  }

  // Limit number of images to avoid timeout
  if (base64Images.length > 5) {
    console.warn(`[Qwen] 图片数量过多(${base64Images.length}),仅使用前5张`);
    base64Images = base64Images.slice(0, 5);
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

  // Retry wrapper
  async function attemptRequest(retryCount = 0) {
    return new Promise((resolve, reject) => {
      const reqOptions = {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/compatible-mode/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(requestBody),
        },
        timeout: timeout, // Add timeout to request options
      };

      let timeoutHandle;

      const req = https.request(reqOptions, (res) => {
        // Clear timeout on response
        if (timeoutHandle) clearTimeout(timeoutHandle);

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              console.error(`[Qwen] API错误响应 (${res.statusCode}):`, data.substring(0, 500));
              const error = new Error(`API请求失败 (${res.statusCode})`);
              error.statusCode = res.statusCode;
              error.retryable = res.statusCode >= 500 || res.statusCode === 429; // Retry on server errors or rate limits
              reject(error);
              return;
            }

            const response = JSON.parse(data);

            if (!response.choices || !response.choices[0] || !response.choices[0].message) {
              reject(new Error('API返回格式错误'));
              return;
            }

            const content = response.choices[0].message.content;
            console.log(`[Qwen] 原始响应内容:`, content.substring(0, 200));

            // Extract JSON from response (try multiple patterns)
            let jsonStr;

            // Try markdown code block first
            const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
              jsonStr = codeBlockMatch[1];
            } else {
              // Try to find JSON object directly
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonStr = jsonMatch[0];
              }
            }

            if (!jsonStr) {
              console.error('[Qwen] 无法提取JSON:', content);
              reject(new Error('无法从AI响应中提取JSON数据'));
              return;
            }

            const result = JSON.parse(jsonStr);

            // Validate result structure
            if (!result.patient || !result.rehabPlan) {
              console.error('[Qwen] 数据格式不完整:', result);
              reject(new Error('AI返回的数据格式不完整'));
              return;
            }

            // Return in expected format
            resolve({
              success: true,
              profile: { patient: result.patient },
              plan: result.rehabPlan
            });
          } catch (err) {
            console.error('[Qwen] 解析错误:', err.message, '原始数据:', data.substring(0, 500));
            reject(new Error(`解析AI响应失败: ${err.message}`));
          }
        });
      });

      // Set timeout
      timeoutHandle = setTimeout(() => {
        req.destroy();
        const error = new Error(`请求超时(${timeout}ms)`);
        error.retryable = true;
        reject(error);
      }, timeout);

      req.on('error', (err) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        const error = new Error(`网络请求失败: ${err.message}`);
        error.retryable = true;
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        const error = new Error(`请求超时(${timeout}ms)`);
        error.retryable = true;
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }

  // Retry logic
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Qwen] 尝试请求 (${attempt + 1}/${maxRetries + 1})...`);
      const result = await attemptRequest(attempt);
      console.log(`[Qwen] 请求成功`);
      return result;
    } catch (error) {
      console.error(`[Qwen] 请求失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`, error.message);

      // Check if we should retry
      if (attempt < maxRetries && error.retryable) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.log(`[Qwen] ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // No more retries or non-retryable error
      throw error;
    }
  }
}

module.exports = {
  analyzeWithQwen,
};
