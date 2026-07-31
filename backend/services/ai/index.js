/**
 * @file index.js
 * @description Central facade & entry point for SurakshaAI Hybrid AI Intelligence Layer.
 * Orchestrates RuleEngine, Real ML Classifier (LinearSVC Hybrid TF-IDF), FusionEngine, ConfidenceEngine, ExplainEngine, and GeminiService.
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
    const lang = inputContext.lang || 'en';

    // Ensure models are loaded
    if (!modelLoader.getClassifier('ml').isLoaded) {
      await modelLoader.loadAll();
    }

    // 1. Run Real ML Classifier (LinearSVC Hybrid TF-IDF) via ModelLoader
    const classifier = modelLoader.getClassifier('ml');
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
      inputType,
      lang
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
      ml: fusionResult.ml || {
        model: "LinearSVC Hybrid TF-IDF",
        confidence: classifierResult.confidence || 0.94,
        decision_score: classifierResult.raw_score || 0.0
      },
      
      // Backward-compatible alias fields for database persistence & test suite
      riskScore: fusedScore,
      risk_score: fusedScore,
      status,
      threat_type: threatType,
      ai_explanation: explanation,
      reason: explanation
    };

    // 6. Optionally enrich via Gemini Service layer
    return await geminiService.enrichExplanation(standardResponse, { lang });
  }

  /**
   * Analyzes text / SMS messages.
   * @param {string} text 
   * @param {Object} options { lang }
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeMessage(text, options = {}) {
    const ruleResult = ruleEngine.analyzeMessage(text);
    return await this._orchestratePipeline({
      input: text,
      inputType: 'sms',
      ruleResult,
      inputContext: {
        lang: options.lang || 'en',
        textLength: text ? text.length : 0,
        emptyInput: !text || typeof text !== 'string' || text.trim() === ''
      }
    });
  }

  /**
   * Analyzes real-time voice call features or transcripts.
   * @param {Object} features Acoustic DSP features or text transcript
   * @param {Object} options { lang }
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeVoice(features, options = {}) {
    const ruleResult = ruleEngine.analyzeVoice(features);
    return await this._orchestratePipeline({
      input: features,
      inputType: 'voice',
      ruleResult,
      inputContext: {
        lang: options.lang || 'en',
        audioDuration: features?.durationSec || 0,
        emptyInput: !features
      }
    });
  }

  /**
   * Analyzes QR code payloads and URIs.
   * @param {string} url 
   * @param {Object} options { lang }
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeQR(url, options = {}) {
    const ruleResult = ruleEngine.analyzeQR(url);
    return await this._orchestratePipeline({
      input: url,
      inputType: 'qr',
      ruleResult,
      inputContext: {
        lang: options.lang || 'en',
        emptyInput: !url
      }
    });
  }

  /**
   * Analyzes UPI IDs and payment handles.
   * @param {string} upiId 
   * @param {Object} options { lang }
   * @returns {Promise<Object>} Standard Response Object
   */
  async analyzeUPI(upiId, options = {}) {
    const ruleResult = ruleEngine.analyzeUPI(upiId);
    return await this._orchestratePipeline({
      input: upiId,
      inputType: 'upi',
      ruleResult,
      inputContext: {
        lang: options.lang || 'en',
        emptyInput: !upiId
      }
    });
  }
}

module.exports = new HybridAIService();
