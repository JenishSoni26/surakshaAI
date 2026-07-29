/**
 * Output Formatting & Report Generation Utilities for SurakshaAI Evaluation Framework
 */

const fs = require('fs');
const path = require('path');

function formatConsoleOutput(mode, metrics, executionTimeSeconds) {
  const dateStr = new Date().toLocaleString('en-IN');
  let output = '';

  output += '====================================================\n';
  output += '       SURAKSHAAI AUTOMATED EVALUATION REPORT       \n';
  output += '====================================================\n';
  output += `Engine:               ${mode}\n`;
  output += `Date:                 ${dateStr}\n`;
  output += `Execution Time:       ${executionTimeSeconds.toFixed(2)}s\n`;
  output += '----------------------------------------------------\n';
  output += `Total Tests:          ${metrics.total}\n`;
  output += `Passed:               ${metrics.passed}\n`;
  output += `Failed:               ${metrics.failed}\n`;
  output += `Accuracy:             ${metrics.accuracy.toFixed(2)}%\n`;
  output += `Precision:            ${metrics.precision.toFixed(2)}%\n`;
  output += `Recall:               ${metrics.recall.toFixed(2)}%\n`;
  output += `F1 Score:             ${metrics.f1Score.toFixed(2)}%\n`;
  output += `Average Risk Score:   ${metrics.avgRiskScore.toFixed(2)} / 100\n`;
  output += '----------------------------------------------------\n';
  output += 'CATEGORY BREAKDOWN\n';
  output += '----------------------------------------------------\n';

  Object.entries(metrics.categoryStats).forEach(([cat, cs]) => {
    output += `${cat.padEnd(25)} | Acc: ${cs.accuracy.toFixed(1).padStart(5)}% | Pass: ${cs.passed}/${cs.total} | Avg Risk: ${cs.avgRisk.toFixed(1)}\n`;
  });

  output += '----------------------------------------------------\n';
  output += `FALSE POSITIVES (${metrics.falsePositivesCount})\n`;
  output += '----------------------------------------------------\n';
  if (metrics.falsePositives.length === 0) {
    output += 'None! All legitimate messages correctly identified as SAFE.\n';
  } else {
    metrics.falsePositives.forEach((fp, idx) => {
      output += `[${idx + 1}] ID #${fp.id} (${fp.category})\n`;
      output += `    Message:  "${fp.message}"\n`;
      output += `    Expected: ${fp.expected} | Actual: ${fp.actualClass} (Risk: ${fp.actualRiskScore}/100, Status: ${fp.actualStatus})\n`;
    });
  }

  output += '----------------------------------------------------\n';
  output += `FALSE NEGATIVES (${metrics.falseNegativesCount})\n`;
  output += '----------------------------------------------------\n';
  if (metrics.falseNegatives.length === 0) {
    output += 'None! All scam messages correctly flagged/blocked.\n';
  } else {
    metrics.falseNegatives.forEach((fn, idx) => {
      output += `[${idx + 1}] ID #${fn.id} (${fn.category})\n`;
      output += `    Message:  "${fn.message}"\n`;
      output += `    Expected: ${fn.expected} | Actual: ${fn.actualClass} (Risk: ${fn.actualRiskScore}/100, Status: ${fn.actualStatus})\n`;
    });
  }

  output += '----------------------------------------------------\n';
  output += 'TOP DETECTED SCAM INDICATORS\n';
  output += '----------------------------------------------------\n';
  metrics.topKeywords.slice(0, 10).forEach(kw => {
    output += `• ${kw.keyword.toUpperCase().padEnd(15)} : ${kw.count} occurrences\n`;
  });

  output += '====================================================\n';
  output += 'AUTOMATIC RECOMMENDATIONS\n';
  output += '====================================================\n';
  metrics.recommendations.forEach((rec, idx) => {
    output += `${idx + 1}. ${rec}\n`;
  });
  output += '====================================================\n';

  return output;
}

