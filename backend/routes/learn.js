const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { localizeModule, localizeQuizQuestions } = require('../data/learnContent');
const router = express.Router();

module.exports = function(db) {
  router.get('/modules', optionalAuth, (req, res) => {
    try {
      const { category, lang = 'en' } = req.query;
      let modules = category
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

      modules = modules.map(mod => localizeModule(mod, lang));
      const categories = db.all('SELECT DISTINCT category FROM learning_modules ORDER BY category').map(c => c.category);
      res.json({ modules, categories });
    } catch (err) { console.error('Learn modules error:', err); res.status(500).json({ error: 'Failed to load learning modules.' }); }
  });

  router.get('/modules/:id', optionalAuth, (req, res) => {
    try {
      const { lang = 'en' } = req.query;
      let mod = db.get('SELECT * FROM learning_modules WHERE id = ?', [req.params.id]);
      if (!mod) return res.status(404).json({ error: 'Module not found.' });

      if (req.user?.id) {
        const p = db.get('SELECT completed, score, completed_at FROM user_progress WHERE user_id = ? AND module_id = ?', [req.user.id, mod.id]);
        mod.userProgress = p ? { completed: !!p.completed, score: p.score, completedAt: p.completed_at } : { completed: false, score: 0, completedAt: null };
      } else {
        mod.userProgress = { completed: false, score: 0, completedAt: null };
      }

      mod = localizeModule(mod, lang);
      res.json({ module: mod });
    } catch (err) { console.error('Get module error:', err); res.status(500).json({ error: 'Failed to load module.' }); }
  });

  router.get('/modules/:id/quiz', optionalAuth, (req, res) => {
    try {
      const { lang = 'en' } = req.query;
      let mod = db.get('SELECT id, title FROM learning_modules WHERE id = ?', [req.params.id]);
      if (!mod) return res.status(404).json({ error: 'Module not found.' });

      mod = localizeModule(mod, lang);
      const rows = db.all('SELECT id, question, options FROM quiz_questions WHERE module_id = ? ORDER BY order_index ASC', [req.params.id]);
      let questions = rows.map(r => ({ id: r.id, question: r.question, options: JSON.parse(r.options) }));
      
      if (questions.length === 0) return res.status(404).json({ error: 'No quiz is available for this module yet.' });

      questions = localizeQuizQuestions(questions, lang);
      res.json({ moduleId: mod.id, moduleTitle: mod.title, questions });
    } catch (err) { console.error('Get quiz error:', err); res.status(500).json({ error: 'Failed to load quiz.' }); }
  });

  router.post('/modules/:id/quiz/submit', optionalAuth, (req, res) => {
    try {
      const { answers, lang = 'en' } = req.body || {};
      const mod = db.get('SELECT id FROM learning_modules WHERE id = ?', [req.params.id]);
      if (!mod) return res.status(404).json({ error: 'Module not found.' });
      if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers array is required.' });

      const rows = db.all('SELECT id, question, options, correct_index, explanation FROM quiz_questions WHERE module_id = ? ORDER BY order_index ASC', [mod.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No quiz is available for this module.' });

      const localizedQuestions = localizeQuizQuestions(rows.map(q => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        explanation: q.explanation
      })), lang);

      let correctCount = 0;
      const review = rows.map((q, i) => {
        const loc = localizedQuestions[i] || {};
        const selected = typeof answers[i] === 'number' ? answers[i] : null;
        const isCorrect = selected === q.correct_index;
        if (isCorrect) correctCount++;
        return {
          question: loc.question || q.question,
          options: loc.options || JSON.parse(q.options),
          selectedIndex: selected,
          correctIndex: q.correct_index,
          isCorrect,
          explanation: loc.explanation || q.explanation,
        };
      });

      const score = Math.round((correctCount / rows.length) * 100);
      const passed = score >= 70;

      if (req.user?.id) {
        const existing = db.get('SELECT id FROM user_progress WHERE user_id = ? AND module_id = ?', [req.user.id, mod.id]);
        if (existing) {
          db.run("UPDATE user_progress SET completed = ?, score = ?, completed_at = datetime('now') WHERE id = ?", [passed ? 1 : 0, score, existing.id]);
        } else {
          db.run("INSERT INTO user_progress (id, user_id, module_id, completed, score, completed_at) VALUES (?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), req.user.id, mod.id, passed ? 1 : 0, score]);
        }
      }

      res.json({ score, correctCount, totalQuestions: rows.length, passed, review, saved: !!req.user?.id });
    } catch (err) { console.error('Submit quiz error:', err); res.status(500).json({ error: 'Failed to submit quiz.' }); }
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
