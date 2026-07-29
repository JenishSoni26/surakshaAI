/**
 * Comparison Engine for SurakshaAI Evaluation Framework
 * Compares Rule-Based vs Gemini AI Evaluation Reports
 *
 * Usage:
 *   node backend/tests/compareResults.js [--baseline rule-based-report.json] [--candidate gemini-report.json]
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, 'reports');

const args = process.argv.slice(2);
let baselineFile = path.join(REPORTS_DIR, 'rule-based-report.json');
let candidateFile = path.join(REPORTS_DIR, 'gemini-report.json');

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--baseline' && args[i + 1]) {
    baselineFile = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '--candidate' && args[i + 1]) {
    candidateFile = path.resolve(args[i + 1]);
    i++;
  }
}

function loadReport(filePath, fallbackName) {
  if (!fs.existsSync(filePath)) {
    // If exact name not found, try latest-report.json
    const latest = path.join(REPORTS_DIR, 'latest-report.json');
    if (fs.existsSync(latest)) {
      return JSON.parse(fs.readFileSync(latest, 'utf8'));
    }
    console.error(`❌ Error: Report file not found at ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function compare() {
  console.log(`\n====================================================`);
  console.log(`  SURAKSHAAI BENCHMARK COMPARISON: BASELINE vs AI   `);
  console.log(`====================================================\n`);

  const base = loadReport(baselineFile, 'Rule-Based');
  const cand = loadReport(candidateFile, 'Gemini AI');

  const bSum = base.summary;
  const cSum = cand.summary;

  const accDiff = cSum.accuracy - bSum.accuracy;
  const precDiff = cSum.precision - bSum.precision;
  const recDiff = cSum.recall - bSum.recall;
  const f1Diff = cSum.f1Score - bSum.f1Score;

  const fpDiff = bSum.falsePositivesCount - cSum.falsePositivesCount;
  const fpReductionPct = bSum.falsePositivesCount > 0 ? (fpDiff / bSum.falsePositivesCount) * 100 : 0;

  const fnDiff = bSum.falseNegativesCount - cSum.falseNegativesCount;
  const fnReductionPct = bSum.falseNegativesCount > 0 ? (fnDiff / bSum.falseNegativesCount) * 100 : 0;

  console.log(`Baseline Engine:    ${base.engine} (${new Date(base.timestamp).toLocaleDateString()})`);
  console.log(`Candidate Engine:   ${cand.engine} (${new Date(cand.timestamp).toLocaleDateString()})`);
  console.log(`----------------------------------------------------`);
  console.log(`METRIC                | BASELINE  | CANDIDATE | DIFF / IMPROVEMENT`);
  console.log(`----------------------------------------------------`);
  console.log(`Accuracy              | ${bSum.accuracy.toFixed(2).padStart(7)}% | ${cSum.accuracy.toFixed(2).padStart(7)}% | ${accDiff >= 0 ? '+' : ''}${accDiff.toFixed(2)}%`);
  console.log(`Precision             | ${bSum.precision.toFixed(2).padStart(7)}% | ${cSum.precision.toFixed(2).padStart(7)}% | ${precDiff >= 0 ? '+' : ''}${precDiff.toFixed(2)}%`);
  console.log(`Recall                | ${bSum.recall.toFixed(2).padStart(7)}% | ${cSum.recall.toFixed(2).padStart(7)}% | ${recDiff >= 0 ? '+' : ''}${recDiff.toFixed(2)}%`);
  console.log(`F1 Score              | ${bSum.f1Score.toFixed(2).padStart(7)}% | ${cSum.f1Score.toFixed(2).padStart(7)}% | ${f1Diff >= 0 ? '+' : ''}${f1Diff.toFixed(2)}%`);
  console.log(`False Positives       | ${bSum.falsePositivesCount.toString().padStart(8)}  | ${cSum.falsePositivesCount.toString().padStart(8)}  | ${fpDiff >= 0 ? '-' : '+'}${Math.abs(fpDiff)} (${fpReductionPct.toFixed(1)}% reduction)`);
  console.log(`False Negatives       | ${bSum.falseNegativesCount.toString().padStart(8)}  | ${cSum.falseNegativesCount.toString().padStart(8)}  | ${fnDiff >= 0 ? '-' : '+'}${Math.abs(fnDiff)} (${fnReductionPct.toFixed(1)}% reduction)`);
  console.log(`----------------------------------------------------\n`);

  console.log(`CATEGORY COMPARISON (ACCURACY %)`);
  console.log(`----------------------------------------------------`);
  console.log(`CATEGORY                  | BASELINE | CANDIDATE | DIFF`);
  console.log(`----------------------------------------------------`);

  const categories = Object.keys(base.categoryBreakdown);
  categories.forEach(cat => {
    const bAcc = base.categoryBreakdown[cat]?.accuracy || 0;
    const cAcc = cand.categoryBreakdown[cat]?.accuracy || 0;
    const diff = cAcc - bAcc;
    console.log(`${cat.padEnd(25)} | ${bAcc.toFixed(1).padStart(7)}% | ${cAcc.toFixed(1).padStart(7)}% | ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`);
  });

  console.log(`====================================================\n`);
}

compare();
