/**
 * Automated Evaluation & Test Runner for SurakshaAI Scam Analyzer Engine
 *
 * Usage:
 *   node backend/tests/runTests.js [--mode Rule-Based|Gemini] [--endpoint http://localhost:3001/api/scans/message]
 */

const fs = require('fs');
const path = require('path');
const { calculateMetrics } = require('./metrics');
const { formatConsoleOutput, saveReports } = require('./utils');

// Parse CLI Arguments
const args = process.argv.slice(2);
let mode = 'Rule-Based';
let endpoint = 'http://localhost:3001/api/scans/message';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--mode' && args[i + 1]) {
    mode = args[i + 1];
    i++;
  } else if (args[i] === '--endpoint' && args[i + 1]) {
    endpoint = args[i + 1];
    i++;
  }
}

const DATASET_PATH = path.join(__dirname, 'datasets', 'scamMessages.json');
const REPORTS_DIR = path.join(__dirname, 'reports');

async function runSingleTest(item) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: item.message }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const riskScore = data.risk_score !== undefined ? data.risk_score : 0;
    const status = (data.status || 'safe').toLowerCase();

    let actualClass = 'SAFE';
    if (riskScore >= 70 || status === 'blocked') {
      actualClass = 'HIGH';
    } else if (riskScore >= 40 || status === 'flagged') {
      actualClass = 'MEDIUM';
    }

    return {
      id: item.id,
      category: item.category,
      subcategory: item.subcategory,
      message: item.message,
      expected: item.expected,
      actualClass,
      actualRiskScore: riskScore,
      actualStatus: status,
      actualThreat: data.threat_type || 'None',
      aiExplanation: data.ai_explanation || '',
    };
  } catch (err) {
    return {
      id: item.id,
      category: item.category,
      subcategory: item.subcategory,
      message: item.message,
      expected: item.expected,
      actualClass: 'ERROR',
      actualRiskScore: 0,
      actualStatus: 'error',
      actualThreat: err.message,
      aiExplanation: 'Request failed',
    };
  }
}

async function main() {
  console.log(`\n🚀 Starting SurakshaAI Evaluation Framework...`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🤖 Mode:     ${mode}`);

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`❌ Error: Dataset file not found at ${DATASET_PATH}`);
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  console.log(`📦 Loaded ${dataset.length} test cases from dataset.`);
  console.log(`⏳ Executing evaluations...\n`);

  const startTime = Date.now();
  const testResults = [];

  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    process.stdout.write(`\rProgress: [${i + 1}/${dataset.length}] Testing item #${item.id}...`);
    const result = await runSingleTest(item);
    testResults.push(result);
  }

  const executionTimeSeconds = (Date.now() - startTime) / 1000;
  console.log(`\n\n✅ Evaluation Complete in ${executionTimeSeconds.toFixed(2)}s.\n`);

  // Calculate Metrics
  const metrics = calculateMetrics(testResults);

  // Console Report Output
  const consoleOutput = formatConsoleOutput(mode, metrics, executionTimeSeconds);
  console.log(consoleOutput);

  // Save Files
  const savedFiles = saveReports(mode, metrics, executionTimeSeconds, testResults, REPORTS_DIR);

  console.log(`\n📁 Reports Generated & Saved:`);
  console.log(`   • Text Report: ${savedFiles.txtPath}`);
  console.log(`   • JSON Data:   ${savedFiles.jsonPath}`);
  console.log(`   • HTML Dash:   ${savedFiles.htmlPath}\n`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
