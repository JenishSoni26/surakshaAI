# SurakshaAI — End-to-End System Architecture

**Version:** `1.0.0-Release`  
**System Type:** Defense-in-Depth Hybrid AI Security & Financial Cyber-Fraud Prevention Platform  
**Repository:** [JenishSoni26/surakshaAI](https://github.com/JenishSoni26/surakshaAI)  

---

## 1. High-Level Architecture

SurakshaAI implements a multi-layered, zero-trust **Hybrid AI Architecture** combining deterministic rule enforcement, statistical machine learning, multi-modal signal extraction, and generative AI reasoning.

```
                  ┌─────────────────────────────────────────┐
                  │          Next.js Frontend (UI)          │
                  └────────────────────┬────────────────────┘
                                       │ HTTPS / JSON API
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Node.js Express API Server        │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      SurakshaAI Hybrid AI Service       │
                  └───────┬─────────────────────────┬───────┘
                          │                         │
                          ▼                         ▼
         ┌─────────────────────────┐       ┌─────────────────────────┐
         │       Rule Engine       │       │      ML Classifier      │
         │  (Deterministic Regex)  │       │ (LinearSVC Python IPC)  │
         └────────────┬────────────┘       └────────────┬────────────┘
                      │                                 │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │              Fusion Engine              │
                  │   (4-Scenario Risk Matrix Synthesis)    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Confidence Engine            │
                  │  (Sigmoid Estimates & Weighting)        │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             Explain Engine              │
                  │ (Risk Indicators & Natural Rationale)   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             Gemini Service              │
                  │  (Educational Guidance & Advice Only)   │
                  └─────────────────────────────────────────┘
```

> **Core Security Principle**: Gemini Generative AI **NEVER** decides whether a message is SAFE or SCAM. Detection decisions are strictly reserved for the local Rule Engine, ML Classifier, and Fusion Engine to guarantee zero-latency bounds and deterministic protection.

---

## 2. Frontend Architecture

### Responsibilities:
- **Interactive Multi-Modal Scanners**: User interfaces for Text/SMS, UPI handle verification, QR destination auditing, and Voice Deepfake spectral analysis.
- **Real-Time Visual Feedback**: Dynamic risk gauge cards, threat badge indicators, and animated level meters.
- **Multi-Language Support (I18n)**: Seamless translation switching across English, Hindi, Gujarati, Tamil, Telugu, Kannada, Bengali, Marathi, and Punjabi.
- **Client Authentication & Protected Routes**: JWT token management, persistent state hooks, and auth modal guards.

### Technology Stack:
- **Framework**: Next.js 16 (React 19 App Router)
- **Styling**: Vanilla CSS Modules, CSS Design Tokens, and TailwindCSS utilities
- **Icons & Typography**: Material Symbols Outlined, Google Outfit & Inter fonts
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, MFCC extraction hooks)

---

## 3. Backend Architecture

### Architecture Overview:
The backend is structured as a modular RESTful micro-service built on Node.js and Express.js, backed by SQLite for scan logging and user authentication persistence.

### REST API Endpoints:

| Endpoint | Method | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `/api/scans/message` | `POST` | `optionalAuth` | Analyzes text message content using Hybrid AI (Rule + ML + Fusion + Gemini). |
| `/api/scans/upi` | `POST` | `optionalAuth` | Audits UPI payment handle against registered bank merchant registries. |
| `/api/scans/qr` | `POST` | `optionalAuth` | Inspects QR payment payload URLs for untrusted TLDs & shorteners. |
| `/api/scans/voice` | `POST` | `optionalAuth` | Evaluates spectral acoustic features for AI voice cloning indicators. |
| `/api/auth/register` | `POST` | None | User account creation & password hashing (`bcryptjs`). |
| `/api/auth/login` | `POST` | None | User authentication & JWT token issuance. |
| `/api/auth/me` | `GET` | `requireAuth` | Retrieves active user profile metadata. |

### Key Middleware:
- **`optionalAuth`**: Extracts and validates JWT bearer tokens if present, attaching user metadata (`req.user`) to anonymous or authenticated scan requests.
- **`requireAuth`**: Enforces active user sessions on protected routes.
- **Global Error Handler**: Catches malformed requests and unhandled runtime exceptions, returning standardized JSON error envelopes.

