const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

module.exports = function(db) {
  router.get('/contacts', (req, res) => {
    try {
      const contacts = db.all('SELECT * FROM emergency_contacts ORDER BY order_index ASC');
      res.json({ contacts });
    } catch (err) { console.error('Emergency contacts error:', err); res.status(500).json({ error: 'Failed to load emergency contacts.' }); }
  });

  router.post('/freeze', optionalAuth, (req, res) => {
    try {
      const { accountType, reason } = req.body;
      res.json({
        message: 'Emergency freeze request submitted successfully!',
        freezeId: `FRZ-${Date.now()}`,
        status: 'processing',
        details: {
          accountType: accountType || 'all',
          reason: reason || 'suspected fraud',
          timestamp: new Date().toISOString(),
          estimatedCompletion: '2-5 minutes',
          nextSteps: ['Your accounts are being temporarily frozen','You will receive an SMS confirmation shortly','Contact your bank directly to unfreeze when safe','File an FIR at your nearest police station','Report the incident at cybercrime.gov.in']
        }
      });
    } catch (err) { console.error('Emergency freeze error:', err); res.status(500).json({ error: 'Failed to process freeze request.' }); }
  });

  router.post('/report', optionalAuth, (req, res) => {
    try {
      res.json({
        message: 'Fraud report submitted successfully!',
        reportId: `RPT-${Date.now()}`,
        status: 'submitted',
        details: {
          timestamp: new Date().toISOString(),
          nextSteps: ['Report has been logged with reference number','Contact National Cyber Crime Helpline: 1930','File online complaint at cybercrime.gov.in','Keep all evidence (screenshots, messages, call logs)','Do not delete any communication from the fraudster']
        }
      });
    } catch (err) { console.error('Emergency report error:', err); res.status(500).json({ error: 'Failed to submit report.' }); }
  });

  return router;
};
