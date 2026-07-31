/**
 * @file modelLoader.js
 * @description Dynamic model loader & registry for SurakshaAI classifiers.
 * Manages instantiation and lifecycle of BaseClassifier implementations (LinearSVC ML, Heuristic Fallback).
 */

const { HeuristicFallbackClassifier, BaseClassifier } = require('./baseClassifier');
const realMLClassifier = require('./mlClassifier');

class ModelLoader {
  constructor() {
    this.classifiers = new Map();
    // Default fallback classifier
    this.classifiers.set('fallback', HeuristicFallbackClassifier);
    this.classifiers.set('default', realMLClassifier);
    this.classifiers.set('ml', realMLClassifier);
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
      return this.classifiers.get('fallback');
    }
    return classifier;
  }

  /**
   * Asynchronously initializes/loads all registered model artifacts.
   */
  async loadAll() {
    for (const [name, classifier] of this.classifiers.entries()) {
      try {
        if (!classifier.isLoaded) {
          await classifier.loadModel();
        }
      } catch (err) {
        console.error(`Failed to load model '${name}':`, err.message);
      }
    }
  }
}

const instance = new ModelLoader();
// Automatically trigger background loading
instance.loadAll().catch(err => console.error('[ModelLoader] Initialization error:', err.message));

module.exports = instance;
