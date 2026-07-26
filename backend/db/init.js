const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'surakshapay.db');

async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  let db;
  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      two_factor_enabled INTEGER DEFAULT 0,
      login_alerts INTEGER DEFAULT 1,
      email_notifications INTEGER DEFAULT 1,
      sms_notifications INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      risk_score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'safe',
      ai_explanation TEXT DEFAULT '',
      threat_type TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS learning_modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 10,
      content TEXT DEFAULT '',
      icon TEXT DEFAULT 'school',
      order_index INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      completed_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'call',
      order_index INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Check if already seeded
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = result.length > 0 ? result[0].values[0][0] : 0;
  
  if (userCount === 0) {
    seedData(db);
  }

  // Save to disk
  saveDb(db);

  return db;
}

function saveDb(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function seedData(db) {
  // --- Demo User ---
  const demoUserId = uuidv4();
  const passwordHash = bcrypt.hashSync('demo1234', 10);
  db.run(
    `INSERT INTO users (id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)`,
    [demoUserId, 'Rahul Sharma', 'demo@surakshapay.ai', passwordHash, '+91 98765 43210']
  );

  // --- Scans (Security Logs) ---
  const scans = [
    { type: 'sms', content: 'Your SBI account has been blocked. Click here to verify: http://sbi-verify.xyz/login', risk_score: 92, status: 'blocked', threat_type: 'Phishing SMS', ai_explanation: 'Suspicious link detected from unknown sender claiming to be your bank. URL domain does not match official SBI domain.' },
    { type: 'qr', content: 'https://pay.suspicious-merchant.xyz/collect?amt=5000', risk_score: 65, status: 'flagged', threat_type: 'Suspicious QR', ai_explanation: 'QR code redirects to an unverified payment gateway. Merchant not registered in official UPI directory.' },
    { type: 'upi', content: 'merchant@ybl', risk_score: 12, status: 'verified', threat_type: 'None', ai_explanation: 'UPI ID belongs to a verified merchant registered with Yes Bank. No suspicious activity detected.' },
    { type: 'link', content: 'http://free-recharge-offer.tk/claim', risk_score: 88, status: 'blocked', threat_type: 'Malicious Link', ai_explanation: 'Website uses a free TLD commonly associated with fraud. Page contains hidden form collecting personal banking details.' },
    { type: 'sms', content: 'Congratulations! You won Rs.10,00,000 in KBC lottery. Send Rs.500 processing fee to claim.', risk_score: 95, status: 'blocked', threat_type: 'Lottery Scam', ai_explanation: 'Classic advance-fee lottery scam. KBC does not conduct SMS lotteries. Demands upfront payment.' },
    { type: 'voice', content: 'Recorded call claiming to be from RBI threatening account closure', risk_score: 78, status: 'flagged', threat_type: 'Impersonation Call', ai_explanation: 'Voice analysis indicates potential use of AI-generated speech. RBI never makes threatening calls.' },
    { type: 'upi', content: 'flipkart@axl', risk_score: 5, status: 'verified', threat_type: 'None', ai_explanation: 'Verified Flipkart official UPI handle. Registered with Axis Bank. Safe for transactions.' },
    { type: 'email', content: 'Your Amazon order #12345 requires immediate payment verification at amazon-secure.xyz', risk_score: 85, status: 'blocked', threat_type: 'Phishing Email', ai_explanation: 'Sender domain does not match Amazon official email. Contains phishing link.' },
    { type: 'sms', content: 'Dear customer, your PAN card will be deactivated. Update Aadhaar link: http://pan-link.in', risk_score: 90, status: 'blocked', threat_type: 'Government Impersonation', ai_explanation: 'Government agencies do not send SMS links for PAN-Aadhaar linking.' },
    { type: 'qr', content: 'upi://pay?pa=verified-shop@paytm&pn=VerifiedShop&am=200', risk_score: 8, status: 'verified', threat_type: 'None', ai_explanation: 'Valid UPI payment QR code. Merchant is verified on Paytm. Safe to proceed.' },
  ];

  scans.forEach((scan, i) => {
    db.run(
      `INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
      [uuidv4(), demoUserId, scan.type, scan.content, scan.risk_score, scan.status, scan.threat_type, scan.ai_explanation, `-${i * 3} hours`]
    );
  });

  // --- Learning Modules ---
  const modules = [
    { title: 'Identifying Phishing SMS', description: 'Learn to spot fake bank messages, lottery scams, and urgent payment requests.', category: 'Phishing', difficulty: 'beginner', duration: 10, icon: 'sms', order: 1 },
    { title: 'Safe UPI Practices', description: 'Master the dos and don\'ts of UPI transactions.', category: 'UPI Safety', difficulty: 'beginner', duration: 15, icon: 'account_balance_wallet', order: 2 },
    { title: 'QR Code Safety', description: 'Learn why scanning unknown QR codes can be dangerous.', category: 'QR Scams', difficulty: 'beginner', duration: 8, icon: 'qr_code_scanner', order: 3 },
    { title: 'Voice Call Scams', description: 'Recognize impersonation calls from fake bank officials and police threats.', category: 'Voice Scams', difficulty: 'intermediate', duration: 12, icon: 'record_voice_over', order: 4 },
    { title: 'Online Shopping Fraud', description: 'Protect yourself from fake e-commerce sites and payment manipulation.', category: 'Online Fraud', difficulty: 'intermediate', duration: 15, icon: 'shopping_cart', order: 5 },
    { title: 'Social Media Scams', description: 'Identify fake profiles, investment scams, and romance fraud.', category: 'Social Media', difficulty: 'intermediate', duration: 20, icon: 'share', order: 6 },
    { title: 'Advanced Fraud Patterns', description: 'Deep dive into multi-layered scam operations and SIM swap attacks.', category: 'Advanced', difficulty: 'advanced', duration: 25, icon: 'psychology', order: 7 },
    { title: 'Cyber Law & Reporting', description: 'Understand your rights under IT Act and how to file FIR for cyber fraud.', category: 'Legal', difficulty: 'advanced', duration: 20, icon: 'gavel', order: 8 },
    { title: 'Digital Banking Security', description: 'Secure your net banking and mobile banking apps.', category: 'Banking', difficulty: 'beginner', duration: 12, icon: 'security', order: 9 },
    { title: 'Investment Scam Detection', description: 'Identify Ponzi schemes and fake cryptocurrency platforms.', category: 'Investment', difficulty: 'advanced', duration: 18, icon: 'trending_up', order: 10 },
  ];

  modules.forEach((mod, i) => {
    const moduleId = uuidv4();
    db.run(
      `INSERT INTO learning_modules (id, title, description, category, difficulty, duration_minutes, icon, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [moduleId, mod.title, mod.description, mod.category, mod.difficulty, mod.duration, mod.icon, mod.order]
    );
    if (i < 4) {
      db.run(
        `INSERT INTO user_progress (id, user_id, module_id, completed, score, completed_at) VALUES (?, ?, ?, 1, ?, ?)`,
        [uuidv4(), demoUserId, moduleId, 80 + Math.floor(Math.random() * 20), new Date(Date.now() - (i * 86400000)).toISOString()]
      );
    }
  });

  // --- Emergency Contacts ---
  const contacts = [
    { name: 'National Cyber Crime Helpline', phone: '1930', type: 'cyber', description: '24/7 helpline for reporting cyber crimes and online financial fraud.', icon: 'shield', order: 1 },
    { name: 'RBI Fraud Reporting', phone: '14440', type: 'banking', description: 'Reserve Bank of India helpline for unauthorized bank transactions.', icon: 'account_balance', order: 2 },
    { name: 'Police Emergency', phone: '112', type: 'police', description: 'National emergency number for immediate police assistance.', icon: 'local_police', order: 3 },
    { name: 'Women Helpline', phone: '181', type: 'women', description: 'Dedicated helpline for women facing online harassment or cyber stalking.', icon: 'support', order: 4 },
    { name: 'CERT-In (Cyber Security)', phone: '1800-11-4949', type: 'cert', description: 'Indian Computer Emergency Response Team for security incidents.', icon: 'security', order: 5 },
    { name: 'SBI Fraud Helpline', phone: '1800-111-109', type: 'bank_sbi', description: 'SBI 24/7 helpline for blocking cards and reporting unauthorized transactions.', icon: 'credit_card', order: 6 },
  ];

  contacts.forEach(c => {
    db.run(
      `INSERT INTO emergency_contacts (id, name, phone, type, description, icon, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), c.name, c.phone, c.type, c.description, c.icon, c.order]
    );
  });

  console.log('✅ Database seeded with demo data');
}

module.exports = { initializeDatabase, saveDb, DB_PATH };
