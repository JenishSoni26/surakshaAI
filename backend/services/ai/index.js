/**
 * @file index.js
 * @description Central facade & entry point for SurakshaAI Hybrid AI Intelligence Layer.
 * Orchestrates RuleEngine, ML Classifier, FusionEngine, ConfidenceEngine, ExplainEngine, and GeminiService.
 * Enforces the unified Standard Response Contract across all threat analyzers (Text, Voice, QR, UPI).
 */

const ruleEngine = require('./ruleEngine');
const modelLoader = require('./modelLoader');
const fusionEngine = require('./fusionEngine');
const confidenceEngine = require('./confidenceEngine');
const explainEngine = require('./explainEngine');
const geminiService = require('./geminiService');

class HybridAIService {
  /**
   * Helper to construct the unified Standard Response Contract across all analyzers.
   */
  async _orchestratePipeline({ input, inputType, ruleResult, inputContext = {} }) {
    // 1. Run ML Classifier via ModelLoader
    const classifier = modelLoader.getClassifier('default');
    const classifierResult = await classifier.classify(input);

    // 2. Intelligently fuse Rule Engine and Classifier outputs
    const fusionResult = fusionEngine.fuse(ruleResult, classifierResult);
    const fusedRiskLevel = fusionResult.fusedRiskLevel;
    const fusedScore = fusionResult.fusedScore;

    // 3. Compute normalized confidence score across engines
    const calculatedConfidence = confidenceEngine.calculate(fusionResult, ruleResult, inputContext);
    fusionResult.engine.fusion.confidence = calculatedConfidence;

    const detectedPatterns = ruleResult.detectedPatterns || [];

    // 4. Generate human-readable explanation & actionable advice (independent of Gemini)
    const { explanation, recommendation } = explainEngine.generate({
      riskLevel: fusedRiskLevel,
      detectedPatterns,
      ruleResult,
      fusionResult,
      inputType
    });

    // Determine status for backward compatibility ('blocked', 'flagged', 'safe', 'verified')
    let status = 'safe';
    if (ruleResult.status === 'verified') {
      status = 'verified';
    } else if (fusedRiskLevel === 'HIGH') {
      status = 'blocked';
    } else if (fusedRiskLevel === 'MEDIUM') {
      status = 'flagged';
    }

    const threatType = ruleResult.threat_type || ruleResult.threatType || (detectedPatterns[0] || (fusedRiskLevel === 'HIGH' ? 'High Risk Threat' : 'None'));

    // 5. Construct Standard Response Contract
    const standardResponse = {
      riskLevel: fusedRiskLevel,
      confidence: calculatedConfidence,
      detectedPatterns,
      explanation,
      recommendation,
      metadata: {
        inputType,
        ...(inputContext.metadata || {}),
        details: ruleResult.details || []
      },
      engine: fusionResult.engine,
      
      // Backward-compatible alias fields for database persistence & test suite
      riskScore: fusedScore,
      risk_score: fusedScore,
      status,
      threat_type: threatType,
      ai_explanation: explanation,
      reason: explanation
    };

    // 6. Optionally enrich via Gemini Service layer (modular placeholder)
    return await geminiService.enrichExplanation(standardResponse);
  }

  /**
   * Analyzes text / SMS messages.
   * @param {string} text 
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeMessage(text) {
    const ruleResult = ruleEngine.analyzeMessage(text);
    return await this._orchestratePipeline({
      input: text,
      inputType: 'sms',
      ruleResult,
      inputContext: {
        textLength: text ? text.length : 0,
        emptyInput: !text || typeof text !== 'string' || text.trim() === ''
      }
    });
  }

  /**
   * Analyzes real-time voice call features or transcripts.
   * @param {Object} features Acoustic DSP features or text transcript
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeVoice(features) {
    const ruleResult = ruleEngine.analyzeVoice(features);
    return await this._orchestratePipeline({
      input: features,
      inputType: 'voice',
      ruleResult,
      inputContext: {
        audioDuration: features?.durationSec || 0,
        emptyInput: !features
      }
    });
  }

  /**
   * Analyzes QR code payloads and URIs.
   * @param {string} url 
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeQR(url) {
    const ruleResult = ruleEngine.analyzeQR(url);
    return await this._orchestratePipeline({
      input: url,
      inputType: 'qr',
      ruleResult,
      inputContext: {
        emptyInput: !url
      }
    });
  }

  /**
   * Analyzes UPI IDs and payment handles.
   * @param {string} upiId 
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeUPI(upiId) {
    const ruleResult = ruleEngine.analyzeUPI(upiId);
    return await this._orchestratePipeline({
      input: upiId,
      inputType: 'upi',
      ruleResult,
      inputContext: {
        emptyInput: !upiId
      }
    });
  }
}

module.exports = new HybridAIService();
