const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const router = express.Router();

module.exports = function(db) {
  router.get('/modules', optionalAuth, (req, res) => {
    try {
      const { category } = req.query;
      const modules = category
        ? db.all('SELECT * FROM learning_modules WHERE category = ? ORDER BY order_index ASC', [category])
        : db.all('SELECT * FROM learning_modules ORDER BY order_index ASC');
      if (req.user?.id) {
        const progress = db.all('SELECT module_id, completed, score, completed_at FROM user_progress WHERE user_id = ?', [req.user.id]);
        const progressMap = {};
        progress.forEach(p => { progressMap[p.module_id] = p; });
        modules.forEach(mod => {
          const p = progressMap[mod.id];
          mod.userProgress = p ? { completed: !!p.completed, score: p.score, completedAt: p.completed_at } : { completed: false, score: 0, completedAt: null };
        });
      } else {
        modules.forEach(mod => { mod.userProgress = { completed: false, score: 0, completedAt: null }; });
      }
      const categories = db.all('SELECT DISTINCT category FROM learning_modules ORDER BY category').map(c => c.category);
      res.json({ modules, categories });
    } catch (err) { console.error('Learn modules error:', err); res.status(500).json({ error: 'Failed to load learning modules.' }); }
  });

  router.post('/progress', authMiddleware, (req, res) => {
    try {
      const { moduleId, score } = req.body;
      if (!moduleId) return res.status(400).json({ error: 'Module ID is required.' });
      const mod = db.get('SELECT id FROM learning_modules WHERE id = ?', [moduleId]);
      if (!mod) return res.status(404).json({ error: 'Module not found.' });
      const existing = db.get('SELECT id FROM user_progress WHERE user_id = ? AND module_id = ?', [req.user.id, moduleId]);
      if (existing) {
        db.run("UPDATE user_progress SET completed = 1, score = ?, completed_at = datetime('now') WHERE id = ?", [score || 100, existing.id]);
      } else {
        db.run("INSERT INTO user_progress (id, user_id, module_id, completed, score, completed_at) VALUES (?, ?, ?, 1, ?, datetime('now'))", [uuidv4(), req.user.id, moduleId, score || 100]);
      }
      res.json({ message: 'Progress updated successfully!' });
    } catch (err) { console.error('Learn progress error:', err); res.status(500).json({ error: 'Failed to update progress.' }); }
  });

  return router;
};
