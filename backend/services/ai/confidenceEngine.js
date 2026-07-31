/**
 * @file confidenceEngine.js
 * @description Confidence Engine for SurakshaAI Hybrid AI architecture.
 * Calculates unified, normalized confidence scores across all threat analyzers (Text, Voice, QR, UPI).
 */

class ConfidenceEngine {
  /**
   * Calculates standardized confidence score for an evaluation result.
   * @param {Object} fusionOutput Output from FusionEngine
   * @param {Object} ruleResult Output from RuleEngine
   * @param {Object} inputContext Input metadata (text length, audio duration, whitelist status)
   * @returns {number} Standardized confidence (0.00 to 1.00)
   */
  calculate(fusionOutput, ruleResult, inputContext = {}) {
    const { engine, fusedRiskLevel } = fusionOutput;
    const ruleRisk = engine?.rule?.riskLevel || 'LOW';
    const classRisk = engine?.classifier?.riskLevel || 'LOW';
    const detectedPatterns = ruleResult?.detectedPatterns || [];
    
    let confidence = 0.85;

    // ── 1. Engine Agreement & Concurrence ─────────────────────────
    if (ruleRisk === classRisk) {
      // Both engines strongly agree
      confidence += 0.08;
    } else if (
      (ruleRisk === 'HIGH' && classRisk === 'MEDIUM') ||
      (ruleRisk === 'MEDIUM' && classRisk === 'HIGH') ||
      (ruleRisk === 'MEDIUM' && classRisk === 'LOW') ||
      (ruleRisk === 'LOW' && classRisk === 'MEDIUM')
    ) {
      // Adjacent risk levels - moderate agreement
      confidence += 0.02;
    } else {
      // Engine disagreement (LOW vs HIGH) - lower confidence due to uncertainty
      confidence -= 0.10;
    }

    // ── 2. Indicator Pattern Density ──────────────────────────────
    if (detectedPatterns.length >= 3) {
      confidence += 0.05;
    } else if (detectedPatterns.length >= 1) {
      confidence += 0.03;
    }

    // ── 3. Whitelist Exclusions & High-Trust Signals ─────────────
    const isVerifiedWhitelist = detectedPatterns.some(p => 
      p.toLowerCase().includes('verified') || p.toLowerCase().includes('valid bank')
    );
    if (isVerifiedWhitelist) {
      confidence = Math.max(confidence, 0.95);
    }

    // ── 4. Input Quality & Signal Penalties ──────────────────────
    if (inputContext.emptyInput) {
      confidence = 1.0; // 100% confident that empty input is not valid
    } else if (inputContext.textLength && inputContext.textLength < 15 && detectedPatterns.length === 0) {
      confidence -= 0.08; // Short text without clear patterns has higher ambiguity
    } else if (inputContext.audioDuration && inputContext.audioDuration < 1.2) {
      confidence -= 0.10; // Very short audio clip reduces acoustic confidence
    }

    // Normalize confidence between 0.50 and 0.99
    return Number(Math.min(Math.max(confidence, 0.50), 0.99).toFixed(2));
  }
}

module.exports = new ConfidenceEngine();
