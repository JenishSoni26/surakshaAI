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
    const hasUrgency = /urgent|immediately|action required|blocked|suspended/i.test(text);
    const hasFinancial = /money|bank|lakh|crore|fee|transfer|cash|upi|account/i.test(text);
    
    let prob = 0.1;
    if (hasUrgency && hasFinancial) prob = 0.85;
    else if (hasUrgency || hasFinancial) prob = 0.45;

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
