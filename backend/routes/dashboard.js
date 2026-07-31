const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

module.exports = function(db) {
  router.get('/stats', optionalAuth, (req, res) => {
    try {
      const userId = req.user?.id;
      const totalScans = userId
        ? db.get('SELECT COUNT(*) as count FROM scans WHERE user_id = ?', [userId])
        : db.get('SELECT COUNT(*) as count FROM scans');
      const scamsPrevented = userId
        ? db.get("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND status IN ('blocked','flagged')", [userId])
        : db.get("SELECT COUNT(*) as count FROM scans WHERE status IN ('blocked','flagged')");
      const safeScans = userId
        ? db.get("SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND status IN ('safe','verified')", [userId])
        : db.get("SELECT COUNT(*) as count FROM scans WHERE status IN ('safe','verified')");
      const avgRisk = userId
        ? db.get('SELECT AVG(risk_score) as avg FROM scans WHERE user_id = ?', [userId])
        : db.get('SELECT AVG(risk_score) as avg FROM scans');
      const safetyScore = Math.round(100 - ((avgRisk?.avg || 0) * 0.5));
      let completedModules = 0;
      if (userId) {
        const r = db.get('SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = 1', [userId]);
        completedModules = r?.count || 0;
      }
      const totalModules = db.get('SELECT COUNT(*) as count FROM learning_modules')?.count || 0;
      let level = 1, levelName = 'Novice';
      if (completedModules >= 8) { level = 5; levelName = 'Guardian'; }
      else if (completedModules >= 6) { level = 4; levelName = 'Defender'; }
      else if (completedModules >= 4) { level = 3; levelName = 'Protector'; }
      else if (completedModules >= 2) { level = 2; levelName = 'Learner'; }
      res.json({
        totalScans: totalScans?.count || 0,
        scamsPrevented: scamsPrevented?.count || 0,
        safeScans: safeScans?.count || 0,
        safetyScore,
        moneySaved: (scamsPrevented?.count || 0) * 250 + Math.floor(Math.random() * 500),
        learningProgress: { completed: completedModules, total: totalModules, level, levelName, modulesUntilNextLevel: Math.max(0, (level < 5 ? (level * 2) - completedModules + 2 : 0)) }
      });
    } catch (err) { console.error('Dashboard stats error:', err); res.status(500).json({ error: 'Failed to load dashboard stats.' }); }
  });

  router.get('/logs', optionalAuth, (req, res) => {
    try {
      const { page = 1, limit = 10, type, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let where = '1=1', params = [];
      if (req.user?.id) { where += ' AND user_id = ?'; params.push(req.user.id); }
      if (type) { where += ' AND type = ?'; params.push(type); }
      if (status) { where += ' AND status = ?'; params.push(status); }
      const total = db.get(`SELECT COUNT(*) as count FROM scans WHERE ${where}`, params);
      const logs = db.all(`SELECT id, type, content, risk_score, status, threat_type, ai_explanation, created_at FROM scans WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
      res.json({ logs, pagination: { page: parseInt(page), limit: parseInt(limit), total: total?.count || 0, totalPages: Math.ceil((total?.count || 0) / parseInt(limit)) } });
    } catch (err) { console.error('Dashboard logs error:', err); res.status(500).json({ error: 'Failed to load security logs.' }); }
  });

  router.get('/charts', optionalAuth, (req, res) => {
    try {
      const safetyTrend = { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [85,88,86,92,95,94,98] };
      const threatDist = db.all("SELECT CASE WHEN type='sms' THEN 'Phishing SMS' WHEN type='email' THEN 'Phishing Email' WHEN type='upi' THEN 'Fake UPI Request' WHEN type='voice' THEN 'Fraud Call' WHEN type='qr' THEN 'Suspicious QR' WHEN type='link' THEN 'Malicious Link' ELSE 'Other' END as label, COUNT(*) as count FROM scans WHERE status IN ('blocked','flagged') GROUP BY type ORDER BY count DESC");
      const weeklyVolume = { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], automated: [150,230,180,290,200,310,120], manual: [20,40,10,50,30,20,10] };
      res.json({
        safetyTrend,
        threatDistribution: { labels: threatDist.map(t => t.label), data: threatDist.map(t => t.count) },
        weeklyVolume
      });
    } catch (err) { console.error('Dashboard charts error:', err); res.status(500).json({ error: 'Failed to load chart data.' }); }
  });

  return router;
};
