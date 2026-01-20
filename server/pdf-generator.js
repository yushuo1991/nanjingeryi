/**
 * PDF Generator for Patient Treatment Records
 * Generates standardized PDF documents for Nanjing Children's Hospital Rehabilitation Department
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a treatment record PDF for a patient
 * @param {object} patient - Patient data
 * @param {Array} records - Medical records
 * @param {Array} rehabSessions - Rehabilitation sessions
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePatientPDF(patient, records = [], rehabSessions = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `${patient.name} - 康复治疗档案`,
          Author: '南京市儿童医院康复科',
          Subject: '康复治疗档案',
          Keywords: '康复,治疗,档案',
          CreationDate: new Date()
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Register fonts (using built-in fonts for now, can add custom Chinese fonts later)
      // For Chinese support, we'll use unicode escape sequences

      // ===== Header =====
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('南京市儿童医院康复科', { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(16)
         .text('康复治疗档案', { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text(`生成日期: ${new Date().toLocaleString('zh-CN')}`, { align: 'center' });

      // Line separator
      doc.moveDown(1);
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke();
      doc.moveDown(1);

      // ===== Patient Basic Information =====
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('一、患者基本信息', { underline: true });

      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica');

      const info = [
        ['姓名', patient.name || 'N/A'],
        ['性别', patient.gender || 'N/A'],
        ['出生日期', patient.birthDate || 'N/A'],
        ['监护人', patient.guardianName || 'N/A'],
        ['联系电话', patient.phone || 'N/A'],
        ['科室', patient.department || 'N/A'],
        ['床号', patient.bedNo || 'N/A'],
        ['主要诊断', patient.diagnosis || 'N/A'],
        ['入院日期', formatDate(patient.createdAt)]
      ];

      let startY = doc.y;
      info.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          // Left column
          doc.text(`${label}: ${value}`, 50, startY, { width: 230, continued: false });
        } else {
          // Right column
          doc.text(`${label}: ${value}`, 300, startY, { width: 230, continued: false });
          startY += 20;
          doc.y = startY;
        }
      });

      if (info.length % 2 !== 0) {
        doc.moveDown(1);
      } else {
        doc.moveDown(0.5);
      }

      // ===== Medical Records =====
      if (records && records.length > 0) {
        doc.moveDown(1);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('二、病历记录', { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica');

        records.slice(0, 5).forEach((record, index) => {
          doc.fontSize(11)
             .font('Helvetica-Bold')
             .text(`${index + 1}. ${formatDate(record.createdAt)}`, { continued: false });

          doc.fontSize(10)
             .font('Helvetica')
             .text(`   ${record.content || '无记录内容'}`, { width: 495, align: 'left' });

          doc.moveDown(0.3);
        });

        if (records.length > 5) {
          doc.fontSize(9)
             .fillColor('gray')
             .text(`... 还有 ${records.length - 5} 条记录未显示`, { align: 'center' });
          doc.fillColor('black');
        }
      }

      // ===== Rehabilitation Sessions =====
      if (rehabSessions && rehabSessions.length > 0) {
        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.moveDown(1);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('三、康复护理记录', { underline: true });

        doc.moveDown(0.5);

        rehabSessions.slice(0, 10).forEach((session, index) => {
          // Check if we need a new page for this session
          if (doc.y > 700) {
            doc.addPage();
          }

          doc.fontSize(11)
             .font('Helvetica-Bold')
             .text(`${index + 1}. ${formatDate(session.date)}`, { continued: false });

          doc.fontSize(10)
             .font('Helvetica');

          // Session items
          if (session.items && session.items.length > 0) {
            doc.text('   训练项目:', { continued: false });
            session.items.forEach((item) => {
              const status = item.completed ? '[已完成]' : '[未完成]';
              doc.text(`     ${status} ${item.name} - ${item.notes || '无备注'}`, {
                width: 480,
                continued: false
              });
            });
          }

          // Session notes
          if (session.notes) {
            doc.text(`   备注: ${session.notes}`, { width: 480, continued: false });
          }

          doc.moveDown(0.5);
        });

        if (rehabSessions.length > 10) {
          doc.fontSize(9)
             .fillColor('gray')
             .text(`... 还有 ${rehabSessions.length - 10} 次护理记录未显示`, { align: 'center' });
          doc.fillColor('black');
        }
      }

      // ===== Footer =====
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // Footer line
        doc.moveTo(50, 770)
           .lineTo(545, 770)
           .stroke();

        // Page number
        doc.fontSize(9)
           .fillColor('gray')
           .text(
             `第 ${i + 1} 页 / 共 ${pageCount} 页`,
             50,
             775,
             { width: 495, align: 'center' }
           );

        // Hospital name in footer
        doc.fontSize(8)
           .text(
             '南京市儿童医院康复科',
             50,
             785,
             { width: 495, align: 'center' }
           );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format date to Chinese format
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';

  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    return dateStr;
  }
}

module.exports = {
  generatePatientPDF
};
