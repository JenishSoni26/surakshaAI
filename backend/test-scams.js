const scansRouter = require('./routes/scans');
const mockDb = { run: () => {} };
const router = scansRouter(mockDb);

const assert = require('assert');

async function callHandler(route, body) {
  let responseData = null;
  let statusCode = 200;
  
  const req = { body, user: { id: 'test-user-123' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  const layer = router.stack.find(s => s.route && s.route.path === route);
  if (!layer) throw new Error(`Route ${route} not found`);
  
  const handlers = layer.route.stack.map(s => s.handle);
  const mainHandler = handlers[handlers.length - 1];
  
  await mainHandler(req, res);
  return { statusCode, data: responseData };
}

console.log('===============================================================');
console.log('🧪 SURAKSHAPAY COMPREHENSIVE MULTI-LANGUAGE SCAM SUITE');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

async function runTest(category, name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [${category}] ${name}`);
  } catch (err) {
    console.error(`  ❌ [${category}] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function main() {
  // Category 1: User Reported Cases
  await runTest('USER CASES', 'User Reported ₹50,000 Cashback ATM/PIN/OTP Phishing', async () => {
    const res = await callHandler('/message', {
      text: `Congratulations! Your bank account has been selected to receive a ₹50,000 cashback. To claim it, click this link and verify your account by entering your ATM card number, PIN, and OTP. Hurry—this offer expires today!`,
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
    assert.strictEqual(res.data.riskLevel, 'HIGH');
    assert(res.data.risk_score >= 70);
  });

  await runTest('USER CASES', 'Gujarati WhatsApp OTP Scam', async () => {
    const res = await callHandler('/message', {
      text: `મારું WhatsApp એકાઉન્ટ બંધ થવાનું છે.\nતમારો 6 અંકનો OTP મોકલો જેથી એકાઉન્ટ ચાલુ રહે.`,
      lang: 'gu'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
    assert(res.data.risk_score >= 50);
  });

  await runTest('USER CASES', 'English ATM Card Block 30-Min Urgency OTP Scam', async () => {
    const res = await callHandler('/message', {
      text: `Your ATM card will be blocked within 30 minutes.\nPlease share the OTP sent to your phone to keep your card active.`,
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
    assert(res.data.risk_score >= 50);
  });

  await runTest('USER CASES', 'Gujarati Parcel Stuck ₹25 Delivery Charge Phishing', async () => {
    const res = await callHandler('/message', {
      text: `તમારું પાર્સલ અટકી ગયું છે.\n₹25 ડિલિવરી ચાર્જ ચૂકવવા માટે લિંક પર ક્લિક કરો.\nનહીં તો પાર્સલ પરત મોકલવામાં આવશે.`,
      lang: 'gu'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
    assert(res.data.risk_score >= 50);
  });

  // Category 2: Regional Indian Languages
  await runTest('REGIONAL', 'Hindi Electricity Connection Cutoff Scam', async () => {
    const res = await callHandler('/message', {
      text: 'प्रिय ग्राहक आपका बिजली बिल अपडेट नहीं है। आज रात 9:30 बजे बिजली कनेक्शन काट दिया जाएगा। तुरंत कॉल करें।',
      lang: 'hi'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('REGIONAL', 'Tamil Bank Account Block Scam', async () => {
    const res = await callHandler('/message', {
      text: 'உங்கள் வங்கி கணக்கு தடுக்கப்பட்டது. உடனடியாக புதுப்பிக்க ஓடிபி பகிரவும்.',
      lang: 'ta'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('REGIONAL', 'Telugu Current Bill Cutoff Scam', async () => {
    const res = await callHandler('/message', {
      text: 'మీ కరెంట్ బిల్లు చెల్లించలేదు. ఈ రాత్రి విద్యుత్ కనెక్షన్ నిలిపివేత చేయబడుతుంది.',
      lang: 'te'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('REGIONAL', 'Kannada Power Cut OTP Scam', async () => {
    const res = await callHandler('/message', {
      text: 'ನಿಮ್ಮ ವಿದ್ಯುತ್ ಬಿಲ್ ಬಾಕಿ ಇದೆ. ಪವರ್ ಕಟ್ ತಡೆಯಲು ಒಟಿಪಿ ಹಂಚಿಕೊಳ್ಳಿ.',
      lang: 'kn'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('REGIONAL', 'Bengali Lottery Winner Fraud', async () => {
    const res = await callHandler('/message', {
      text: 'অভিনন্দন! আপনি ২৫ লাখ টাকা লটারি জিতেছেন। প্রসেসিং ফি দিতে ক্লিক করুন।',
      lang: 'bn'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('REGIONAL', 'Marathi Electricity Bill Cutoff Threat', async () => {
    const res = await callHandler('/message', {
      text: 'तुमचे वीज बिल थकबाकी आहे. आज रात्री वीज कनेक्शन तोडले जाईल. तात्काळ पैसे पाठवा.',
      lang: 'mr'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('REGIONAL', 'Hinglish Account Block & Paise Transfer', async () => {
    const res = await callHandler('/message', {
      text: 'Dear customer aapka account block ho gaya hai. KYC update karne ke liye link par click karke paise transfer karo.',
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  // Category 3: Attack Vectors
  await runTest('ATTACK VECTORS', 'APK Malware Download Prompt', async () => {
    const res = await callHandler('/message', {
      text: 'Your bank KYC is incomplete. Download and install sbi_update.apk to avoid suspension.',
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('ATTACK VECTORS', 'AnyDesk Remote Control App Scam', async () => {
    const res = await callHandler('/message', {
      text: 'To resolve your bank issue, install AnyDesk app immediately and share screen code.',
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  await runTest('ATTACK VECTORS', 'Digital Arrest CBI Officer Impersonation', async () => {
    const res = await callHandler('/message', {
      text: 'Digital arrest warrant issued by CBI officer regarding your customs parcel. Join video call immediately.',
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
  });

  // Category 4: Safety Baseline & Payment Verification
  await runTest('BASELINE', 'Safe Legitimate Friendly Message', async () => {
    const res = await callHandler('/message', {
      text: 'Hey Rohan, are we still meeting for lunch today at 1 PM near office?',
      lang: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'safe');
    assert.strictEqual(res.data.risk_score, 0);
  });

  await runTest('UPI GUARDIAN', 'Verified Merchant Handle (Flipkart)', async () => {
    const res = await callHandler('/upi', { upiId: 'flipkart@paytm', lang: 'en' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'verified');
    assert(res.data.risk_score <= 20);
  });

  await runTest('UPI GUARDIAN', 'Unknown Untrusted UPI Handle', async () => {
    const res = await callHandler('/upi', { upiId: 'scammer99@fakebankxyz', lang: 'hi' });
    assert.strictEqual(res.statusCode, 200);
    assert(res.data.status === 'flagged' || res.data.status === 'blocked');
    assert(res.data.risk_score >= 50);
  });

  await runTest('QR SCANNER', 'Phishing URL in QR Code', async () => {
    const res = await callHandler('/qr', { url: 'http://free-cashback-reward.xyz', lang: 'gu' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'blocked');
    assert(res.data.risk_score >= 50);
  });

  console.log('\n===============================================================');
  console.log(`📊 TOTAL SUITE RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('===============================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
  console.log('✨ All 18 Comprehensive Multi-Language Scam Tests Passed Successfully!\n');
}

main().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
