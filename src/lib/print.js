// 打印和导出功能组件
import React from 'react';

// 打印患者档案 - A4标准格式
export const printPatientRecord = (patient) => {
  const printWindow = window.open('', '_blank');
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>患者档案 - ${patient.name}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }

        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }

        body {
          font-family: "Microsoft YaHei", "SimSun", sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #333;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #1E3A5F;
          padding-bottom: 15px;
        }

        .header h1 {
          color: #1E3A5F;
          font-size: 24pt;
          margin: 0 0 10px 0;
        }

        .header .subtitle {
          color: #666;
          font-size: 14pt;
        }

        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }

        .section-title {
          background: #f0f4f8;
          padding: 8px 12px;
          font-size: 14pt;
          font-weight: bold;
          color: #1E3A5F;
          margin-bottom: 12px;
          border-left: 4px solid #E91E63;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 20px;
          margin-bottom: 15px;
        }

        .info-item {
          display: flex;
        }

        .info-label {
          font-weight: bold;
          min-width: 100px;
          color: #555;
        }

        .info-value {
          color: #333;
        }

        .gas-goal {
          background: #f9fafb;
          padding: 10px;
          margin: 8px 0;
          border-left: 3px solid #10b981;
        }

        .treatment-item {
          background: #fff;
          border: 1px solid #e5e7eb;
          padding: 10px;
          margin: 8px 0;
          border-radius: 4px;
        }

        .treatment-log {
          background: #fef3c7;
          padding: 12px;
          margin: 10px 0;
          border-left: 4px solid #f59e0b;
        }

        .safety-alert {
          background: #fee2e2;
          color: #991b1b;
          padding: 10px;
          margin: 10px 0;
          border-left: 4px solid #dc2626;
          font-weight: bold;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: right;
          color: #666;
          font-size: 10pt;
        }

        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #1E3A5F;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14pt;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .print-button:hover {
          background: #2d4a6f;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ 打印</button>

      <div class="header">
        <h1>康复治疗患者档案</h1>
        <div class="subtitle">南京儿童医院康复科</div>
      </div>

      <!-- 基本信息 -->
      <div class="section">
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">姓名：</span>
            <span class="info-value">${patient.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年龄：</span>
            <span class="info-value">${patient.age}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性别：</span>
            <span class="info-value">${patient.gender}</span>
          </div>
          <div class="info-item">
            <span class="info-label">床号：</span>
            <span class="info-value">${patient.bedNo}</span>
          </div>
          <div class="info-item">
            <span class="info-label">科室：</span>
            <span class="info-value">${patient.department}</span>
          </div>
          <div class="info-item">
            <span class="info-label">入院日期：</span>
            <span class="info-value">${patient.admissionDate}</span>
          </div>
        </div>
        <div class="info-item" style="margin-top: 10px;">
          <span class="info-label">诊断：</span>
          <span class="info-value">${patient.diagnosis}</span>
        </div>
      </div>

      <!-- 安全提醒 -->
      ${patient.safetyAlerts && patient.safetyAlerts.length > 0 ? `
      <div class="section">
        <div class="section-title">⚠️ 安全提醒</div>
        <div class="safety-alert">
          ${patient.safetyAlerts.join(' · ')}
        </div>
      </div>
      ` : ''}

      <!-- GAS评分 -->
      <div class="section">
        <div class="section-title">GAS康复目标评分</div>
        <div class="info-item" style="margin-bottom: 15px;">
          <span class="info-label">当前总分：</span>
          <span class="info-value" style="font-size: 16pt; font-weight: bold; color: #059669;">${patient.gasScore}分</span>
        </div>
        ${patient.gasGoals.map(goal => `
          <div class="gas-goal">
            <div style="font-weight: bold; margin-bottom: 5px;">${goal.name}</div>
            <div>目标值：${goal.target}分 | 当前值：${goal.current}分</div>
            <div style="margin-top: 5px;">
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: #10b981; height: 100%; width: ${(goal.current / goal.target * 100).toFixed(0)}%;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 治疗计划 -->
      <div class="section">
        <div class="section-title">治疗计划</div>
        <div class="info-item" style="margin-bottom: 15px;">
          <span class="info-label">重点：</span>
          <span class="info-value">${patient.treatmentPlan.focus}</span>
        </div>
        ${patient.treatmentPlan.highlights ? `
        <div style="background: #dbeafe; padding: 10px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
          📌 ${patient.treatmentPlan.highlights}
        </div>
        ` : ''}
        <div style="margin-top: 10px;">
          ${patient.treatmentPlan.items.map((item, idx) => `
            <div class="treatment-item">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>${idx + 1}. ${item.name}</strong>
                <span style="color: #6b7280;">${item.duration}</span>
              </div>
              <div style="color: #6b7280; font-size: 10pt;">${item.note}</div>
            </div>
          `).join('')}
        </div>
        ${patient.treatmentPlan.precautions && patient.treatmentPlan.precautions.length > 0 ? `
        <div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b;">
          <strong>⚠️ 注意事项：</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${patient.treatmentPlan.precautions.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>

      <!-- 治疗记录 -->
      ${patient.treatmentLogs && patient.treatmentLogs.length > 0 ? `
      <div class="section">
        <div class="section-title">治疗记录</div>
        ${patient.treatmentLogs.map(log => `
          <div class="treatment-log">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <strong>📅 ${log.date}</strong>
              <span>治疗师：${log.therapist}</span>
            </div>
            <div style="margin-bottom: 5px;">
              <strong>治疗项目：</strong>${log.items.join('、')}
            </div>
            ${log.highlight ? `
            <div style="background: #fff; padding: 8px; margin: 5px 0; border-radius: 4px;">
              💡 <strong>重点：</strong>${log.highlight}
            </div>
            ` : ''}
            <div style="color: #666;">
              <strong>备注：</strong>${log.notes}
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- 家庭作业 -->
      ${patient.homework && patient.homework.length > 0 ? `
      <div class="section">
        <div class="section-title">家庭作业</div>
        ${patient.homework.map(hw => `
          <div style="padding: 8px; margin: 5px 0; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 16pt;">${hw.completed ? '✅' : '⭕'}</span>
              <div style="flex: 1;">
                <div style="font-weight: ${hw.completed ? 'normal' : 'bold'}; ${hw.completed ? 'text-decoration: line-through; color: #9ca3af;' : ''}">${hw.task}</div>
                ${hw.note ? `<div style="color: #6b7280; font-size: 10pt; margin-top: 3px;">${hw.note}</div>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        <div>打印时间：${new Date().toLocaleString('zh-CN')}</div>
        <div style="margin-top: 5px;">南京儿童医院康复科 · 康复云查房助手</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};

// 批量打印治疗日报
export const printBatchRecords = (batchPatients) => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('zh-CN');

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>治疗日报 - ${today}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }

        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-after: always; }
        }

        body {
          font-family: "Microsoft YaHei", "SimSun", sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #333;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #1E3A5F;
          padding-bottom: 10px;
        }

        .header h1 {
          color: #1E3A5F;
          font-size: 20pt;
          margin: 0 0 5px 0;
        }

        .record-card {
          border: 2px solid #e5e7eb;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 8px;
          page-break-inside: avoid;
        }

        .patient-info {
          background: #f0f4f8;
          padding: 10px;
          margin-bottom: 15px;
          border-left: 4px solid #E91E63;
        }

        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #1E3A5F;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14pt;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ 打印全部</button>

      <div class="header">
        <h1>康复治疗日报</h1>
        <div>日期：${today} | 南京儿童医院康复科</div>
      </div>

      ${batchPatients.map((patient, index) => `
        <div class="record-card ${index < batchPatients.length - 1 ? 'page-break' : ''}">
          <div class="patient-info">
            <strong style="font-size: 14pt;">${patient.name}</strong> ·
            ${patient.age} · ${patient.gender} ·
            床号：${patient.bedNo} · ${patient.department}
          </div>

          <div style="margin-bottom: 10px;">
            <strong>诊断：</strong>${patient.diagnosis}
          </div>

          <div style="margin-bottom: 15px;">
            <strong>治疗项目：</strong>
            <div style="margin-top: 5px;">
              ${patient.generatedRecord.items.join('、')}
            </div>
          </div>

          ${patient.generatedRecord.highlight ? `
          <div style="background: #dbeafe; padding: 10px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
            <strong>💡 重点：</strong>${patient.generatedRecord.highlight}
          </div>
          ` : ''}

          <div style="margin-bottom: 10px;">
            <strong>备注：</strong>${patient.generatedRecord.notes}
          </div>

          <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc; display: flex; justify-content: space-between; color: #666;">
            <span>治疗师：${patient.generatedRecord.therapist || '吴大勇'}</span>
            <span>日期：${today}</span>
          </div>
        </div>
      `).join('')}

      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 10pt;">
        打印时间：${new Date().toLocaleString('zh-CN')} | 共 ${batchPatients.length} 名患者
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};
