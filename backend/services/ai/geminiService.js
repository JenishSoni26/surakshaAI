/**
 * @file geminiService.js
 * @description Gemini AI Service Layer for SurakshaAI.
 * Modular service wrapper for Gemini LLM capabilities.
 * 
 * IMPORTANT ARCHITECTURAL REQUIREMENT:
 * Gemini is ONLY responsible for:
 *   1. Natural language explanation rewriting
 *   2. Financial safety guidance & preventive measures
 *   3. Recommending relevant cyber education modules
 * 
 * Gemini MUST NOT determine risk levels or scam classification (handled by Fusion & Rule Engines).
 * (Note: Placeholder service layer for Phase 2B; live network API calls are disabled until key configuration).
 */

const { buildMessageAnalysisPrompt, buildUPIAnalysisPrompt, buildVoiceTranscriptPrompt } = require('./promptTemplates');

class GeminiService {
  constructor() {
    this.isConfigured = false; // Set to true when API key is loaded
  }

  /**
   * Enriches analysis outputs with natural language guidance and learning recommendations.
   * @param {Object} analysis Standard response object produced by Hybrid AI pipeline
   * @returns {Promise<Object>} Enriched output (passes through if Gemini is offline)
   */
  async enrichExplanation(analysis) {
    // If Gemini live API is not configured, return analysis enriched with template advisory
    const recommendedModules = this.recommendLearningModules(analysis.riskLevel, analysis.detectedPatterns);
    
    return {
      ...analysis,
      geminiEnriched: false,
      safetyGuidance: this.getSafetyGuidance(analysis.riskLevel),
      recommendedModules
    };
  }

  /**
   * Recommends relevant educational course categories based on detected threat patterns.
   * @param {string} riskLevel 
   * @param {Array<string>} detectedPatterns 
   * @returns {Array<string>} List of recommended module titles/categories
   */
  recommendLearningModules(riskLevel, detectedPatterns = []) {
    const modules = [];
    const patternsLower = detectedPatterns.join(' ').toLowerCase();

    if (patternsLower.includes('tld') || patternsLower.includes('phishing') || patternsLower.includes('link')) {
      modules.push('Identifying Phishing SMS');
    }
    if (patternsLower.includes('upi') || patternsLower.includes('vpa') || patternsLower.includes('handle')) {
      modules.push('Safe UPI Practices');
    }
    if (patternsLower.includes('qr')) {
      modules.push('QR Code Safety');
    }
    if (patternsLower.includes('voice') || patternsLower.includes('pitch') || patternsLower.includes('deepfake')) {
      modules.push('Voice Call Scams');
    }
    if (patternsLower.includes('otp') || patternsLower.includes('credential')) {
      modules.push('Digital Banking Security');
    }

    if (modules.length === 0) {
      if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
        modules.push('Identifying Phishing SMS', 'Safe UPI Practices');
      } else {
        modules.push('Digital Banking Security');
      }
    }

    return modules;
  }

  /**
   * Returns general safety guidance based on risk level.
   * @param {string} riskLevel 
   * @returns {string}
   */
  getSafetyGuidance(riskLevel) {
    if (riskLevel === 'HIGH') {
      return 'Critical Risk Alert: Stop interaction immediately. Do not click links, scan QR codes, or share credentials. Call 1930 Cyber Helpline to report.';
    } else if (riskLevel === 'MEDIUM') {
      return 'Cautionary Advisory: Verify the source independently through official contact numbers before proceeding with any action.';
    }
    return 'Standard Safe Security Practice: Keep passwords unique and never share your confidential UPI PIN with anyone.';
  }
}

module.exports = new GeminiService();
