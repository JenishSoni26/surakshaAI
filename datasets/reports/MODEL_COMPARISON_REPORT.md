# SurakshaAI — Baseline Model Comparison & Selection Report (Phase 2C Checkpoint 5)

**Generated:** July 30, 2026  
**Evaluated Dataset:** `datasets/splits/validation.csv` (1,082 messages)  
**Total Experiments Conducted:** 9 Baseline Configurations (3 Feature Sets × 3 Algorithms)

---

## 📊 1. Comprehensive Model Leaderboard (Task 3)

| Rank | Model Name | Feature Representation | Accuracy | Precision | Recall | F1 Score | ROC-AUC | PR-AUC | Train Time | Inf Time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 🥇 **1** | **LinearSVC** | **Hybrid TF-IDF** | **0.9723** | **0.9459** | **0.9387** | **0.9423** | **0.9952** | **0.9873** | 348 ms | **1.14 ms** |
| 🥈 **2** | **LinearSVC** | **Char TF-IDF** | 0.9695 | 0.9286 | **0.9464** | 0.9374 | 0.9946 | 0.9864 | 257 ms | 1.11 ms |
| 🥉 **3** | **LogisticRegression** | **Hybrid TF-IDF** | 0.9658 | 0.9242 | 0.9349 | 0.9295 | 0.9933 | 0.9809 | 325 ms | 1.20 ms |
| **4** | **LinearSVC** | **Word TF-IDF** | 0.9658 | 0.9409 | 0.9157 | 0.9282 | 0.9813 | 0.9686 | 72 ms | 0.39 ms |
| **5** | **LogisticRegression** | **Char TF-IDF** | 0.9621 | 0.9074 | 0.9387 | 0.9228 | 0.9916 | 0.9769 | 257 ms | 1.36 ms |
| **6** | **LogisticRegression** | **Word TF-IDF** | 0.9556 | 0.9080 | 0.9080 | 0.9080 | 0.9822 | 0.9614 | 120 ms | 0.73 ms |
| **7** | **MultinomialNB** | **Hybrid TF-IDF** | 0.9510 | 0.8881 | 0.9119 | 0.8998 | 0.9822 | 0.9600 | 18 ms | 1.98 ms |
| **8** | **MultinomialNB** | **Word TF-IDF** | 0.9455 | 0.9353 | 0.8314 | 0.8803 | 0.9757 | 0.9504 | 6 ms | 1.68 ms |
| **9** | **MultinomialNB** | **Char TF-IDF** | 0.9381 | 0.8489 | 0.9042 | 0.8757 | 0.9808 | 0.9532 | 18 ms | 2.45 ms |

---

## 🏆 2. Best Model Selection & Technical Rationale (Task 5)

**Selected Baseline Model:** **LinearSVC with Hybrid TF-IDF (Word + Char)**

### Technical Justification for Selection:
1. **Highest F1 Score (0.9423)**: Outperforms all 8 alternative configurations on overall balanced performance.
2. **Superior Precision (0.9459)**: Keeps false positives under 1.4% (only 14 false alarms out of 821 safe messages in validation set).
3. **High Scam Recall (0.9387)**: Successfully detects 245 out of 261 scam messages in validation set.
4. **Ultra-Fast Inference Latency (1.14 ms)**: Perfectly suitable for real-time mobile API threat analysis.
5. **High Interpretability**: Linear weights directly correspond to word/character n-gram threat scores.

---

## 💾 3. Model Export Verification (Task 6)

The selected baseline model and vectorizers have been exported to `models/` and `backend/services/ai/models/`:
- `models/baseline_model.pkl` (LinearSVC trained model)
- `models/word_vectorizer.pkl` (Fitted Word TfidfVectorizer)
- `models/char_vectorizer.pkl` (Fitted Char TfidfVectorizer)
- `models/hybrid_metadata.json` (Experiment metadata & metrics)

---

## 🚦 4. Status & Next Steps

- **Checkpoint 5 Baseline Experiments**: **100% COMPLETE**.
- **Selected Winner**: LinearSVC (Hybrid TF-IDF) with **97.23% Accuracy & 94.23% F1**.
- **Awaiting User Approval** to proceed to **CHECKPOINT 6 — Model Error Analysis & Optimization**.
