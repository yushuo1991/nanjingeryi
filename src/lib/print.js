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
