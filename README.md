# SurakshaAI — AI-Powered Financial Security & Threat Protection

SurakshaAI is an AI-powered financial security platform designed to protect users against cyber fraud, financial scams, phishing URLs, malicious QR codes, and AI-generated voice deepfakes.

## Release Candidate (RC1)

SurakshaAI has successfully completed end-to-end smoke testing and deployment readiness verification.

Current status:

✅ Hybrid AI Architecture Verified

✅ Production Hardening Completed

✅ Chatbot Intent Routing Verified

✅ Documentation Finalized

✅ Deployment Readiness Verified

✅ End-to-End Smoke Test Passed (15/15)

This repository represents the Release Candidate (RC1) prepared for hackathon submission.

---

## 🚀 Core Threat Protection Modules

1. **Scam Analyzer** (`/scam-analyzer`): Text & SMS phishing analysis via 9-stage Hybrid AI pipeline (Rule Engine + LinearSVC ML Classifier).
2. **UPI Guardian** (`/upi-guardian`): VPA handle verification, syntax validation, and scam handle detection.
3. **QR Scanner** (`/qr-scanner`): QR payload URL decoding, `.apk` installer warnings, and phishing link detection.
4. **Voice Detector** (`/voice-detector`): Real-time Web Audio DSP acoustic signal analysis for AI voice deepfake detection.
5. **AI Assistant** (`/assistant`): Multi-intent security chatbot providing safety advice and guidance.
6. **Literacy Hub** (`/learn`): 10 educational modules & interactive quizzes across 9 Indian languages.
7. **Emergency Center** (`/emergency`): 24/7 National Cybercrime Helpline 1930 contacts & bank account freeze guides.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js App Router, Tailwind CSS, Material Design 3 tokens, Web Audio API DSP.
- **Backend**: Node.js, Express, `sql.js` (WebAssembly SQLite).
- **Hybrid AI Layer**: Deterministic Rule Engine, LinearSVC ML Classifier with TF-IDF vectorizer, Scenario Fusion Engine, Normalized Confidence Calculator, Multilingual Explain Engine (9 languages), and Google Gemini LLM API fallback.

---

## 📋 Quick Start Guide

### Prerequisites
- Node.js (v18+)

### Backend Setup
```bash
cd backend
npm install
npm start
```
The backend API server will start at `http://localhost:3001`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
