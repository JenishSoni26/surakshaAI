/**
 * Metrics Calculation Engine for SurakshaAI Evaluation Framework
 */

function calculateMetrics(testResults) {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  let totalRiskScore = 0;
  const falsePositives = [];
  const falseNegatives = [];

  const categoryStats = {};
  const confusionMatrix = {
    SAFE: { SAFE: 0, MEDIUM: 0, HIGH: 0 },
    MEDIUM: { SAFE: 0, MEDIUM: 0, HIGH: 0 },
    HIGH: { SAFE: 0, MEDIUM: 0, HIGH: 0 },
  };

  const keywordCounts = {};

  testResults.forEach(item => {
    totalRiskScore += item.actualRiskScore;

    const exp = item.expected.toUpperCase();
    const act = item.actualClass.toUpperCase();

    // Confusion matrix entry
    if (confusionMatrix[exp] && confusionMatrix[exp][act] !== undefined) {
      confusionMatrix[exp][act]++;
    }

    // Category tracking init
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = {
        total: 0,
        passed: 0,
        failed: 0,
        tp: 0,
        tn: 0,
        fp: 0,
        fn: 0,
        avgRisk: 0,
        totalRisk: 0,
      };
    }
    const cat = categoryStats[item.category];
    cat.total++;
    cat.totalRisk += item.actualRiskScore;

    // Binary Classification Logic (Scam vs Safe)
    const isExpectedScam = exp === 'HIGH' || exp === 'MEDIUM';
    const isActualScam = act === 'HIGH' || act === 'MEDIUM';

    if (isExpectedScam && isActualScam) {
      tp++;
      cat.tp++;
      cat.passed++;
    } else if (!isExpectedScam && !isActualScam) {
      tn++;
      cat.tn++;
      cat.passed++;
    } else if (!isExpectedScam && isActualScam) {
      fp++;
      cat.fp++;
      cat.failed++;
      falsePositives.push(item);
    } else if (isExpectedScam && !isActualScam) {
      fn++;
      cat.fn++;
      cat.failed++;
      falseNegatives.push(item);
    }

    // Keyword Extraction for Scam Indicators
    if (isActualScam) {
      const keywords = ['otp', 'prize', 'lottery', 'verify', 'account', 'payment', 'kyc', 'bank', 'gift', 'upi', 'urgent', 'blocked', 'suspended', 'free', 'claim', 'cashback', 'fee', 'transfer', 'click', 'call'];
      const text = item.message.toLowerCase();
      keywords.forEach(kw => {
        if (text.includes(kw)) {
          keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        }
      });
    }
  });

  const total = testResults.length;
  const passed = tp + tn;
  const failed = fp + fn;

  const accuracy = total > 0 ? (passed / total) * 100 : 0;
  const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
  const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const avgRiskScore = total > 0 ? totalRiskScore / total : 0;

  // Process Category Breakdown
  Object.keys(categoryStats).forEach(c => {
    const cs = categoryStats[c];
    cs.accuracy = cs.total > 0 ? (cs.passed / cs.total) * 100 : 0;
    cs.precision = (cs.tp + cs.fp) > 0 ? (cs.tp / (cs.tp + cs.fp)) * 100 : 0;
    cs.recall = (cs.tp + cs.fn) > 0 ? (cs.tp / (cs.tp + cs.fn)) * 100 : 0;
    cs.avgRisk = cs.total > 0 ? cs.totalRisk / cs.total : 0;
  });

  // Top Detected Scam Indicators (Sorted)
  const topKeywords = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);

  // Automatic Recommendations
  const recommendations = generateRecommendations(accuracy, precision, recall, fp, fn, categoryStats);

  return {
    total,
    passed,
    failed,
    accuracy: parseFloat(accuracy.toFixed(2)),
    precision: parseFloat(precision.toFixed(2)),
    recall: parseFloat(recall.toFixed(2)),
    f1Score: parseFloat(f1Score.toFixed(2)),
    avgRiskScore: parseFloat(avgRiskScore.toFixed(2)),
    falsePositivesCount: fp,
    falseNegativesCount: fn,
    confusionMatrix,
    categoryStats,
    falsePositives,
    falseNegatives,
    topKeywords,
    recommendations,
  };
}

function generateRecommendations(accuracy, precision, recall, fp, fn, categoryStats) {
  const recs = [];

  if (fp > 0) {
    recs.push(`Reduce false positives (${fp} detected): Refine rule sensitivity for legitimate transactional messages containing financial terms.`);
  }

  if (fn > 0) {
    recs.push(`Improve scam detection coverage (${fn} missed scams): Enhance heuristics for novel social engineering and impersonation patterns.`);
  }

  if (categoryStats['Hard Cases'] && categoryStats['Hard Cases'].accuracy < 80) {
    recs.push(`Improve contextual understanding: Hard Cases category accuracy is ${categoryStats['Hard Cases'].accuracy.toFixed(1)}%. Transition to Gemini AI LLM reasoning to evaluate context beyond exact keyword triggers.`);
  }

  if (categoryStats['Social Engineering'] && categoryStats['Social Engineering'].accuracy < 80) {
    recs.push(`Enhance Social Engineering recognition: Current keyword rules struggle with urgency and impersonation tactics without explicit scam URLs.`);
  }

  if (accuracy < 90) {
    recs.push(`Integrate Gemini AI Model: Transition from rule-based regex patterns to LLM zero-shot prompt evaluation for semantic understanding of scam intent.`);
  }

  if (recs.length === 0) {
    recs.push('Maintain current rule performance and monitor emerging scam templates.');
  }

  return recs;
}

module.exports = { calculateMetrics };
