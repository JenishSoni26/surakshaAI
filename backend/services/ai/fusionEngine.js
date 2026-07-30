/**
 * @file fusionEngine.js
 * @description Fusion Engine for SurakshaAI Hybrid AI architecture.
 * Intelligently combines deterministic findings from RuleEngine with statistical predictions from production ML Classifier (LinearSVC Hybrid TF-IDF).
 */

class FusionEngine {
  /**
   * Fuses rule-based analysis and machine learning classifier results.
   * @param {Object} ruleResult Output from RuleEngine
   * @param {Object} classifierResult Output from RealMLClassifier / BaseClassifier
   * @returns {Object} Fused analysis breakdown
   */
  fuse(ruleResult, classifierResult) {
    const ruleScore = typeof ruleResult?.riskScore === 'number' ? ruleResult.riskScore : (ruleResult?.risk_score || 0);
    
    // Normalize Rule risk level (HIGH, MEDIUM, LOW)
    let ruleRiskLevel = (ruleResult?.riskLevel || 'LOW').toUpperCase();
    if (ruleRiskLevel === 'SAFE') ruleRiskLevel = 'LOW';

    // Normalize Classifier risk level & scores
    const classifierProb = typeof classifierResult?.prob_scam === 'number' 
      ? classifierResult.prob_scam 
      : (typeof classifierResult?.probability === 'number' ? classifierResult.probability : 0.1);
    
    const classifierLabel = classifierResult?.prediction || classifierResult?.label || 'SAFE';
    const rawScore = typeof classifierResult?.raw_score === 'number' ? classifierResult.raw_score : 0.0;
    const modelVersion = classifierResult?.model_version || 'LinearSVC-Hybrid-v1.0';

    let classifierRiskLevel = 'LOW';
    if (classifierLabel === 'SCAM' || classifierProb >= 0.70) {
      classifierRiskLevel = 'HIGH';
    } else if (classifierLabel === 'SUSPICIOUS' || classifierProb >= 0.40) {
      classifierRiskLevel = 'MEDIUM';
    }

    // ── Scenario Fusion Logic (Task 4) ───────────────────────────────────────
    let fusedScore = 0;
    
    if (ruleRiskLevel === 'HIGH' && classifierRiskLevel === 'HIGH') {
      // Scenario 1: Rule High + ML High -> High Confidence Scam
      fusedScore = Math.max(95, Math.round(ruleScore * 0.6 + classifierProb * 100 * 0.4));
    } else if (ruleRiskLevel === 'HIGH' && classifierRiskLevel !== 'HIGH') {
      // Scenario 2: Rule High + ML Low -> Rule Override / Mixed Result (Deterministic priority)
      fusedScore = Math.max(85, ruleScore);
    } else if (ruleRiskLevel !== 'HIGH' && classifierRiskLevel === 'HIGH') {
      // Scenario 3: Rule Low + ML High -> ML Alert (Medium/High)
      fusedScore = Math.max(75, Math.round(classifierProb * 100));
    } else {
      // Scenario 4: Rule Low + ML Low -> Safe
      fusedScore = Math.min(ruleScore, Math.round(classifierProb * 100));
    }

    fusedScore = Math.min(Math.max(fusedScore, 0), 100);

    // Determine final Fused Risk Level
    let fusedRiskLevel = 'LOW';
    if (fusedScore >= 70) {
      fusedRiskLevel = 'HIGH';
    } else if (fusedScore >= 40) {
      fusedRiskLevel = 'MEDIUM';
    }

    // Normalize confidence values
    const ruleConf = ruleResult?.confidence || (ruleResult?.detectedPatterns?.length > 0 ? 0.95 : 0.85);
    const classifierConf = classifierResult?.confidence || (classifierProb > 0.8 || classifierProb < 0.2 ? 0.94 : 0.75);

    const mlObject = {
      model: "LinearSVC Hybrid TF-IDF",
      model_version: modelVersion,
      prediction: classifierLabel,
      confidence: Number(classifierConf.toFixed(4)),
      decision_score: Number(rawScore.toFixed(4)),
      prob_scam: Number(classifierProb.toFixed(4)),
      provider: classifierResult?.provider || "LinearSVCHybridClassifier"
    };

    return {
      fusedScore,
      fusedRiskLevel,
      ml: mlObject,
      engine: {
        rule: {
          riskLevel: ruleRiskLevel === 'LOW' ? 'LOW' : ruleRiskLevel,
          confidence: Number(ruleConf.toFixed(2)),
          score: ruleScore
        },
        classifier: {
          riskLevel: classifierRiskLevel,
          confidence: Number(classifierConf.toFixed(2)),
          label: classifierLabel,
          probability: Number(classifierProb.toFixed(2)),
          raw_score: Number(rawScore.toFixed(4))
        },
        ml: mlObject,
        fusion: {
          riskLevel: fusedRiskLevel,
          confidence: 0 // Will be set by confidenceEngine
        }
      }
    };
  }
}

module.exports = new FusionEngine();
