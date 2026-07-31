# Model Card: SurakshaAI LinearSVC Hybrid Fraud Classifier

**Model Name:** `SurakshaAI-LinearSVC-Hybrid-v1.0`  
**Model Architecture:** Linear Support Vector Classifier (LinearSVC) with Hybrid Word + Character N-Gram TF-IDF Vectorization  
**Repository:** [JenishSoni26/surakshaAI](https://github.com/JenishSoni26/surakshaAI)  
**Date:** July 30, 2026  
**License:** MIT  

---

## 1. Model Overview

`SurakshaAI-LinearSVC-Hybrid-v1.0` is a lightweight, ultra-low-latency statistical machine learning classifier specifically engineered to detect Indian financial fraud, phishing SMS, UPI payment scams, lottery lures, digital arrest threats, and social engineering attacks. 

Operating as part of the broader **SurakshaAI Hybrid AI Security Engine**, the model complements a deterministic Rule Engine with statistical pattern recognition, achieving sub-10ms inference speed while preserving high scam detection recall and zero-trust security bounds.

---

## 2. Problem Statement

Financial cyber fraud via short messaging services (SMS), WhatsApp, and instant messaging has escalated rapidly across India. Modern scam attacks rely heavily on:
- Obfuscated URLs and high-risk domain TLDs (`.click`, `.xyz`, `.top`).
- Impersonation of trusted banking entities (SBI, HDFC, ICICI, Paytm).
- Psychological coercion (threat of account blocking, utility disconnection, or digital arrest).
- Synthetic variation of text templates to evade traditional keyword regex rules.

Standard cloud Large Language Models (LLMs) incur prohibitive network latency (1.5s - 3.0s per request) and high operational compute costs. `SurakshaAI-LinearSVC-Hybrid-v1.0` addresses this gap by providing millisecond-level local inference (1.14 ms) with 98.33% scam recall.

---

## 3. Intended Use

### Primary Intended Uses:
- Real-time text message classification (`SAFE` vs `SCAM`).
- Hybrid risk scoring in mobile and web cybersecurity applications.
- Zero-trust anomaly detection complementing rule-based security engines.
- Offline and edge-compatible fraud analysis pipelines.

### Primary User Group:
- Citizens, banking consumers, mobile app users, cybersecurity incident response teams, and financial anti-fraud monitoring systems.

---

## 4. Out-of-Scope Usage

The model is **NOT** designed or intended for:
- Fully automated financial transaction blocking without human verification or deterministic rule confirmation.
- Primary voice audio classification (voice deepfakes are processed via spectral MFCC/pitch signal processing).
- Legal evidence generation without human expert review.
- Language translation or general text summarization.

---

## 5. Training Datasets

The model was trained on a multi-source, highly curated corpus combining global SMS benchmarks and Indian financial fraud datasets:

1. **UCI SMS Spam Collection**: Standard benchmark containing 5,574 SMS messages.
2. **Indian Financial Messages Corpus (Synthetic & Real)**: 800+ domain-specific SMS messages capturing Indian banking alerts, UPI payment requests, KBC lottery scams, electricity bill disconnection threats, and digital arrest coercion.
3. **Primary Fraud Corpus (Track A & Track B)**: 10,772 normalized, deduplicated messages collected from real-world telemetry and open-access security repositories.

---

## 6. Dataset Statistics

| Dataset Attribute | Value |
| :--- | :--- |
| **Total Raw Messages** | 11,572 |
| **Cleaned & Verified Messages** | 10,772 |
| **Class Distribution (Train)** | 8,024 SAFE (74.49%) / 2,748 SCAM (25.51%) |
| **Dataset Splits** | 70% Train (7,540) / 15% Validation (1,616) / 15% Test (1,616) |
| **Sampling Method** | Stratified Train/Val/Test Split preserving exact class ratio |
| **Duplicate Leakage** | 0% (Cross-dataset exact & fuzzy duplicates removed prior to splitting) |

---

## 7. Data Preprocessing Pipeline

To eliminate noise while preserving scam semantics, data undergoes a reproducible 5-stage cleaning lineage (`raw` ➔ `filtered` ➔ `normalized` ➔ `processed` ➔ `splits`):

1. **Unicode & Whitespace Normalization**: NFKC normalization, stripping control characters, and removing repeated spaces.
2. **Structural Cleaning**: Removal of empty messages, malformed CSV rows, HTML document dumps, and raw email headers.
3. **Length Bounding**: Filtering out extreme outliers exceeding 1,500 characters.
4. **Entity Placeholder Tokenization**:
   - URLs $\rightarrow$ `URL_TOKEN`
   - Phone Numbers $\rightarrow$ `PHONE_TOKEN`
   - Currency Amounts $\rightarrow$ `CURRENCY_TOKEN`
   - UPI IDs $\rightarrow$ `UPI_TOKEN`
5. **Decoupled Normalization**: Preservation of casing and scam terminology during statistical vectorization.

---

## 8. Feature Engineering

The model utilizes a **Hybrid Sparse TF-IDF Vectorizer** that captures both word-level semantic intent and character-level morphological patterns (e.g., misspelled domain URLs or character swapping):

- **Word TF-IDF Vectorizer**:
  - N-gram Range: `(1, 2)` (Unigrams + Bigrams)
  - Max Features: `10,000`
  - Sublinear TF Scaling: Enabled
- **Character N-Gram TF-IDF Vectorizer**:
  - N-gram Range: `(3, 5)` (Trigrams to 5-grams)
  - Max Features: `10,000`
  - Sublinear TF Scaling: Enabled
- **Combined Vector Dimension**: 20,000 sparse features per message.

---

## 9. Selected Algorithm

### Linear Support Vector Classifier (LinearSVC)
- **Loss Function**: Squared Hinge Loss (produces raw decision scores; confidence estimate is derived via a sigmoid transformation for fusion logic)
- **Regularization Parameter**: $C = 1.0$
- **Class Weighting**: `balanced` (Automatically adjusts weights inversely proportional to class frequencies)
- **Max Iterations**: `2,000`
- **Selection Rationale**: LinearSVC outperformed Multinomial Naive Bayes and Logistic Regression in combined performance-to-latency trade-offs.

---

## 10. Model Performance

### A. Test Set Evaluation (1,082 Validation Holdout Messages)

| Evaluation Metric | Score |
| :--- | :--- |
| **Accuracy** | **97.23%** |
| **Precision (SCAM Class)** | **94.59%** |
| **Recall (SCAM Class)** | **93.87%** |
| **F1 Score (SCAM Class)** | **94.23%** |
| **ROC-AUC Score** | **0.9952** |
| **PR-AUC Score** | **0.9873** |
| **Inference Latency (Model Only)** | **1.14 milliseconds** |

### B. End-to-End System Benchmark (120 Benchmark Messages)

| Metric | Integrated Score | Target Standard | Status |
| :--- | :--- | :--- | :--- |
| **System Accuracy** | **85.00%** | $\ge 80.0\%$ | **PASSED** |
| **Scam Detection Recall** | **98.33%** (59/60) | $\ge 95.0\%$ | **EXCEEDED** |
| **Warm API Response Latency** | **72.61 ms** | $< 100\text{ ms}$ | **PASSED** |
| **Memory Consumption** | **5.39 MB** | $< 50\text{ MB}$ | **PASSED** |

---

## 11. Explainability & Hybrid Architecture

SurakshaAI employs a multi-stage defense-in-depth architecture where each component serves a distinct, transparent role:

```
User Input ➔ Rule Engine ➔ Real ML Classifier ➔ Fusion Engine ➔ Confidence Engine ➔ Explain Engine ➔ Gemini
```

1. **Rule Engine**: Deterministic regex and threat lookup layer. The Rule Engine is designed to reliably detect known deterministic scam indicators (e.g., untrusted TLDs, digital arrest keywords).
2. **ML Classifier**: Evaluates raw decision score $m$. The backend applies a sigmoid transformation $\sigma(m) = \frac{1}{1 + e^{-m}}$ to derive a confidence estimate for the Fusion Engine; this estimate is not a calibrated probability.
3. **Fusion Engine**: Merges deterministic rule signals with statistical ML predictions via a 4-scenario risk matrix.
4. **Explain Engine**: Extracts specific detected threat indicators and generates structured risk rationales.
5. **Gemini Service**: Generates educational recommendations and safety guidance. **Gemini NEVER decides whether a message is SAFE or SCAM.**

---

## 12. Ethical Considerations

- **Privacy & Telemetry**: Models operate locally without transmitting user SMS content to third-party tracking services.
- **Fairness & Language Bias**: Balanced dataset sampling prevents false positive bias against non-English or Hinglish phrasing.
- **Security Principles**: Fail-safe fallback logic ensures system resilience even if underlying subprocesses are interrupted.

---

## 13. Known Limitations

- **Legitimate Transaction Ambiguity**: High-density legitimate financial texts containing numbers, currency terms, and links may occasionally trigger caution flags (false positives).
- **Novel Evasion Techniques**: Highly obscured zero-day scam text encoding (e.g., Homoglyph substitution like `SВI` using Cyrillic characters) requires periodic vectorizer retraining.

---

## 14. Future Improvements

- **Homoglyph Normalization**: Pre-tokenization mapping of Unicode look-alike characters to ASCII equivalents.
- **Quantized On-Device Deployment**: Conversion of vectorizer and LinearSVC weights to ONNX format for native client-side execution in React Native and WebAssembly.
- **Continuous Active Learning**: Automated feedback pipeline from user-reported scam messages.

---

## 15. Model Version & Metadata

- **Model Version:** `LinearSVC-Hybrid-v1.0`
- **Training Date:** July 30, 2026
- **Frameworks:** Python `scikit-learn 1.4+`, `joblib`, `Node.js IPC`
- **Artifact Files:** `baseline_model.pkl`, `word_vectorizer.pkl`, `char_vectorizer.pkl`, `hybrid_metadata.json`

---

## 16. Authors & Contact

- **Primary Developers:** SurakshaAI AI Maverick Development Team
- **Maintainer:** Jenish Soni (`jenishsoni1827@gmail.com`)
- **Repository:** [https://github.com/JenishSoni26/surakshaAI](https://github.com/JenishSoni26/surakshaAI)

---

## 17. License

This model and associated integration code are released under the [MIT License](LICENSE).
