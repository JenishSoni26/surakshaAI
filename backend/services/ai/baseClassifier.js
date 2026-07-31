/**
 * @file baseClassifier.js
 * @description Abstract Base Classifier Interface & Heuristic Fallback Classifier for SurakshaAI.
 * Defines standard contract for loading and running ML models (TensorFlow, ONNX Runtime, Hugging Face).
 */

/**
 * Abstract Base Class for ML/Deep Learning Classifiers.
 */
class BaseClassifier {
  constructor(modelPath = null, options = {}) {
    if (new.target === BaseClassifier) {
      throw new Error('BaseClassifier is an abstract interface and cannot be instantiated directly.');
    }
    this.modelPath = modelPath;
    this.options = options;
    this.isLoaded = false;
  }

  /**
   * Asynchronously loads model artifacts (e.g. .onnx, .pb, .json weights).
   */
  async loadModel() {
    throw new Error('Abstract method loadModel() must be implemented by subclass.');
  }

  /**
   * Evaluates input and returns normalized classification probabilities.
   * @param {string|Object} input Raw text or feature vector
   * @returns {Promise<{label: string, probability: number, logits: Array<number>}>}
   */
  async classify(input) {
    throw new Error('Abstract method classify() must be implemented by subclass.');
  }
}

/**
 * Heuristic Fallback Classifier (Default implementation prior to ML model deployment).
 */
class HeuristicFallbackClassifier extends BaseClassifier {
  constructor() {
    super('builtin:fallback-heuristics');
    this.isLoaded = true;
  }

  async loadModel() {
    this.isLoaded = true;
    return true;
  }

  async classify(input) {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    const lower = text.toLowerCase();

    // Whitelist check for official transactional and OTP security notices
    const isOfficialNotice = /never share|do not share|don't share|secret otp for|available balance|debited from|credited to|out for delivery|order #|ticket booked|appointment confirmed|pnr \d+/i.test(lower);
    if (isOfficialNotice && !/share.*otp.*(to|with)|tell.*otp|click.*link|verify.*account|entering.*card|claim.*cashback/i.test(lower)) {
      return {
        label: 'BENIGN',
        probability: 0.05,
        logits: [0.95, 0.05],
        provider: 'HeuristicFallbackClassifier'
      };
    }

    const hasUrgency = /urgent|immediately|action required|blocked|suspended|expires|deactivated|hurry|today|tonight|within \d+/i.test(text);
    const hasFinancial = /money|bank|lakh|crore|fee|transfer|cash|upi|account|cashback|reward|fine|premium|challan|card|pin|otp|claim/i.test(text);
    const hasCredsOrLink = /pin|otp|cvv|password|click|link|verify|update|http|\.click|\.cf|\.top|\.review|\.xyz/i.test(text);
    
    let prob = 0.1;
    if (hasUrgency && hasFinancial && hasCredsOrLink) prob = 0.92;
    else if (hasUrgency && hasFinancial) prob = 0.80;
    else if (hasUrgency || hasFinancial) prob = 0.35;

    return {
      label: prob >= 0.7 ? 'SCAM' : prob >= 0.4 ? 'SUSPICIOUS' : 'BENIGN',
      probability: prob,
      logits: [1 - prob, prob],
      provider: 'HeuristicFallbackClassifier'
    };
  }
}

module.exports = {
  BaseClassifier,
  HeuristicFallbackClassifier: new HeuristicFallbackClassifier()
};
