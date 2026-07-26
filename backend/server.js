const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, saveDb } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// --- sql.js DB Wrapper ---
// sql.js uses a different API than better-sqlite3. This wrapper provides
// familiar .get(), .all(), .run() methods for route handlers.
class DbWrapper {
  constructor(db, saveFn) {
    this._db = db;
    this._save = saveFn;
  }

  // Run a query and return all results as an array of objects
  all(sql, params = []) {
    try {
      const stmt = this._db.prepare(sql);
      if (params.length) stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (e) {
      console.error('DB all error:', e.message, sql);
      return [];
    }
  }

  // Run a query and return the first result as an object (or undefined)
  get(sql, params = []) {
    try {
      const stmt = this._db.prepare(sql);
      if (params.length) stmt.bind(params);
      let result;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    } catch (e) {
      console.error('DB get error:', e.message, sql);
      return undefined;
    }
  }

  // Execute a statement (INSERT/UPDATE/DELETE) and save
  run(sql, params = []) {
    try {
      this._db.run(sql, params);
      this._save();
    } catch (e) {
      console.error('DB run error:', e.message, sql);
    }
  }
}

async function startServer() {
  const rawDb = await initializeDatabase();
  const db = new DbWrapper(rawDb, () => saveDb(rawDb));
  console.log('✅ Database initialized');

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SurakshaPay AI Security Hub API', timestamp: new Date().toISOString() });
  });

  // Mount routes
  app.use('/api/auth', require('./routes/auth')(db));
  app.use('/api/scans', require('./routes/scans')(db));
  app.use('/api/dashboard', require('./routes/dashboard')(db));
  app.use('/api/learn', require('./routes/learn')(db));
  app.use('/api/emergency', require('./routes/emergency')(db));
  app.use('/api/profile', require('./routes/profile')(db));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 SurakshaPay API running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n📧 Demo login: demo@surakshapay.ai / demo1234`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
