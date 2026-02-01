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

// 生成治疗卡片 - 精美展示卡片（与首页风格一致）
export const generateTreatmentCard = (patient) => {
  const cardWindow = window.open('', '_blank');
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');

  const treatmentLogs = patient.treatmentLogs || [];
  const treatmentItems = patient.treatmentPlan?.items || [];
  const precautions = patient.treatmentPlan?.precautions || [];
  const safetyAlerts = patient.safetyAlerts || [];

  // 生成安全提醒标签
  const alertsHtml = safetyAlerts.length > 0
    ? safetyAlerts.map(a => `<span class="alert-badge">${safeString(a)}</span>`).join('')
    : '<span class="empty-text">无</span>';

  // 生成治疗项目
  const itemsHtml = treatmentItems.map((item, idx) => {
    const name = safeString(item.name || item);
    const duration = item.duration ? `（${item.duration}）` : '';
    return `<div class="treatment-row">${idx + 1}. ${name}${duration}</div>`;
  }).join('');

  // 生成注意事项
  const precautionsText = precautions.length > 0
    ? safeArray(precautions).join('；')
    : '无';

  // 生成治疗记录表格
  const logsHtml = treatmentLogs.length > 0 ? treatmentLogs.map(log => {
    const items = safeArray(log.items).join('、');
    const highlight = log.highlight ? '【重点】' + safeString(log.highlight) + ' ' : '';
    const notes = safeString(log.notes);
    return `
      <tr>
        <td class="text-center">${log.date || ''}</td>
        <td>${items}</td>
        <td>${highlight}${notes}</td>
        <td class="text-center">${log.therapist || ''}</td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="4" class="text-center empty-text">暂无治疗记录</td></tr>';

  const cardContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>治疗卡片 - ${patient.name}</title>
      <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Microsoft YaHei", sans-serif;
          background: linear-gradient(180deg, #e8f4fc 0%, #f5e6f0 30%, #fce8ec 60%, #fff5e6 100%);
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .card-container {
          width: 100%;
          max-width: 540px;
        }
        .card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12),
                      0 8px 16px rgba(0, 0, 0, 0.06),
                      inset 0 1px 0 rgba(255, 255, 255, 0.9);
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.7);
          transition: transform 0.3s ease;
        }

        /* 头部 */
        .card-header {
          text-align: center;
          padding: 32px 28px 24px;
          background: linear-gradient(135deg,
            rgba(147, 197, 253, 0.4) 0%,
            rgba(196, 181, 253, 0.4) 50%,
            rgba(251, 207, 232, 0.4) 100%);
          border-bottom: 2px solid rgba(147, 197, 253, 0.3);
          position: relative;
        }
        .card-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        }
        .hospital-name {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .document-title {
          font-size: 17px;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: 2px;
          opacity: 0.9;
        }

        /* 信息表格 */
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }
        .info-table td {
          border: 1px solid rgba(226, 232, 240, 0.6);
          padding: 10px 12px;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.6);
        }
        .info-table .label {
          background: linear-gradient(135deg,
            rgba(239, 246, 255, 0.8) 0%,
            rgba(245, 243, 255, 0.8) 100%);
          font-weight: 700;
          color: #475569;
          width: 70px;
          text-align: center;
          font-size: 12px;
          white-space: nowrap;
        }
        .info-table .value {
          color: #1e293b;
          font-weight: 600;
          white-space: nowrap;
        }

        /* 内容区域 */
        .card-body {
          padding: 24px 28px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section:last-child {
          margin-bottom: 0;
        }
        .section-title {
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding-bottom: 8px;
          margin-bottom: 12px;
          border-bottom: 3px solid transparent;
          border-image: linear-gradient(90deg, #3b82f6, #8b5cf6, transparent) 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '●';
          color: #3b82f6;
          font-size: 12px;
        }
        .section-content {
          padding-left: 10px;
        }

        /* 安全提醒 */
        .alert-badge {
          display: inline-block;
          background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
          color: #991b1b;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 700;
          margin-right: 8px;
          margin-bottom: 6px;
          border: 2px solid #f87171;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }

        /* 治疗计划 */
        .focus-text {
          font-size: 14px;
          color: #1e293b;
          line-height: 1.7;
          margin-bottom: 10px;
          font-weight: 600;
          padding: 10px 14px;
          background: linear-gradient(135deg,
            rgba(219, 234, 254, 0.5) 0%,
            rgba(233, 213, 255, 0.5) 100%);
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }
        .treatment-row {
          font-size: 14px;
          color: #334155;
          padding: 8px 12px;
          margin-bottom: 6px;
          background: rgba(248, 250, 252, 0.6);
          border-radius: 10px;
          border-left: 3px solid #93c5fd;
          line-height: 1.6;
          transition: all 0.2s;
        }
        .treatment-row:last-child {
          margin-bottom: 0;
        }

        /* 注意事项 */
        .precautions-text {
          font-size: 13px;
          color: #dc2626;
          line-height: 1.7;
          font-weight: 600;
          padding: 8px 12px;
          background: rgba(254, 226, 226, 0.5);
          border-radius: 10px;
          display: inline-block;
          margin-top: 6px;
        }

        /* 治疗记录表格 */
        .record-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          font-size: 13px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .record-table th,
        .record-table td {
          border: 1px solid rgba(226, 232, 240, 0.6);
          padding: 10px 8px;
          text-align: left;
        }
        .record-table th {
          background: linear-gradient(135deg,
            rgba(219, 234, 254, 0.8) 0%,
            rgba(224, 231, 255, 0.8) 100%);
          font-weight: 800;
          color: #1e40af;
          text-align: center;
          font-size: 13px;
          letter-spacing: 0.5px;
        }
        .record-table td {
          background: rgba(255, 255, 255, 0.6);
          color: #334155;
          vertical-align: top;
          line-height: 1.6;
        }
        .record-table tbody tr:hover td {
          background: rgba(239, 246, 255, 0.6);
        }
        .text-center {
          text-align: center;
        }
        .empty-text {
          color: #94a3b8;
          font-style: italic;
          padding: 16px;
        }

        /* 签名区 */
        .signature-area {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 2px solid rgba(226, 232, 240, 0.6);
          display: flex;
          justify-content: center;
          font-size: 14px;
          color: #64748b;
        }
        .signature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: linear-gradient(135deg,
            rgba(239, 246, 255, 0.5) 0%,
            rgba(245, 243, 255, 0.5) 100%);
          border-radius: 12px;
          font-weight: 600;
        }

        /* 底部 */
        .card-footer {
          padding: 16px 28px;
          background: linear-gradient(135deg,
            rgba(147, 197, 253, 0.3) 0%,
            rgba(196, 181, 253, 0.3) 50%,
            rgba(251, 207, 232, 0.3) 100%);
          border-top: 2px solid rgba(147, 197, 253, 0.3);
          text-align: center;
          font-size: 13px;
          color: #475569;
          font-weight: 600;
          letter-spacing: 1px;
        }

        /* 操作按钮 */
        .action-buttons {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 12px;
          z-index: 1000;
        }
        .action-btn {
          padding: 14px 28px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12),
                      0 2px 8px rgba(0,0,0,0.08);
          letter-spacing: 0.5px;
        }
        .btn-save {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .btn-save:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(59,130,246,0.4),
                      0 4px 12px rgba(139,92,246,0.3);
        }
        .btn-save:active {
          transform: translateY(-1px);
        }
        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media print {
          body { background: white; padding: 0; }
          .action-buttons { display: none; }
          .card { box-shadow: none; border: 1px solid #e2e8f0; }
        }
      </style>
    </head>
    <body>
      <div class="action-buttons">
        <button class="action-btn btn-save" id="saveBtn" onclick="saveAsImage()">💾 保存图片</button>
      </div>

      <div class="card-container">
        <div class="card" id="treatmentCard">
          <!-- 头部 -->
          <div class="card-header">
            <div class="hospital-name">南京市儿童医院</div>
            <div class="document-title">康复科治疗记录</div>
          </div>

          <!-- 基本信息表格 -->
          <table class="info-table">
            <tr>
              <td class="label">姓名</td>
              <td class="value">${patient.name || ''}</td>
              <td class="label">性别</td>
              <td class="value">${patient.gender || ''}</td>
              <td class="label">年龄</td>
              <td class="value">${patient.age || ''}</td>
            </tr>
            <tr>
              <td class="label">床号</td>
              <td class="value">${patient.bedNo || ''}</td>
              <td class="label">科室</td>
              <td class="value">${patient.department || ''}</td>
              <td class="label">入院日期</td>
              <td class="value">${patient.admissionDate || ''}</td>
            </tr>
            <tr>
              <td class="label">诊断</td>
              <td class="value" colspan="5">${patient.diagnosis || ''}</td>
            </tr>
          </table>

          <!-- 内容 -->
          <div class="card-body">
            <!-- 安全提醒 -->
            <div class="section">
              <div class="section-title">安全提醒</div>
              <div class="section-content">${alertsHtml}</div>
            </div>

            <!-- 治疗计划 -->
            ${patient.treatmentPlan?.focus || itemsHtml ? `
            <div class="section">
              <div class="section-title">治疗计划</div>
              <div class="section-content">
                ${patient.treatmentPlan?.focus ? `<div class="focus-text"><strong>治疗重点：</strong>${patient.treatmentPlan.focus}</div>` : ''}
                ${itemsHtml ? `<div style="margin-top: 8px;">${itemsHtml}</div>` : ''}
                ${precautions.length > 0 ? `<div style="margin-top: 10px;"><strong style="color: #dc2626;">注意事项：</strong><span class="precautions-text">${precautionsText}</span></div>` : ''}
              </div>
            </div>
            ` : ''}

            <!-- 治疗记录 -->
            <div class="section">
              <div class="section-title">治疗记录</div>
              <table class="record-table">
                <thead>
                  <tr>
                    <th style="width: 80px;">日期</th>
                    <th style="width: 100px;">治疗项目</th>
                    <th>治疗内容/备注</th>
                    <th style="width: 60px;">治疗师</th>
                  </tr>
                </thead>
                <tbody>${logsHtml}</tbody>
              </table>
            </div>

            <!-- 签名区 -->
            <div class="signature-area">
              <div class="signature-item">
                <span>日期：</span>
                <span>${today}</span>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="card-footer">
            南京市儿童医院康复科
          </div>
        </div>
      </div>

      <script>
        async function saveAsImage() {
          const btn = document.getElementById('saveBtn');
          btn.disabled = true;
          btn.textContent = '⏳ 生成中...';

          try {
            const card = document.getElementById('treatmentCard');
            const canvas = await html2canvas(card, {
              scale: 2,
              backgroundColor: null,
              logging: false,
              useCORS: true
            });

            // 转换为图片并下载
            canvas.toBlob(function(blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const patientName = '${patient.name}';
              const dateStr = '${today}'.replace(/\\//g, '');
              link.download = '治疗卡片-' + patientName + '-' + dateStr + '.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);

              btn.disabled = false;
              btn.textContent = '✅ 已保存';
              setTimeout(function() {
                btn.textContent = '💾 保存图片';
              }, 2000);
            });
          } catch (error) {
            console.error('保存失败:', error);
            btn.disabled = false;
            btn.textContent = '❌ 保存失败';
            setTimeout(function() {
              btn.textContent = '💾 保存图片';
            }, 2000);
          }
        }
      </script>
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
