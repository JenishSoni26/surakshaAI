const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { optionalAuth } = require('../middleware/auth');
const aiService = require('../services/ai');

const router = express.Router();

module.exports = function(db) {
  // ── Text / SMS Scam Analyzer Route ──────────────────────────────────────────
  router.post('/message', optionalAuth, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Message text is required.' });

      const result = await aiService.analyzeMessage(text);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'sms', text, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('Scan error:', err);
      res.status(500).json({ error: 'Analysis failed.' });
    }
  });

  // ── UPI Guardian Route ─────────────────────────────────────────────────────
  router.post('/upi', optionalAuth, async (req, res) => {
    try {
      const { upiId } = req.body;
      if (!upiId) return res.status(400).json({ error: 'UPI ID is required.' });

      const normalizedUpi = upiId.trim().toLowerCase();
      const result = await aiService.analyzeUPI(normalizedUpi);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'upi', normalizedUpi, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('UPI scan error:', err);
      res.status(500).json({ error: 'UPI analysis failed.' });
    }
  });

  // ── QR Scanner Route ───────────────────────────────────────────────────────
  router.post('/qr', optionalAuth, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'QR code URL is required.' });

      const result = await aiService.analyzeQR(url);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'qr', url, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('QR scan error:', err);
      res.status(500).json({ error: 'QR analysis failed.' });
    }
  });

  // ── Voice Detector Route ───────────────────────────────────────────────────
  router.post('/voice', optionalAuth, async (req, res) => {
    try {
      const { features, sourceType, fileName } = req.body || {};
      const result = await aiService.analyzeVoice(features);
      const scanId = uuidv4();

      const contentLabel = fileName
        ? `upload: ${fileName}`
        : `${sourceType || 'recording'} (${features?.durationSec ? features.durationSec.toFixed(1) + 's' : 'audio'})`;

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'voice', contentLabel, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('Voice scan error:', err);
      res.status(500).json({ error: 'Voice analysis failed.' });
    }
  });

  return router;
};