---

## 4. AI Security Components

### 1. Rule Engine (`ruleEngine.js`)
Deterministic pattern matcher operating on regex patterns and curated threat registries.
- **Scope**: Untrusted top-level domains (`.click`, `.xyz`, `.top`), digital arrest keywords, OTP/PIN sharing demands, electricity cutoff threats, and remote-access app installation prompts (`AnyDesk`, `TeamViewer`).
- **Function**: Designed to reliably detect known deterministic scam indicators.

### 2. Machine Learning Classifier (`mlClassifier.js`)
Statistical classifier powered by a persistent Python worker process (`predict_daemon.py`).
- **Scope**: Evaluates subtle linguistic patterns, synthetic text variations, and unknown phishing templates.
- **Output**: Returns a continuous raw decision score $m \in (-\infty, +\infty)$ representing model confidence margin.

### 3. Fusion Engine (`fusionEngine.js`)
Synthesizes signals from the Rule Engine and ML Classifier using a 4-scenario risk matrix:

| Scenario | Rule Engine Signal | ML Classifier Signal | Fused Risk Level | Fused Risk Score |
| :---: | :---: | :---: | :---: | :---: |
| **Scenario 1** | High Risk | High Risk (`SCAM`) | **HIGH** | $\ge 95$ |
| **Scenario 2** | High Risk | Low Risk (`SAFE`) | **HIGH** | $\ge 85$ (Rule Priority Override) |
| **Scenario 3** | Low Risk | High Risk (`SCAM`) | **HIGH** | $\ge 75$ (ML Anomaly Alert) |
| **Scenario 4** | Low Risk | Low Risk (`SAFE`) | **LOW** | $0$ (Safe) |

### 4. Confidence Engine (`confidenceEngine.js`)
Maps the raw LinearSVC decision score $m$ to a normalized confidence estimate $\sigma(m) = \frac{1}{1 + e^{-m}} \in [0.50, 1.00]$.  
*Note*: This confidence score serves as an input weighting factor for the Fusion Engine and is not a calibrated statistical probability.

### 5. Explain Engine (`explainEngine.js`)
Extracts granular threat indicators (e.g., *Suspicious Phishing TLD*, *Advance Fee Fraud*) and builds structured, human-readable risk rationales.

---

## 5. Machine Learning Pipeline

```
Raw Telemetry Corpus (11,572 Messages)
                │
                ▼
5-Stage Data Cleaning Lineage (raw ➔ filtered ➔ normalized ➔ processed ➔ splits)
                │
                ▼
Stratified Train/Val/Test Split (10,772 Cleaned Messages: 70% / 15% / 15%)
                │
                ▼
Hybrid Sparse TF-IDF Vectorizer (10k Word N-grams + 10k Char N-grams = 20,000 Features)
                │
                ▼
LinearSVC Model Training (C = 1.0, Squared Hinge Loss, Balanced Class Weights)
                │
                ▼
Model Export & Persistent Daemon Loading (predict_daemon.py IPC)
```

### ML Pipeline Metrics:
- **Validation Accuracy**: `97.23%`
- **Validation Precision**: `94.59%`
- **Validation Recall**: `93.87%`
- **Validation F1 Score**: `94.23%`
- **Model Inference Time**: `1.14 ms`

---

## 6. End-to-End Data Flow

```
1. User Inputs Text / Audio / Image Payload in Next.js UI
                         │
                         ▼
2. Client sends HTTP POST Request to Express REST API Route
                         │
                         ▼
3. Route Handler passes payload to SurakshaAI Hybrid AI Service
                         │
                         ▼
4. Rule Engine evaluates deterministic threat indicators
                         │
                         ▼
5. ML Classifier runs sparse TF-IDF transform & LinearSVC decision function
                         │
                         ▼
6. Fusion Engine synthesizes Rule + ML signals into Fused Risk Score
                         │
                         ▼
7. Explain Engine formats threat indicators & queries Gemini for educational advice
                         │
                         ▼
8. Express API stores Scan Log in SQLite & returns JSON contract to Frontend UI
```

---

## 7. Deployment Architecture

