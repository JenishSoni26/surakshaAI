require('dotenv').config();
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
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0
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

  // Quiz content/questions are seeded independently of user seeding so that
  // existing databases (created before this feature existed) get backfilled
  // on next startup instead of being stuck with empty modules forever.
  const quizResult = db.exec('SELECT COUNT(*) as count FROM quiz_questions');
  const quizCount = quizResult.length > 0 ? quizResult[0].values[0][0] : 0;
  if (quizCount === 0) {
    seedQuizContent(db);
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

function seedQuizContent(db) {
  const lessons = {
    'Identifying Phishing SMS': {
      content: 'Phishing SMS messages impersonate banks, delivery services, or government agencies to trick you into clicking a link or sharing sensitive details.\n• Real banks never ask you to "verify" your account via an SMS link.\n• Urgent, threatening language ("blocked in 24 hours") is a pressure tactic, not a real deadline.\n• Check the actual link domain, not just the display text - scam links rarely match the official domain.\n• When in doubt, contact the bank directly using the number on your card or official app.',
      questions: [
        { q: 'Your SBI account will be blocked in 24 hours, click here to verify" — what should you do?', options: ['Click the link immediately to avoid being blocked', "Ignore the message and verify by calling the bank's official number", 'Reply with your account number to confirm', 'Forward it to friends to warn them, then click it yourself'], correct: 1, explanation: "Banks never ask you to verify accounts via SMS links. Always confirm suspicious messages through the bank's official app or helpline number." },
        { q: 'Do Indian banks ever ask you to share your OTP over a phone call or SMS reply to "resolve an issue"?', options: ['Yes, always', 'No — banks never ask for your OTP under any circumstance', 'Only for urgent cases', 'Only if you called them first'], correct: 1, explanation: 'An OTP is meant only for you to enter on the official app/website. No legitimate bank employee will ever ask you to read it out or send it.' },
        { q: 'Which of these is a red flag in a phishing SMS?', options: ['A generic greeting like "Dear Customer"', 'Urgent language and threats of account suspension', 'A shortened or slightly misspelled link', 'All of the above'], correct: 3, explanation: 'Phishing messages typically combine several of these traits at once — genuine bank communication is personalized and rarely time-pressures you.' },
      ],
    },
    'Safe UPI Practices': {
      content: 'UPI is designed so that receiving money never requires your PIN — only sending money does.\n• Never enter your UPI PIN in response to a "collect request" you did not initiate.\n• Verify the recipient name shown by the app before confirming a payment.\n• Treat "refund" or "cashback" requests that ask you to scan/pay as scams.\n• For large payments to a new UPI ID, confirm with the recipient over a phone call first.',
      questions: [
        { q: 'To RECEIVE money via UPI, do you need to enter your UPI PIN?', options: ['Yes, always', 'No — the PIN is only needed to send/pay money', 'Only for amounts above ₹2,000', 'Only on weekends'], correct: 1, explanation: 'Entering your PIN always means money is leaving your account. If an app asks for a PIN to "receive" a payment, it is a scam.' },
        { q: 'A stranger sends you a "collect request" for ₹1, claiming it will "verify" your account. What should you do?', options: ['Approve it since it is only ₹1', 'Decline it — collect requests are for you to pay, never to "verify" identity', 'Approve it and then block the sender', 'Share your PIN to confirm your identity'], correct: 1, explanation: 'Scammers use tiny collect requests to test whether a victim will approve unfamiliar payment prompts without reading them carefully.' },
        { q: 'What is the safest way to verify a UPI ID before sending a large payment?', options: ['Trust the name shown by the app alone', 'Send ₹1 first and hope for a reply', 'Call the recipient on a known number to confirm', "Assume it's safe if the handle ends in a bank suffix"], correct: 2, explanation: "A phone call to a number you already trust is the most reliable way to confirm you're paying the right person." },
      ],
    },
    'QR Code Safety': {
      content: 'Scanning a QR code and entering your UPI PIN always sends money out of your account — it is never used to receive a payment.\n• Be suspicious of any "scan to get a refund/cashback" request.\n• Scammers sometimes paste a fake QR sticker over a shop\'s real one.\n• Always check the merchant/payee name that appears after scanning, before entering your PIN.',
      questions: [
        { q: 'Scanning a QR code and entering your UPI PIN will…', options: ['Add money to your account', 'Send money out of your account', 'Do nothing without further confirmation', 'Only verify your identity'], correct: 1, explanation: 'QR + PIN is always a payment action in UPI, regardless of what the scammer claims it is for.' },
        { q: 'At a shop, you are asked to scan a QR code "to receive your refund." This is most likely…', options: ['Normal and safe', 'A scam — receiving money never requires scanning a QR and entering a PIN', 'Required by RBI rules for refunds', 'Only safe if you do it twice'], correct: 1, explanation: 'Refunds are credited automatically to your original payment method — they never require you to scan and enter a PIN.' },
        { q: "What should you check before scanning a public QR code, e.g. one pasted at a shop counter?", options: ['Nothing, all QR codes are safe', 'That it looks official', 'That it has not been pasted over the merchant\'s original QR code', 'The color of the QR code'], correct: 2, explanation: "Fraudsters sometimes stick a fake QR code directly over a legitimate merchant's QR to redirect payments to themselves." },
      ],
    },
    'Voice Call Scams': {
      content: 'Impersonation calls claiming to be from police, RBI, or your bank use fear and urgency to pressure victims into transferring money.\n• Government agencies never conduct arrests or investigations over a phone call, and never ask for money transfers to "safe accounts".\n• Caller ID can be spoofed — a number that looks official is not proof of identity.\n• AI voice cloning can now mimic a familiar voice convincingly; always verify unusual requests independently. Try the [Voice Scam Detector](/voice-detector) to check a suspicious recording.',
      questions: [
        { q: 'A caller claims to be from the police, says your account is linked to money laundering, and demands you transfer funds to a "safe account" immediately. This is…', options: ['A legitimate emergency procedure', 'A classic "digital arrest" scam — agencies never ask for fund transfers over a call', 'Only a scam if they also ask for an OTP', 'Normal if the caller ID shows a government number'], correct: 1, explanation: 'No Indian law enforcement or banking authority conducts investigations or demands money transfers by phone. This pattern is known as a "digital arrest" scam.' },
        { q: "Caller ID showing a bank's real phone number guarantees the call is genuine.", options: ['True — caller ID cannot be faked', 'False — caller ID can be spoofed by scammers', 'Only true for landlines', 'Only false outside India'], correct: 1, explanation: 'Caller ID spoofing tools let scammers display any number they want, including real bank or government helpline numbers.' },
        { q: 'What is a "voice clone" scam?', options: ['A phone with two SIM cards', "Using AI to mimic a familiar voice (e.g. a relative) to trick you into sending money", 'A call center with many agents', 'A voicemail spam message'], correct: 1, explanation: "AI voice cloning tools can recreate a familiar voice from a short audio sample, then use it to fake an emergency and request money." },
      ],
    },
    'Online Shopping Fraud': {
      content: 'Fake e-commerce sites use extreme discounts and unusual payment demands to separate shoppers from their money.\n• Be wary of huge discounts (80-90% off) paired with UPI-only or direct-transfer payment, with no cash-on-delivery option.\n• Prefer platforms/payment gateways that offer buyer protection.\n• Check seller reviews, ratings, and how long the store has existed before buying from an unfamiliar site.',
      questions: [
        { q: 'A website offers a smartphone at 90% off, payable only via direct UPI transfer, with no cash-on-delivery option. This is…', options: ['A great deal — buy immediately', 'Likely fraud — extreme discounts plus UPI-only payment is a common scam pattern', 'Safe if the site shows a lock icon', 'Safe if a phone number is listed'], correct: 1, explanation: 'Legitimate large retailers rarely demand upfront direct transfers with no protection — this combination is a well-known fraud pattern.' },
        { q: 'What is the safest payment method when shopping on an unfamiliar online store?', options: ['Direct bank transfer', 'UPI to a personal handle', 'Cash on Delivery or a trusted payment gateway with buyer protection', 'Sharing your card details over WhatsApp'], correct: 2, explanation: 'COD and protected gateways let you dispute or reverse a payment if the seller does not deliver — direct transfers offer no such protection.' },
        { q: 'Before buying from a new online store, you should…', options: ['Just trust the ads you see on social media', "Check reviews, seller history, and verify the site's contact details", 'Enter your card details to "unlock" a discount', 'Assume all websites are safe'], correct: 1, explanation: 'A quick review and history check can reveal whether other buyers have reported non-delivery or fraud.' },
      ],
    },
    'Social Media Scams': {
      content: 'Scammers exploit trust on social platforms through fake profiles, urgent money requests, and "too good to be true" investment tips.\n• A message from a "friend" asking for urgent money from an unfamiliar account should be verified by a direct call.\n• No legitimate investment guarantees fixed, high, risk-free returns.\n• Upfront "registration fees" for easy online jobs are a common scam pattern.',
      questions: [
        { q: 'A "friend" messages from a new, unfamiliar account asking to borrow money urgently. Best action?', options: ['Send money immediately since they are a friend', "Verify by calling them on their known number first", 'Ask them to prove it is them in the same chat', 'Ignore it and never speak to them again'], correct: 1, explanation: "Compromised or cloned accounts are commonly used to impersonate friends. A call to their known number confirms it's really them." },
        { q: 'An investment group promises "guaranteed" 30% monthly returns with no risk. This is…', options: ['A great legitimate opportunity', 'A red flag — no legitimate investment guarantees fixed high returns', 'Safe if many people have joined', "Safe if the admin seems knowledgeable"], correct: 1, explanation: 'All real investments carry risk. Guaranteed high returns are the hallmark of a Ponzi scheme.' },
        { q: 'A job offer asks you to pay an upfront "registration fee" to start easy online tasks with daily payouts. This is…', options: ['Normal hiring practice', 'A common task-based job scam pattern', 'A scam only if the fee is above ₹5,000', 'Safe if offered on WhatsApp'], correct: 1, explanation: 'Legitimate employers never charge job seekers a fee to start work — this is a widespread scam format.' },
      ],
    },
    'Advanced Fraud Patterns': {
      content: 'Sophisticated fraud often chains multiple techniques together — impersonation, malware, and social engineering.\n• A SIM swap lets a scammer receive your OTPs and calls on a SIM they control.\n• Search-engine ads and results can surface fake "customer care" numbers planted by scammers.\n• Remote-access apps (AnyDesk, TeamViewer) requested by an unknown "support agent" give them full control of your device.',
      questions: [
        { q: 'A "SIM swap" attack lets a scammer…', options: ['Change your phone wallpaper remotely', 'Get a new SIM issued in your number, intercepting your OTPs and calls', 'Access your phone camera only', "Pay your electricity bill"], correct: 1, explanation: 'With a swapped SIM, the scammer receives all your OTPs and calls, letting them bypass 2-factor authentication on your accounts.' },
        { q: 'You search "Bank X customer care" online and call the first number shown. Why can this be risky?', options: ['It is always the safest way to get help', 'Scammers plant fake customer-care numbers in search results and ads', 'Only landlines are risky to call', 'It is risky only on Sundays'], correct: 1, explanation: 'Fraudsters buy ads and post listings with fake support numbers that route to their own call centers. Always use the number from your bank\'s official app or card.' },
        { q: 'A caller asks you to install a remote-support app (like AnyDesk) to "fix an issue" with your banking app. You should…', options: ['Install it immediately to resolve the issue', 'Refuse — this gives scammers full control of your device and banking apps', 'Install it but mute the call', 'Only install it if they sound professional'], correct: 1, explanation: 'Once installed, remote-access apps let a scammer see your screen and operate your phone, including your banking apps, in real time.' },
      ],
    },
    'Cyber Law & Reporting': {
      content: "India's cyber crime helpline is 1930, and complaints can also be filed online at cybercrime.gov.in.\n• Reporting within the first hours (the \"golden window\") gives banks the best chance to freeze funds before withdrawal.\n• You can file both an online complaint and, if needed, a police FIR.\n• Keep screenshots, transaction IDs, and timestamps as evidence before reporting.",
      questions: [
        { q: 'What is the national cyber crime helpline number in India?', options: ['100', '1930', '108', '1091'], correct: 1, explanation: '1930 is the dedicated 24/7 helpline for reporting cyber crime and online financial fraud in India.' },
        { q: 'Reporting a financial fraud within the "golden window" (as soon as possible) matters because…', options: ['It does not matter, funds can always be recovered later', 'It increases the chance banks can freeze the fraudulent transaction before withdrawal', 'It only applies to cheque fraud', 'It has no legal significance'], correct: 1, explanation: 'Banks can often freeze funds still sitting in the fraudulent account if reported quickly — but the odds drop sharply once the money is withdrawn.' },
        { q: 'Where can you file an online complaint for cyber financial fraud in India?', options: ['cybercrime.gov.in', 'Only in person at a police station', 'Only through a lawyer', "Only through your bank's app"], correct: 0, explanation: 'cybercrime.gov.in is the official portal for reporting cyber crime complaints nationwide, alongside calling 1930.' },
      ],
    },
    'Digital Banking Security': {
      content: 'Basic account hygiene prevents most common takeover attempts.\n• Avoid net banking on public/shared computers; if unavoidable, use a private window and always log out.\n• Enable Two-Factor Authentication (2FA) wherever your bank offers it.\n• Use a long, unique passphrase for banking — never reuse passwords across sites.',
      questions: [
        { q: 'What is the safest way to access net banking on a public or shared computer?', options: ['Save your password in the browser for convenience', 'Avoid it, or use a private/incognito window and always log out', 'Leave yourself logged in for next time', "Use the same password as your email"], correct: 1, explanation: 'Shared devices can retain cached sessions or have keyloggers installed — avoiding banking on them, or logging out fully, limits exposure.' },
        { q: 'Two-Factor Authentication (2FA) helps because…', options: ['It makes login slower for no reason', 'It adds a second verification step, so a stolen password alone is not enough', 'It is only useful for email, not banking', 'It replaces the need for a password entirely'], correct: 1, explanation: 'Even if a password is leaked or guessed, 2FA requires a second factor (like an OTP) that the attacker typically does not have.' },
        { q: 'Which of these is the strongest password choice for your banking app?', options: ['Your birthdate', '"password123"', 'A long, unique passphrase with mixed characters, not reused elsewhere', "Your pet's name"], correct: 2, explanation: 'Long, unique, unpredictable passphrases resist both guessing and credential-stuffing attacks that reuse leaked passwords from other sites.' },
      ],
    },
    'Investment Scam Detection': {
      content: 'Fraudulent investment schemes promise unrealistic, guaranteed returns to lure victims.\n• A Ponzi scheme pays early investors using money from new investors, not real profit.\n• Before investing, check whether the advisor or platform is registered with SEBI (for securities) or another proper regulator.\n• Unsolicited "inside tips" on Telegram/WhatsApp promising guaranteed profits are a major red flag.',
      questions: [
        { q: 'A scheme pays existing investors using money collected from new investors, rather than real profit. This is a…', options: ['Mutual fund', 'Ponzi scheme', 'Fixed deposit', 'Government bond'], correct: 1, explanation: 'Ponzi schemes rely on a constant stream of new investors to pay earlier ones, and collapse once recruitment slows down.' },
        { q: 'Before investing through an advisor or platform, you should verify…', options: ['Nothing, just trust the reviews', 'Whether they are SEBI-registered (for securities) or otherwise properly regulated', 'Only their social media follower count', 'That their photo looks trustworthy'], correct: 1, explanation: 'Regulatory registration is a checkable, factual signal of legitimacy — unlike follower counts or appearances, which are easy to fake.' },
        { q: 'An unsolicited Telegram/WhatsApp message promises "inside tips" for guaranteed stock profits. Best response?', options: ['Follow the tips and invest heavily', 'Treat it as a red flag and ignore or report it', 'Share it with friends so you can all invest together', 'Pay a "membership fee" to access more tips'], correct: 1, explanation: 'Guaranteed-profit "inside tips" from unsolicited messages are a widely used bait for pump-and-dump and Ponzi-style investment scams.' },
      ],
    },
  };

  const modules = db.exec('SELECT id, title FROM learning_modules');
  if (modules.length === 0) return;
  const rows = modules[0].values; // [[id, title], ...]

  rows.forEach(([moduleId, title]) => {
    const lesson = lessons[title];
    if (!lesson) return;
    db.run('UPDATE learning_modules SET content = ? WHERE id = ?', [lesson.content, moduleId]);
    lesson.questions.forEach((q, i) => {
      db.run(
        'INSERT INTO quiz_questions (id, module_id, question, options, correct_index, explanation, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), moduleId, q.q, JSON.stringify(q.options), q.correct, q.explanation, i]
      );
    });
  });

  console.log('✅ Quiz content seeded');
}

module.exports = { initializeDatabase, saveDb, DB_PATH };
