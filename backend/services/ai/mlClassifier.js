/**
 * @file mlClassifier.js
 * @description Real Machine Learning Classifier for SurakshaAI using persistent LinearSVC Hybrid TF-IDF Python Daemon.
 */

const path = require('path');
const { spawn } = require('child_process');
const { BaseClassifier, HeuristicFallbackClassifier } = require('./baseClassifier');

class RealMLClassifier extends BaseClassifier {
  constructor() {
    super(path.join(__dirname, 'models', 'baseline_model.pkl'));
    this.pythonProcess = null;
    this.isLoaded = false;
    this.pendingCallbacks = new Map();
    this.seqId = 0;
  }

  /**
   * Initializes persistent Python inference daemon and loads model artifacts into memory once at startup.
   */
  async loadModel() {
    if (this.isLoaded) return true;

    return new Promise((resolve) => {
      const daemonPath = path.join(__dirname, 'models', 'predict_daemon.py');
      
      try {
        this.pythonProcess = spawn('python', [daemonPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let initialized = false;

        this.pythonProcess.stdout.on('data', (data) => {
          const lines = data.toString().split('\n').filter(l => l.trim().length > 0);
          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              if (!initialized && msg.status === 'READY') {
                initialized = true;
                this.isLoaded = true;
                console.log('[MLClassifier] Production LinearSVC Hybrid TF-IDF Model Loaded Successfully.');
                resolve(true);
              } else if (!initialized && msg.status === 'ERROR') {
                console.error('[MLClassifier] Failed to load ML model:', msg.message);
                this.isLoaded = false;
                resolve(false);
              } else if (msg.id && this.pendingCallbacks.has(msg.id)) {
                const cb = this.pendingCallbacks.get(msg.id);
                this.pendingCallbacks.delete(msg.id);
                cb(msg);
              }
            } catch (err) {
              console.error('[MLClassifier] Error parsing daemon output:', err.message);
            }
          }
        });

        this.pythonProcess.stderr.on('data', (data) => {
          console.error('[MLClassifier Daemon Stderr]:', data.toString());
        });

        this.pythonProcess.on('error', (err) => {
          console.warn(`[MLClassifier] Python daemon error: ${err.message}. Falling back to Heuristics.`);
          this.isLoaded = false;
          this.pythonProcess = null;
          if (!initialized) {
            initialized = true;
            resolve(false);
          }
        });

        this.pythonProcess.on('exit', (code) => {
          console.warn(`[MLClassifier] Python daemon exited with code ${code}. Falling back to Heuristics.`);
          this.isLoaded = false;
          if (!initialized) resolve(false);
        });

        // Timeout fallback after 8 seconds
        setTimeout(() => {
          if (!initialized) {
            console.warn('[MLClassifier] Python model loading timed out. Using Heuristic Fallback.');
            this.isLoaded = false;
            resolve(false);
          }
        }, 8000);

      } catch (err) {
        console.error('[MLClassifier] Error spawning Python daemon:', err.message);
        this.isLoaded = false;
        resolve(false);
      }
    });
  }

  /**
   * Classifies input text via the persistent LinearSVC model daemon.
   * @param {string|Object} input 
   * @returns {Promise<{prediction: string, confidence: number, raw_score: number, model_version: string, label: string, probability: number, provider: string}>}
   */
  async classify(input) {
    const text = typeof input === 'string' ? input : (input?.text || JSON.stringify(input));

    // Fallback if model daemon is not loaded
    if (!this.isLoaded || !this.pythonProcess || !this.pythonProcess.stdin.writable) {
      const fallbackRes = await HeuristicFallbackClassifier.classify(text);
      return {
        prediction: fallbackRes.label === 'SCAM' ? 'SCAM' : 'SAFE',
        confidence: fallbackRes.probability,
        prob_scam: fallbackRes.probability,
        raw_score: fallbackRes.probability >= 0.7 ? 1.5 : -1.5,
        model_version: 'HeuristicFallback-v1.0',
        label: fallbackRes.label,
        probability: fallbackRes.probability,
        provider: 'HeuristicFallbackClassifier'
      };
    }

    return new Promise((resolve) => {
      const currentId = `req_${++this.seqId}`;
      const payload = JSON.stringify({ id: currentId, text }) + '\n';

      const timeoutId = setTimeout(() => {
        if (this.pendingCallbacks.has(currentId)) {
          this.pendingCallbacks.delete(currentId);
          console.warn(`[MLClassifier] Prediction request ${currentId} timed out. Using fallback.`);
          HeuristicFallbackClassifier.classify(text).then(fb => {
            resolve({
              prediction: fb.label === 'SCAM' ? 'SCAM' : 'SAFE',
              confidence: fb.probability,
              prob_scam: fb.probability,
              raw_score: 0.0,
              model_version: 'HeuristicFallback-v1.0',
              label: fb.label,
              probability: fb.probability,
              provider: 'HeuristicFallbackClassifier'
            });
          });
        }
      }, 3000);

      this.pendingCallbacks.set(currentId, (response) => {
        clearTimeout(timeoutId);
        const pred = response.prediction || 'SAFE';
        const conf = response.confidence || 0.5;
        const probScam = response.prob_scam || (pred === 'SCAM' ? conf : 1 - conf);

        resolve({
          prediction: pred,
          confidence: conf,
          prob_scam: probScam,
          raw_score: response.raw_score || 0.0,
          model_version: response.model_version || 'LinearSVC-Hybrid-v1.0',
          label: pred,
          probability: probScam,
          provider: 'LinearSVCHybridClassifier'
        });
      });

      this.pythonProcess.stdin.write(payload);
    });
  }
}

module.exports = new RealMLClassifier();