function saveReports(mode, metrics, executionTimeSeconds, rawResults, reportsDir) {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const textOutput = formatConsoleOutput(mode, metrics, executionTimeSeconds);
  const txtPath = path.join(reportsDir, 'latest-report.txt');
  fs.writeFileSync(txtPath, textOutput, 'utf8');

  const jsonReport = {
    engine: mode,
    timestamp: new Date().toISOString(),
    executionTimeSeconds,
    summary: {
      total: metrics.total,
      passed: metrics.passed,
      failed: metrics.failed,
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1Score,
      avgRiskScore: metrics.avgRiskScore,
      falsePositivesCount: metrics.falsePositivesCount,
      falseNegativesCount: metrics.falseNegativesCount,
    },
    confusionMatrix: metrics.confusionMatrix,
    categoryBreakdown: metrics.categoryStats,
    topKeywords: metrics.topKeywords,
    recommendations: metrics.recommendations,
    falsePositives: metrics.falsePositives,
    falseNegatives: metrics.falseNegatives,
    results: rawResults,
  };

  const jsonPath = path.join(reportsDir, 'latest-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');

  // Also save a specific engine file e.g. rule-based-report.json for comparison mode
  const engineJsonName = mode.toLowerCase().includes('gemini') ? 'gemini-report.json' : 'rule-based-report.json';
  fs.writeFileSync(path.join(reportsDir, engineJsonName), JSON.stringify(jsonReport, null, 2), 'utf8');

  // Generate HTML Dashboard
  const htmlDashboard = generateHtmlDashboard(jsonReport);
  const htmlPath = path.join(reportsDir, 'dashboard.html');
  fs.writeFileSync(htmlPath, htmlDashboard, 'utf8');

  return { txtPath, jsonPath, htmlPath };
}

