/**
 * @file fusionEngine.js
 * @description Fusion Engine for SurakshaAI Hybrid AI architecture.
 * Intelligently combines deterministic findings from RuleEngine with statistical predictions from ML Classifier.
 * Resolves conflicts, computes fused scores, and preserves engine breakdown for auditing.
 */

class FusionEngine {
  /**
   * Fuses rule-based analysis and machine learning classifier results.
   * @param {Object} ruleResult Output from RuleEngine
   * @param {Object} classifierResult Output from BaseClassifier implementation
   * @returns {Object} Fused analysis breakdown
   */
  fuse(ruleResult, classifierResult) {
    const ruleScore = typeof ruleResult?.riskScore === 'number' ? ruleResult.riskScore : (ruleResult?.risk_score || 0);
    
    // Normalize Rule risk level (HIGH, MEDIUM, LOW)
    let ruleRiskLevel = (ruleResult?.riskLevel || 'LOW').toUpperCase();
    if (ruleRiskLevel === 'SAFE') ruleRiskLevel = 'LOW';

    // Normalize Classifier risk level
    const classifierProb = typeof classifierResult?.probability === 'number' ? classifierResult.probability : 0.1;
    const classifierLabel = classifierResult?.label || 'BENIGN';
    
    let classifierRiskLevel = 'LOW';
    if (classifierLabel === 'SCAM' || classifierProb >= 0.70) {
      classifierRiskLevel = 'HIGH';
    } else if (classifierLabel === 'SUSPICIOUS' || classifierProb >= 0.40) {
      classifierRiskLevel = 'MEDIUM';
    }

    // ── Conflict Resolution & Score Fusion ─────────────────────────────────
    let fusedScore = Math.round((ruleScore * 0.7) + (classifierProb * 100 * 0.3));

    // Rule engine override: If deterministic rules spot explicit scam signatures or medium risk indicators, retain rule score minimum
    if (ruleRiskLevel === 'HIGH' || ruleRiskLevel === 'MEDIUM') {
      fusedScore = Math.max(fusedScore, ruleScore);
    } 
    // Classifier escalation: If ML classifier spots high risk even if rules only flagged low
    else if (ruleRiskLevel === 'LOW' && classifierRiskLevel === 'HIGH') {
      fusedScore = Math.max(fusedScore, 50);
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
    const classifierConf = classifierResult?.confidence || (classifierProb > 0.8 || classifierProb < 0.2 ? 0.90 : 0.75);

    return {
      fusedScore,
      fusedRiskLevel,
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
          probability: Number(classifierProb.toFixed(2))
        },
        fusion: {
          riskLevel: fusedRiskLevel,
          confidence: 0 // Will be set by confidenceEngine
        }
      }
    };
  }
}

module.exports = new FusionEngine();
