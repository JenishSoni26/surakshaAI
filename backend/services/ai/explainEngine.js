/**
 * @file explainEngine.js
 * @description Explanation Engine for SurakshaAI Hybrid AI architecture.
 * Synthesizes detected threat patterns, rule findings, and classifier outputs into clear,
 * human-readable explanations and actionable recommendations without requiring external APIs.
 */

class ExplainEngine {
  /**
   * Generates offline human-readable explanation and recommendations.
   * @param {Object} params
   * @param {string} params.riskLevel 'HIGH' | 'MEDIUM' | 'LOW'
   * @param {Array<string>} params.detectedPatterns
   * @param {Object} params.ruleResult
   * @param {Object} params.fusionResult
   * @param {string} params.inputType 'sms' | 'voice' | 'qr' | 'upi'
   * @returns {{explanation: string, recommendation: string}}
   */
  generate({ riskLevel, detectedPatterns = [], ruleResult = {}, fusionResult = {}, inputType = 'sms' }) {
    const reasons = ruleResult.reason ? [ruleResult.reason] : [];
    const patternsText = detectedPatterns.length > 0 ? detectedPatterns.join(', ') : 'None';

    let explanation = '';
    let recommendation = '';

    if (riskLevel === 'HIGH') {
      if (detectedPatterns.length > 0) {
        explanation = `High risk detected! Threat indicators found: ${patternsText}. ` +
          (ruleResult.reason ? ruleResult.reason : 'Message contains malicious phishing or fraud coercion patterns.');
      } else {
        explanation = `High risk detected! AI security engine flagged content with severe fraud probability.`;
      }

      if (inputType === 'upi' || inputType === 'qr') {
        recommendation = 'DO NOT transfer money or scan this payment QR code. Verify payee identity directly through official banking channels.';
      } else if (inputType === 'voice') {
        recommendation = 'Disconnect call immediately. Do not share OTPs, passwords, or personal details. Confirm caller identity via official numbers.';
      } else {
        recommendation = 'DO NOT click any links, share OTPs, or transfer money. Block sender and report to national Cyber Fraud Helpline 1930.';
      }
    } else if (riskLevel === 'MEDIUM') {
      if (detectedPatterns.length > 0) {
        explanation = `Suspicious patterns flagged: ${patternsText}. ` +
          (ruleResult.reason ? ruleResult.reason : 'Content exhibits characteristics commonly associated with scam attempts.');
      } else {
        explanation = `Suspicious activity flagged. Analysis detected potential risk anomalies requiring caution.`;
      }

      if (inputType === 'upi' || inputType === 'qr') {
        recommendation = 'Confirm payee name and bank details on payment screen before entering UPI PIN.';
      } else if (inputType === 'voice') {
        recommendation = 'Exercise caution. Verify suspicious requests directly through official bank customer support.';
      } else {
        recommendation = 'Exercise caution. Verify the sender through official channels before acting on urgent requests.';
      }
    } else {
      // LOW / SAFE
      if (detectedPatterns.some(p => p.toLowerCase().includes('verified'))) {
        explanation = ruleResult.reason || 'Verified legitimate provider handle. No suspicious indicators detected.';
      } else if (ruleResult.reason && !ruleResult.reason.includes('No suspicious')) {
        explanation = ruleResult.reason;
      } else {
        explanation = 'No suspicious scam indicators found. Content matches standard legitimate communication patterns.';
      }

      recommendation = 'Standard security practices apply. Never share your confidential UPI PIN or banking OTPs with anyone.';
    }

    return {
      explanation,
      recommendation
    };
  }
}

module.exports = new ExplainEngine();
