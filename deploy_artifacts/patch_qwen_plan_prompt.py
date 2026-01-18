#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path


def main() -> None:
    p = Path("/var/www/rehab-care-link/server/qwen.js")
    s = p.read_text(encoding="utf-8")

    start = s.find("function buildPlanPrompt(profile) {")
    if start < 0:
        raise SystemExit("buildPlanPrompt not found")

    end = s.find("function extractJsonFromText", start)
    if end < 0:
        raise SystemExit("extractJsonFromText not found after buildPlanPrompt")

    before = s[:start]
    after = s[end:]

    # Keep this function strict-ASCII in code structure; Chinese is content for the model.
    new_fn = """function buildPlanPrompt(profile) {
  return [
    '你是儿科医院康复治疗师的助手。',
    '基于给定的结构化患者资料，为患儿制定“今日康复训练方案”和“注意事项/禁忌/监测项”。输出严格 JSON（不要 Markdown）。',
    '重要：方案必须结合 diagnosis/keyFindings/risks/contraindications/monitoring，避免通用模板；每个训练项目的 notes 用 1-2 句话说明与本患儿病情/机体情况的关联。',
    '输入资料如下（JSON）：',
    JSON.stringify(profile),
    '输出必须包含字段：',
    '{',
    '  "gasGoals": [ { "name": string, "target": number, "current": number } ],',
    '  "focus": string,',
    '  "highlights": string[],',
    '  "items": [ { "name": string, "duration": string, "frequency": string, "intensity": string, "steps": string[], "monitoring": string[], "stopCriteria": string[], "notes": string } ],',
    '  "precautions": string[],',
    '  "familyEducation": string[],',
    '  "review": { "when": string, "metrics": string[] }',
    '}',
    '要求：',
    '- gasGoals 给出 2 个目标即可（current 可以先给 0 或根据资料估计）。',
    '- highlights 给出 2 条，用于向管床医生展示你的个性化判断依据与当日训练重点。',
    '- 方案必须可执行，项目数量 3-6 个为宜。',
    '- 明确监测项（如血氧/疼痛/心率/疲劳）和停止条件。',
    '- 避免编造无法从资料推出的特异检查结果；不确定则写“需复核/遵医嘱”。',
  ].join('\\n');
}

"""

    p.write_text(before + new_fn + after, encoding="utf-8")
    print("patched", str(p))


if __name__ == "__main__":
    main()

