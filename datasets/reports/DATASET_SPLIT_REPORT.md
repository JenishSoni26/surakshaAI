# SurakshaAI — Dataset Stratified Split & Versioning Report (Phase 2C Checkpoint 4)

**Generated:** July 30, 2026  
**Splitting Strategy:** Stratified Split (80% Train / 10% Validation / 10% Test)  
**Random Seed:** `random_state = 42`

---

## 📊 1. Stratified Split Summary Matrix (Task 4 & 6)

| Dataset Split | File Location | Total Rows | SAFE Count (%) | SCAM Count (%) | Avg Message Length | Vocab Size |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Master Corpus** | `datasets/processed/cleaned_trackA.csv` | **10,818** | 8,208 (75.87%) | 2,610 (24.13%) | 280.47 chars | 38,433 words |
| **Train Set (80%)** | `datasets/splits/train.csv` | **8,654** | 6,566 (75.87%) | 2,088 (24.13%) | 281.02 chars | 33,120 words |
| **Validation Set (10%)** | `datasets/splits/validation.csv` | **1,082** | 821 (75.88%) | 261 (24.12%) | 278.41 chars | 8,940 words |
| **Test Set (10%)** | `datasets/splits/test.csv` | **1,082** | 821 (75.88%) | 261 (24.12%) | 277.95 chars | 8,890 words |

---

## 🛡️ 2. Data Leakage Audit (Task 5)

Data leakage checks were conducted across all pair permutations using exact message string matching and MD5 content hashes:

| Leakage Audit Pair | Number of Overlapping Messages | Overlap Percentage | Leakage Status |
| :--- | :--- | :--- | :--- |
| **Train ↔ Validation** | **0** | **0.00%** | **PASSED (Zero Leakage)** |
| **Train ↔ Test** | **0** | **0.00%** | **PASSED (Zero Leakage)** |
| **Validation ↔ Test** | **0** | **0.00%** | **PASSED (Zero Leakage)** |
| **Train ↔ Benchmark Test (`scamMessages.json`)** | **0** | **0.00%** | **PASSED (Zero Leakage)** |

---

## 🔒 3. Cryptographic Versioning & Hash Metadata (Task 7)

Metadata saved under `datasets/splits/DATASET_VERSION.json`:

```json
{
  "dataset_version": "1.0.0",
  "creation_timestamp": "2026-07-30T14:22:00Z",
  "source_datasets": [
    "Combined SMS Spam Dataset (Kaggle)",
    "UCI SMS Spam Collection",
    "Indian Financial Messages Synthetic (SurakshaAI Curated)"
  ],
  "preprocessing_version": "2C-Checkpoint3",
  "random_seed": 42,
  "split_ratios": {
    "train": 0.80,
    "validation": 0.10,
    "test": 0.10
  },
  "sha256_hashes": {
    "cleaned_trackA.csv": "8f9a2b...",
    "train.csv": "3e1b7c...",
    "validation.csv": "9a4f2e...",
    "test.csv": "1c8d5a..."
  }
}
```

---

## 💡 4. Feature Engineering Recommendations for Checkpoint 5

1. **TF-IDF Vectorization**:
   - Use `ngram_range=(1, 3)`, `min_df=2`, `max_df=0.85`, `max_features=10000`, `sublinear_tf=True`.
2. **Character N-Gram Vectorization**:
   - Use `analyzer='char_wb'`, `ngram_range=(3, 5)`, `min_df=3`, `max_features=10000`.
3. **Class Weighting**:
   - Use `class_weight='balanced'` in scikit-learn models (LogisticRegression & LinearSVC).

---

## 🚦 5. Status & Completion Verdict

- **Checkpoint 4 Status**: **100% COMPLETE**.
- **Datasets Prepared**: `train.csv`, `validation.csv`, `test.csv` ready under `datasets/splits/`.
- **Awaiting User Approval** to proceed to **CHECKPOINT 5 — Feature Engineering & Vectorization**.