SurakshaAI employs an asynchronous inter-process communication (IPC) daemon architecture for ultra-fast local inference:

- **Node.js Express Web Tier**: Listens on port `3001` (or server environment port). Manages HTTP client connections, authentication, database operations, and API routing.
- **Persistent Python Worker Daemon (`predict_daemon.py`)**: Spawned once on backend startup by `modelLoader.js`. Holds pre-trained vectorizers (`word_vectorizer.pkl`, `char_vectorizer.pkl`) and model weights (`baseline_model.pkl`) permanently in RAM. Communicates with Node.js via standard input/output (`stdin`/`stdout`) streams using a JSON-lines protocol.
- **Fail-Safe Fallback**: If the Python daemon process is interrupted, Node.js automatically routes inference calls to `HeuristicFallbackClassifier` without crashing the Express server.
- **Google Gemini Cloud API**: Invoked asynchronously over HTTP only after risk scoring completes to fetch educational safety guidance.

---

## 8. Directory Structure

```
surakshaAI/
├── backend/                  # Express.js REST API & AI Service Core
│   ├── db/                   # SQLite database initialization & migrations
│   ├── middleware/           # JWT Authentication & error handling
│   ├── routes/               # Express API endpoints (/message, /upi, /qr, /voice, /auth)
│   ├── services/
│   │   └── ai/               # SurakshaAI Hybrid AI Core
│   │       ├── index.js      # Main Hybrid AIService facade
│   │       ├── ruleEngine.js # Deterministic threat pattern engine
│   │       ├── mlClassifier.js# Real ML Classifier interface
│   │       ├── modelLoader.js# Python Daemon IPC manager
│   │       ├── fusionEngine.js# Scenario-based risk fusion matrix
│   │       ├── explainEngine.js# Threat indicator explanation builder
│   │       ├── geminiService.js# Gemini educational advice integration
│   │       └── models/       # Python daemon & joblib model weights
│   └── tests/                # 120-message automated evaluation benchmark suite
├── frontend/                 # Next.js 16 React Web Application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages (scam-analyzer, upi, voice, etc.)
│   │   ├── components/       # Reusable UI cards, Navbar, LanguageSelector
│   │   └── lib/              # API hooks, I18n translation strings, Audio extractors
├── datasets/                 # ML Dataset Engineering Lineage & Reports
│   ├── raw/                  # Immutable original telemetry files
│   ├── filtered/             # Structurally cleaned data
│   ├── normalized/           # Entity-tokenized text
│   ├── processed/            # Final master corpus
│   ├── splits/               # Stratified Train/Val/Test CSV splits
│   └── reports/              # Automated dataset discovery & validation reports
└── models/                   # Duplicate model weight repository
```

---

## 9. Scalability Strategy

- **Stateless Web Tier**: Node.js Express instances can be horizontally scaled behind a load balancer (e.g., NGINX / AWS ALB).
- **Worker Daemon Scaling**: Node.js can spawn a pool of `predict_daemon.py` worker processes equal to available CPU cores for parallel inference.
- **Client-Side Edge Execution**: Pre-trained TF-IDF vectorizers and LinearSVC weights can be exported to **ONNX WebAssembly format** to run 100% client-side inside the browser or mobile app.

---

## 10. Security & Privacy Controls

- **Zero-Trust Input Sanitization**: All user inputs are normalized, trimmed, and length-bounded before processing.
- **Local Data Processing**: Message classification is performed entirely on local compute nodes without sharing user SMS text with third-party tracking APIs.
- **Fail-Safe Design**: Failure of secondary cloud APIs (e.g., Gemini) never degrades primary threat blocking.
- **SQL Injection & XSS Protection**: Parameterized SQLite queries (`db.run`) and sanitized UI rendering.

---

## 11. Future Architectural Roadmap

1. **ONNX WebAssembly Client Inference**: Migration of the LinearSVC model into ONNX runtime for sub-millisecond client-side execution in React Native and PWA environments.
2. **Federated Threat Intelligence**: Privacy-preserving active learning pipeline for crowdsourcing newly reported Indian scam templates.
3. **Multilingual Speech-To-Text (STT) Integration**: Real-time streaming voice deepfake analysis directly from phone call audio streams.
