/**
 * @file modelLoader.js
 * @description Dynamic model loader & registry for SurakshaAI classifiers.
 * Manages instantiation and lifecycle of BaseClassifier implementations (ONNX, HF, TF, Heuristic Fallback).
 */

const { HeuristicFallbackClassifier, BaseClassifier } = require('./baseClassifier');

class ModelLoader {
  constructor() {
    this.classifiers = new Map();
    // Default fallback classifier
    this.classifiers.set('default', HeuristicFallbackClassifier);
  }

  /**
   * Registers a new classifier model implementation.
   * @param {string} name 
   * @param {BaseClassifier} classifierInstance 
   */
  registerClassifier(name, classifierInstance) {
    if (!(classifierInstance instanceof BaseClassifier)) {
      throw new Error(`Classifier instance must inherit from BaseClassifier.`);
    }
    this.classifiers.set(name, classifierInstance);
  }

  /**
   * Retrieves a classifier instance by name (defaults to 'default').
   * @param {string} name 
   * @returns {BaseClassifier}
   */
  getClassifier(name = 'default') {
    const classifier = this.classifiers.get(name);
    if (!classifier) {
      console.warn(`Classifier '${name}' not found. Falling back to default HeuristicFallbackClassifier.`);
      return this.classifiers.get('default');
    }
    return classifier;
  }

  /**
   * Asynchronously initializes/loads all registered model artifacts.
   */
  async loadAll() {
    for (const [name, classifier] of this.classifiers.entries()) {
      try {
        await classifier.loadModel();
      } catch (err) {
        console.error(`Failed to load model '${name}':`, err.message);
      }
    }
  }
}

module.exports = new ModelLoader();