function generateHtmlDashboard(report) {
  const summary = report.summary;
  const cats = report.categoryBreakdown;

  const catLabels = JSON.stringify(Object.keys(cats));
  const catAccuracies = JSON.stringify(Object.values(cats).map(c => c.accuracy));
  const catRisks = JSON.stringify(Object.values(cats).map(c => c.avgRisk));

  const fpRows = report.falsePositives.map(fp => `
    <tr>
      <td class="px-4 py-2 font-mono text-xs text-blue-600">#${fp.id}</td>
      <td class="px-4 py-2 text-xs font-semibold text-gray-700">${fp.category}</td>
      <td class="px-4 py-2 text-xs text-gray-900 max-w-xs truncate" title="${fp.message.replace(/"/g, '&quot;')}">${fp.message}</td>
      <td class="px-4 py-2"><span class="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">${fp.expected}</span></td>
      <td class="px-4 py-2"><span class="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded-full">${fp.actualClass} (${fp.actualRiskScore})</span></td>
    </tr>
  `).join('');

  const fnRows = report.falseNegatives.map(fn => `
    <tr>
      <td class="px-4 py-2 font-mono text-xs text-blue-600">#${fn.id}</td>
      <td class="px-4 py-2 text-xs font-semibold text-gray-700">${fn.category}</td>
      <td class="px-4 py-2 text-xs text-gray-900 max-w-xs truncate" title="${fn.message.replace(/"/g, '&quot;')}">${fn.message}</td>
      <td class="px-4 py-2"><span class="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded-full">${fn.expected}</span></td>
      <td class="px-4 py-2"><span class="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">${fn.actualClass} (${fn.actualRiskScore})</span></td>
    </tr>
  `).join('');

  const recList = report.recommendations.map(r => `<li class="py-1 text-sm text-gray-700 flex items-start gap-2"><span class="text-blue-600 font-bold">•</span><span>${r}</span></li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SurakshaAI Evaluation Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
  </style>
</head>
<body class="p-6 md:p-10">
  <div class="max-w-7xl mx-auto space-y-8">

    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
          Evaluation Report
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight">SurakshaAI Security Engine</h1>
        <p class="text-blue-200 text-sm mt-1">Automated Test Bench & Accuracy Dashboard</p>
      </div>
      <div class="text-left md:text-right bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
        <div class="text-xs text-blue-200">Engine Mode</div>
        <div class="text-xl font-bold text-white">${report.engine}</div>
        <div class="text-[10px] text-blue-300 mt-1">${new Date(report.timestamp).toLocaleString()}</div>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Accuracy</div>
        <div class="text-3xl font-black text-blue-600">${summary.accuracy}%</div>
        <div class="text-xs text-gray-400 mt-1">${summary.passed} / ${summary.total} tests passed</div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Precision</div>
        <div class="text-3xl font-black text-indigo-600">${summary.precision}%</div>
        <div class="text-xs text-gray-400 mt-1">True Positive Accuracy</div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recall</div>
        <div class="text-3xl font-black text-purple-600">${summary.recall}%</div>
        <div class="text-xs text-gray-400 mt-1">Scam Detection Rate</div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">F1 Score</div>
        <div class="text-3xl font-black text-emerald-600">${summary.f1Score}%</div>
        <div class="text-xs text-gray-400 mt-1">Harmonic Mean</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-base font-bold text-gray-900 mb-4">Category Accuracy Breakdown</h3>
        <div class="h-64 relative">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-base font-bold text-gray-900 mb-4">Confusion Matrix</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-center border-collapse">
            <thead>
              <tr class="bg-gray-50 text-xs text-gray-500 font-semibold">
                <th class="p-3 text-left">Actual &rarr;<br>Expected &darr;</th>
                <th class="p-3">SAFE</th>
                <th class="p-3">MEDIUM</th>
                <th class="p-3">HIGH</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm font-medium">
              <tr>
                <td class="p-3 text-left font-bold text-gray-700 bg-gray-50">SAFE</td>
                <td class="p-3 bg-emerald-50 text-emerald-700 font-bold">${report.confusionMatrix.SAFE.SAFE}</td>
                <td class="p-3 bg-amber-50 text-amber-700">${report.confusionMatrix.SAFE.MEDIUM}</td>
                <td class="p-3 bg-rose-50 text-rose-700">${report.confusionMatrix.SAFE.HIGH}</td>
              </tr>
              <tr>
                <td class="p-3 text-left font-bold text-gray-700 bg-gray-50">HIGH / SCAM</td>
                <td class="p-3 bg-rose-50 text-rose-700">${report.confusionMatrix.HIGH.SAFE}</td>
                <td class="p-3 bg-amber-50 text-amber-700">${report.confusionMatrix.HIGH.MEDIUM}</td>
                <td class="p-3 bg-emerald-50 text-emerald-700 font-bold">${report.confusionMatrix.HIGH.HIGH}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 flex justify-around text-xs text-gray-500">
          <div>False Positives: <strong class="text-red-600">${summary.falsePositivesCount}</strong></div>
          <div>False Negatives: <strong class="text-orange-600">${summary.falseNegativesCount}</strong></div>
        </div>
      </div>
    </div>

    <!-- False Positives & Negatives Tables -->
    ${summary.falsePositivesCount > 0 ? `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-base font-bold text-red-600 mb-3">False Positives (${summary.falsePositivesCount}) — Safe Messages Flagged as Scams</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400">
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Category</th>
              <th class="px-4 py-2">Message</th>
              <th class="px-4 py-2">Expected</th>
              <th class="px-4 py-2">Actual</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${fpRows}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    ${summary.falseNegativesCount > 0 ? `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-base font-bold text-orange-600 mb-3">False Negatives (${summary.falseNegativesCount}) — Scams Missed as Safe</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400">
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Category</th>
              <th class="px-4 py-2">Message</th>
              <th class="px-4 py-2">Expected</th>
              <th class="px-4 py-2">Actual</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${fnRows}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    <!-- Recommendations -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-base font-bold text-gray-900 mb-3">Automatic Engine Recommendations</h3>
      <ul class="space-y-2">
        ${recList}
      </ul>
    </div>

  </div>

  <script>
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${catLabels},
        datasets: [{
          label: 'Accuracy %',
          data: ${catAccuracies},
          backgroundColor: '#3b82f6',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 100 }
        }
      }
    });
  </script>
</body>
</html>`;
}

module.exports = { formatConsoleOutput, saveReports };
