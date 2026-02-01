// 打印和导出功能组件

// 辅助函数：安全地将值转换为字符串
const safeString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.text) return value.text;
    return '';
  }
  return String(value);
};

// 辅助函数：安全地处理数组
const safeArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(item => safeString(item)).filter(Boolean);
};

// 生成治疗卡片 - 精美展示卡片
export const generateTreatmentCard = (patient) => {
  const cardWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('zh-CN');

  const treatmentLogs = patient.treatmentLogs || [];
  const treatmentItems = patient.treatmentPlan?.items || [];
  const precautions = patient.treatmentPlan?.precautions || [];
  const safetyAlerts = patient.safetyAlerts || [];
  const gasGoals = patient.gasGoals || [];

  // 生成安全提醒标签
  const alertsHtml = safetyAlerts.length > 0
    ? safetyAlerts.map(a => `<span class="alert-tag">⚠️ ${safeString(a)}</span>`).join('')
    : '';

  // 生成治疗项目
  const itemsHtml = treatmentItems.map(item => {
    const name = safeString(item.name || item);
    const duration = item.duration || '';
    const completed = item.completed ? '✓' : '';
    return `
      <div class="treatment-item ${item.completed ? 'completed' : ''}">
        <span class="item-icon">${item.icon || '💊'}</span>
        <span class="item-name">${name}</span>
        <span class="item-duration">${duration}</span>
        ${completed ? '<span class="item-check">✓</span>' : ''}
      </div>
    `;
  }).join('');

  // 生成GAS目标进度
  const goalsHtml = gasGoals.length > 0 ? gasGoals.map(goal => {
    const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
    return `
      <div class="goal-item">
        <div class="goal-header">
          <span class="goal-name">${goal.name}</span>
          <span class="goal-value">${goal.current}/${goal.target}</span>
        </div>
        <div class="goal-bar">
          <div class="goal-progress" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
  }).join('') : '';

  // 生成最近治疗记录（最多3条）
  const recentLogs = treatmentLogs.slice(0, 3);
  const logsHtml = recentLogs.length > 0 ? recentLogs.map(log => {
    const items = safeArray(log.items).join('、');
    return `
      <div class="log-item">
        <div class="log-date">${log.date || ''}</div>
        <div class="log-content">
          <div class="log-highlight">${log.highlight || ''}</div>
          <div class="log-items">${items}</div>
        </div>
        <div class="log-therapist">${log.therapist || ''}</div>
      </div>
    `;
  }).join('') : '<div class="empty-state">暂无治疗记录</div>';

  // 注意事项
  const precautionsHtml = precautions.length > 0
    ? precautions.map(p => `<li>${safeString(p)}</li>`).join('')
    : '';

  const cardContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>治疗卡片 - ${patient.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .card-container {
          width: 100%;
          max-width: 420px;
        }
        .card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          backdrop-filter: blur(20px);
        }

        /* 头部区域 */
        .card-header {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          padding: 24px;
          color: white;
          position: relative;
        }
        .hospital-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .patient-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .avatar {
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .patient-details h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .patient-meta {
          font-size: 14px;
          opacity: 0.9;
        }
        .diagnosis-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          margin-top: 12px;
          font-weight: 500;
        }

        /* 安全提醒 */
        .alerts-section {
          padding: 12px 24px;
          background: #fef2f2;
          border-bottom: 1px solid #fecaca;
        }
        .alert-tag {
          display: inline-block;
          background: #dc2626;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;
          margin-bottom: 4px;
        }

        /* 内容区域 */
        .card-body {
          padding: 24px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section:last-child {
          margin-bottom: 0;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 16px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        /* 治疗目标 */
        .focus-box {
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          border: 1px solid #c7d2fe;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          color: #4338ca;
          line-height: 1.6;
        }

        /* GAS目标 */
        .goal-item {
          margin-bottom: 12px;
        }
        .goal-item:last-child {
          margin-bottom: 0;
        }
        .goal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .goal-name {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .goal-value {
          font-size: 12px;
          color: #64748b;
        }
        .goal-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        .goal-progress {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* 治疗项目 */
        .treatment-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 8px;
          border: 1px solid #e2e8f0;
        }
        .treatment-item:last-child {
          margin-bottom: 0;
        }
        .treatment-item.completed {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .item-icon {
          font-size: 20px;
        }
        .item-name {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }
        .item-duration {
          font-size: 12px;
          color: #64748b;
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 8px;
        }
        .treatment-item.completed .item-duration {
          background: #bbf7d0;
          color: #166534;
        }
        .item-check {
          width: 24px;
          height: 24px;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }

        /* 注意事项 */
        .precautions-list {
          list-style: none;
        }
        .precautions-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #dc2626;
          line-height: 1.5;
        }
        .precautions-list li::before {
          content: '⚠';
          position: absolute;
          left: 0;
          top: 0;
        }

        /* 治疗记录 */
        .log-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 8px;
          border-left: 3px solid #3b82f6;
        }
        .log-item:last-child {
          margin-bottom: 0;
        }
        .log-date {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
        }
        .log-content {
          flex: 1;
        }
        .log-highlight {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 4px;
        }
        .log-items {
          font-size: 12px;
          color: #64748b;
        }
        .log-therapist {
          font-size: 11px;
          color: #94a3b8;
        }
        .empty-state {
          text-align: center;
          padding: 20px;
          color: #94a3b8;
          font-size: 13px;
        }

        /* 底部 */
        .card-footer {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-info {
          font-size: 11px;
          color: #94a3b8;
        }
        .qr-placeholder {
          width: 48px;
          height: 48px;
          background: #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        /* 操作按钮 */
        .action-buttons {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
        }
        .action-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-print {
          background: white;
          color: #334155;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn-print:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .btn-share {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(59,130,246,0.4);
        }
        .btn-share:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59,130,246,0.5);
        }

        @media print {
          body { background: white; padding: 0; }
          .action-buttons { display: none; }
          .card { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="action-buttons">
        <button class="action-btn btn-print" onclick="window.print()">🖨️ 打印卡片</button>
      </div>

      <div class="card-container">
        <div class="card">
          <!-- 头部 -->
          <div class="card-header">
            <div class="hospital-badge">
              <span>🏥</span>
              <span>南京市儿童医院 · 康复科</span>
            </div>
            <div class="patient-info">
              <div class="avatar">${patient.avatar || '👶'}</div>
              <div class="patient-details">
                <h1>${patient.name || ''}</h1>
                <div class="patient-meta">${patient.age || ''} · ${patient.gender || ''} · ${patient.bedNo || ''}</div>
              </div>
            </div>
            <div class="diagnosis-badge">📋 ${patient.diagnosis || ''}</div>
          </div>

          <!-- 安全提醒 -->
          ${alertsHtml ? `<div class="alerts-section">${alertsHtml}</div>` : ''}

          <!-- 内容 -->
          <div class="card-body">
            <!-- 治疗目标 -->
            ${patient.treatmentPlan?.focus ? `
            <div class="section">
              <div class="section-title">治疗目标</div>
              <div class="focus-box">🎯 ${patient.treatmentPlan.focus}</div>
            </div>
            ` : ''}

            <!-- GAS目标 -->
            ${goalsHtml ? `
            <div class="section">
              <div class="section-title">康复进度</div>
              ${goalsHtml}
            </div>
            ` : ''}

            <!-- 治疗项目 -->
            ${itemsHtml ? `
            <div class="section">
              <div class="section-title">治疗项目</div>
              ${itemsHtml}
            </div>
            ` : ''}

            <!-- 注意事项 -->
            ${precautionsHtml ? `
            <div class="section">
              <div class="section-title">注意事项</div>
              <ul class="precautions-list">${precautionsHtml}</ul>
            </div>
            ` : ''}

            <!-- 最近治疗记录 -->
            <div class="section">
              <div class="section-title">最近治疗</div>
              ${logsHtml}
            </div>
          </div>

          <!-- 底部 -->
          <div class="card-footer">
            <div class="footer-info">
              <div>生成日期：${today}</div>
              <div>入院日期：${patient.admissionDate || '-'}</div>
            </div>
            <div class="qr-placeholder">📱</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  cardWindow.document.write(cardContent);
  cardWindow.document.close();
};

// 打印患者档案 - A4标准医院格式
export const printPatientRecord = (patient) => {
  const printWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('zh-CN');
  const now = new Date().toLocaleString('zh-CN');

  const treatmentLogs = patient.treatmentLogs || [];
  const treatmentItems = patient.treatmentPlan?.items || [];
  const precautions = patient.treatmentPlan?.precautions || [];
  const safetyAlerts = patient.safetyAlerts || [];

  // 生成安全提醒HTML
  let safetyHtml = '';
  if (safetyAlerts.length > 0) {
    safetyHtml = '<div class="section"><div class="section-title">安全提醒</div><div class="section-content">' +
      safetyAlerts.map(a => '<span class="alert-badge">' + safeString(a) + '</span>').join('') +
      '</div></div>';
  }

  // 生成治疗计划HTML
  let planHtml = '';
  if (treatmentItems.length > 0) {
    let itemsHtml = treatmentItems.map((item, idx) => {
      const name = safeString(item.name || item);
      const duration = item.duration ? '（' + item.duration + '）' : '';
      return '<div class="treatment-item-row">' + (idx + 1) + '. ' + name + duration + '</div>';
    }).join('');

    let precautionsHtml = '';
    if (precautions.length > 0) {
      precautionsHtml = '<div style="margin-top: 10px;"><strong>注意事项：</strong>' + safeArray(precautions).join('；') + '</div>';
    }

    let focusHtml = patient.treatmentPlan?.focus ? '<div><strong>治疗重点：</strong>' + patient.treatmentPlan.focus + '</div>' : '';

    planHtml = '<div class="section"><div class="section-title">治疗计划</div><div class="section-content">' +
      focusHtml + '<div style="margin-top: 8px;">' + itemsHtml + '</div>' + precautionsHtml + '</div></div>';
  }

  // 生成治疗记录HTML
  let logsHtml = '';
  if (treatmentLogs.length > 0) {
    let rowsHtml = treatmentLogs.map(log => {
      const items = safeArray(log.items).join('、');
      const highlight = log.highlight ? '【重点】' + safeString(log.highlight) + ' ' : '';
      const notes = safeString(log.notes);
      return '<tr><td style="text-align: center;">' + (log.date || '') + '</td>' +
        '<td>' + items + '</td>' +
        '<td>' + highlight + notes + '</td>' +
        '<td style="text-align: center;">' + (log.therapist || '') + '</td></tr>';
    }).join('');

    logsHtml = '<div class="section"><div class="section-title">治疗记录</div>' +
      '<table class="record-table"><thead><tr>' +
      '<th style="width: 90px;">日期</th><th>治疗项目</th><th style="width: 200px;">治疗内容/备注</th><th style="width: 70px;">治疗师</th>' +
      '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>治疗记录 - ${patient.name}</title>
      <style>
        @page { size: A4; margin: 15mm 20mm; }
        @media print { body { margin: 0; } .no-print { display: none !important; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "SimSun", "宋体", serif; font-size: 10.5pt; line-height: 1.8; color: #000; background: #fff; }
        .page { width: 210mm; min-height: 297mm; padding: 15mm 20mm; margin: 0 auto; background: #fff; }
        .hospital-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .hospital-name { font-size: 18pt; font-weight: bold; letter-spacing: 4px; }
        .document-title { font-size: 14pt; font-weight: bold; margin-top: 8px; letter-spacing: 2px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table td { border: 1px solid #000; padding: 6px 10px; font-size: 10.5pt; }
        .info-table .label { background: #f5f5f5; font-weight: bold; width: 80px; text-align: center; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; font-size: 11pt; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 8px; }
        .section-content { padding-left: 10px; }
        .record-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .record-table th, .record-table td { border: 1px solid #000; padding: 6px 8px; text-align: left; font-size: 10pt; }
        .record-table th { background: #f5f5f5; font-weight: bold; text-align: center; }
        .signature-area { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-item { display: flex; align-items: center; gap: 10px; }
        .signature-line { border-bottom: 1px solid #000; width: 100px; display: inline-block; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; color: #666; text-align: center; }
        .print-button { position: fixed; top: 20px; right: 20px; padding: 12px 30px; background: #1a5f2a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14pt; }
        .alert-badge { display: inline-block; background: #dc2626; color: #fff; padding: 2px 8px; font-size: 9pt; margin-right: 5px; }
        .treatment-item-row { margin: 5px 0; padding: 5px 0; border-bottom: 1px dashed #ccc; }
        .treatment-item-row:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">打 印</button>
      <div class="page">
        <div class="hospital-header">
          <div class="hospital-name">南京市儿童医院</div>
          <div class="document-title">康复科治疗记录</div>
        </div>
        <table class="info-table">
          <tr>
            <td class="label">姓名</td><td>${patient.name || ''}</td>
            <td class="label">性别</td><td>${patient.gender || ''}</td>
            <td class="label">年龄</td><td>${patient.age || ''}</td>
          </tr>
          <tr>
            <td class="label">床号</td><td>${patient.bedNo || ''}</td>
            <td class="label">科室</td><td>${patient.department || ''}</td>
            <td class="label">入院日期</td><td>${patient.admissionDate || ''}</td>
          </tr>
          <tr>
            <td class="label">诊断</td><td colspan="5">${patient.diagnosis || ''}</td>
          </tr>
        </table>
        ${safetyHtml}
        ${planHtml}
        ${logsHtml}
        <div class="signature-area">
          <div class="signature-item"><span>主治医师：</span><span class="signature-line"></span></div>
          <div class="signature-item"><span>治疗师：</span><span class="signature-line"></span></div>
          <div class="signature-item"><span>日期：</span><span>${today}</span></div>
        </div>
        <div class="footer">打印时间：${now} | 南京市儿童医院康复科</div>
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
  const now = new Date().toLocaleString('zh-CN');

  // 生成表格行
  const rowsHtml = batchPatients.map((p, i) => {
    const items = safeArray(p.generatedRecord?.items).join('、');
    const notes = safeString(p.generatedRecord?.notes);
    const therapist = p.generatedRecord?.therapist || '吴大勇';
    return '<tr>' +
      '<td style="text-align: center;">' + (i + 1) + '</td>' +
      '<td style="text-align: center;">' + (p.name || '') + '</td>' +
      '<td style="text-align: center;">' + (p.bedNo || '') + '</td>' +
      '<td>' + (p.diagnosis || '') + '</td>' +
      '<td>' + items + '</td>' +
      '<td>' + notes + '</td>' +
      '<td style="text-align: center;">' + therapist + '</td>' +
      '</tr>';
  }).join('');

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>治疗日报 - ${today}</title>
      <style>
        @page { size: A4; margin: 15mm 20mm; }
        @media print { body { margin: 0; } .no-print { display: none !important; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "SimSun", "宋体", serif; font-size: 10.5pt; line-height: 1.8; color: #000; background: #fff; }
        .page { width: 210mm; padding: 15mm 20mm; margin: 0 auto; background: #fff; }
        .hospital-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .hospital-name { font-size: 18pt; font-weight: bold; letter-spacing: 4px; }
        .document-title { font-size: 14pt; font-weight: bold; margin-top: 8px; letter-spacing: 2px; }
        .date-line { text-align: right; margin-bottom: 15px; font-size: 10.5pt; }
        .record-table { width: 100%; border-collapse: collapse; }
        .record-table th, .record-table td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 10pt; vertical-align: top; }
        .record-table th { background: #f5f5f5; font-weight: bold; text-align: center; }
        .signature-area { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-item { display: flex; align-items: center; gap: 10px; }
        .signature-line { border-bottom: 1px solid #000; width: 100px; display: inline-block; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; color: #666; text-align: center; }
        .print-button { position: fixed; top: 20px; right: 20px; padding: 12px 30px; background: #1a5f2a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14pt; }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">打 印</button>
      <div class="page">
        <div class="hospital-header">
          <div class="hospital-name">南京市儿童医院</div>
          <div class="document-title">康复科治疗日报</div>
        </div>
        <div class="date-line">日期：${today}</div>
        <table class="record-table">
          <thead><tr>
            <th style="width: 50px;">序号</th>
            <th style="width: 70px;">姓名</th>
            <th style="width: 50px;">床号</th>
            <th>诊断</th>
            <th>治疗项目</th>
            <th style="width: 150px;">备注</th>
            <th style="width: 60px;">治疗师</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="signature-area">
          <div class="signature-item"><span>科室负责人：</span><span class="signature-line"></span></div>
          <div class="signature-item"><span>记录人：</span><span class="signature-line"></span></div>
        </div>
        <div class="footer">打印时间：${now} | 共 ${batchPatients.length} 名患者 | 南京市儿童医院康复科</div>
      </div>
    </body>
    </html>
  `;
  printWindow.document.write(printContent);
  printWindow.document.close();
};
