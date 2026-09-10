/**
 * NEXUS AI Executive HTML & CSV Report Exporter
 * Generates beautiful, styled visual HTML reports with tables & cards,
 * plus clean UTF-8 CSV tables for Excel/Sheets.
 */

export interface ReportMetric {
  label: string;
  value: string | number;
  badge?: string;
  color?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'cyan';
}

export interface ReportTable {
  headers: string[];
  rows: (string | number)[][];
}

export interface ReportSection {
  title: string;
  metrics?: ReportMetric[];
  table?: ReportTable;
  bullets?: string[];
  textBlock?: string;
}

export interface ExportReportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  lang?: 'ar' | 'en';
  sections: ReportSection[];
}

export function downloadHtmlReport({
  title,
  subtitle = '',
  filename,
  lang = 'ar',
  sections,
}: ExportReportOptions) {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const dateStr = new Date().toLocaleString(isAr ? 'ar-EG' : 'en-US');

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'emerald': return 'border-emerald-200 text-emerald-800 bg-emerald-50';
      case 'amber': return 'border-amber-200 text-amber-800 bg-amber-50';
      case 'rose': return 'border-rose-200 text-rose-800 bg-rose-50';
      case 'cyan': return 'border-cyan-200 text-cyan-800 bg-cyan-50';
      default: return 'border-indigo-200 text-indigo-800 bg-indigo-50';
    }
  };

  const sectionsHtml = sections
    .map((sec, idx) => {
      let metricsHtml = '';
      if (sec.metrics && sec.metrics.length > 0) {
        // Group metrics in pairs for a traditional two-column formal information table
        const metricRows = [];
        for (let i = 0; i < sec.metrics.length; i += 2) {
          const m1 = sec.metrics[i];
          const m2 = sec.metrics[i + 1];
          metricRows.push(`
            <tr>
              <td class="meta-label">${m1.label}:</td>
              <td class="meta-value">${m1.value}</td>
              ${
                m2
                  ? `<td class="meta-label">${m2.label}:</td><td class="meta-value">${m2.value}</td>`
                  : `<td class="meta-label"></td><td class="meta-value"></td>`
              }
            </tr>
          `);
        }

        metricsHtml = `
          <table class="formal-info-table">
            <tbody>
              ${metricRows.join('')}
            </tbody>
          </table>
        `;
      }

      let tableHtml = '';
      if (sec.table && sec.table.rows.length > 0) {
        tableHtml = `
          <table class="formal-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                ${sec.table.headers.map((h) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sec.table.rows
                .map(
                  (row, rIdx) => `
                <tr>
                  <td style="text-align: center; font-weight: bold; color: #475569;">${rIdx + 1}</td>
                  ${row.map((cell) => `<td>${cell}</td>`).join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      } else if (sec.table && sec.table.rows.length === 0) {
        tableHtml = `<div class="empty-state">${isAr ? 'لا توجد بيانات مسجلة في هذا الجزء.' : 'No items recorded.'}</div>`;
      }

      let bulletsHtml = '';
      if (sec.bullets && sec.bullets.length > 0) {
        bulletsHtml = `
          <ul class="bullets-list">
            ${sec.bullets.map((b) => `<li>${b.replace(/^[•\s\-\*\u2022]+/g, '')}</li>`).join('')}
          </ul>
        `;
      }

      let textHtml = '';
      if (sec.textBlock) {
        textHtml = `<div class="text-block">${sec.textBlock}</div>`;
      }

      // Traditional formal section titles in Arabic (أولاً، ثانياً، ثالثاً...)
      const arNumerals = ['أولاً', 'ثانياً', 'ثالثاً', 'رابعاً', 'خامساً', 'سادساً', 'سابعاً', 'ثامناً'];
      const sectionNumPrefix = isAr
        ? arNumerals[idx] || `${idx + 1}`
        : `Section ${idx + 1}`;

      return `
        <div class="section-block">
          <h2 class="section-title">${sectionNumPrefix}: ${sec.title}</h2>
          ${metricsHtml}
          ${textHtml}
          ${bulletsHtml}
          ${tableHtml}
        </div>
      `;
    })
    .join('');

  const fullHtml = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Traditional Arabic', 'Times New Roman', serif, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      padding: 30px 15px;
      line-height: 1.7;
      direction: ${dir};
      -webkit-print-color-adjust: exact;
    }
    .print-actions {
      max-width: 850px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
    }
    .btn-print {
      background: #0f172a;
      color: #ffffff;
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 22px;
      border-radius: 6px;
      border: 1px solid #0f172a;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-print:hover { background: #334155; }
    
    .report-paper {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 48px 56px;
      color: #0f172a;
    }

    /* Traditional Document Header */
    .document-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .doc-type-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 13px;
      color: #334155;
      font-weight: 600;
    }
    .doc-meta {
      font-size: 12px;
      color: #475569;
      text-align: ${isAr ? 'left' : 'right'};
      line-height: 1.5;
    }

    /* Section Styling - Plain Formal Document Style */
    .section-block {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #475569;
    }

    /* Formal Key-Value Information Table */
    .formal-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .formal-info-table td {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    .formal-info-table td.meta-label {
      font-weight: 700;
      background-color: #f8fafc;
      color: #334155;
      width: 22%;
    }
    .formal-info-table td.meta-value {
      color: #0f172a;
      width: 28%;
    }

    /* Formal Text & Paragraphs */
    .text-block {
      font-size: 13.5px;
      color: #0f172a;
      line-height: 1.8;
      margin-bottom: 12px;
      text-align: justify;
    }

    /* Formal Bullet Points */
    .bullets-list {
      padding-${isAr ? 'right' : 'left'}: 22px;
      margin-bottom: 14px;
      list-style-type: square;
    }
    .bullets-list li {
      font-size: 13.5px;
      color: #0f172a;
      line-height: 1.8;
      margin-bottom: 6px;
    }

    /* Formal Tables */
    .formal-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .formal-table th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      padding: 9px 12px;
      border: 1px solid #94a3b8;
      text-align: ${isAr ? 'right' : 'left'};
    }
    .formal-table td {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      color: #0f172a;
    }

    .empty-state {
      font-size: 12.5px;
      color: #64748b;
      font-style: italic;
      padding: 8px 0;
    }

    /* Traditional Document Footer */
    .document-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 14px;
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: #64748b;
    }

    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .report-paper {
        border: none;
        padding: 0;
        margin: 0;
        width: 100%;
        max-width: 100%;
      }
      .formal-info-table td.meta-label {
        background-color: #f1f5f9 !important;
        -webkit-print-color-adjust: exact;
      }
      .formal-table th {
        background-color: #f1f5f9 !important;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ ${isAr ? 'طباعة المستند / حفظ كـ PDF' : 'Print Document / Save as PDF'}</button>
  </div>

  <div class="report-paper">
    <div class="document-header">
      <div class="header-top">
        <div class="doc-type-title">
          <h1>${title}</h1>
          ${subtitle ? `<p class="doc-subtitle">${subtitle}</p>` : ''}
        </div>
        <div class="doc-meta">
          <div><strong>${isAr ? 'التاريخ:' : 'Date:'}</strong> ${dateStr}</div>
          <div><strong>${isAr ? 'نوع المستند:' : 'Type:'}</strong> ${isAr ? 'تقرير مقابلة إداري رسمي' : 'Official Interview Document'}</div>
        </div>
      </div>
    </div>

    ${sectionsHtml}

    <div class="document-footer">
      <div>${isAr ? 'تقرير مقابلة رسمي معتمد' : 'Official Interview Document'}</div>
      <div>${isAr ? 'صفحة 1 من 1' : 'Page 1 of 1'}</div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.html') ? filename : `${filename}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsvReport(filename: string, headers: string[], rows: (string | number)[][]) {
  const isAr = true;
  // Add UTF-8 BOM so Excel opens Arabic correctly in clear table columns
  let csvContent = '\uFEFF';
  csvContent += headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';

  rows.forEach((row) => {
    csvContent += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
