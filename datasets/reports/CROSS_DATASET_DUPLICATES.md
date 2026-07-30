# Cross-Dataset Duplicate & Overlap Analysis Report (Phase 2C Checkpoint 1)

**Generated:** July 30, 2026  
**Text Normalization:** Mild (Trimmed whitespace, normalized Unicode NFKC, collapsed repeated spaces; case preserved).

---

## 📊 Summary of Cross-Dataset Overlap

| Dataset Pair | Shared Duplicate Messages | Overlap % (Dataset A) | Overlap % (Dataset B) | Status / Action |
| :--- | :--- | :--- | :--- | :--- |
| **Combined Large SMS** ↔ **UCI SMS Spam** | **4,605** | **42.01%** | **82.65%** | High Overlap (Deduplication Required on Merge) |
| **Combined Large SMS** ↔ **Indian Financial Synthetic** | **0** | **0.00%** | **0.00%** | Completely Unique Domain Data |
| **UCI SMS Spam** ↔ **Indian Financial Synthetic** | **0** | **0.00%** | **0.00%** | Completely Unique Domain Data |

---

## 🔍 Detailed Pairwise Analysis

### 1. `Combined Large SMS Dataset` ↔ `UCI SMS Spam Collection (archive)`
- **Dataset A Total Rows:** 10,961 (10,266 unique after internal deduplication)
- **Dataset B Total Rows:** 5,572 (5,158 unique after internal deduplication)
- **Shared Exact Match Messages:** 4,605
- **Percentage Overlap in Dataset A:** `4,605 / 10,961 = 42.01%`
- **Percentage Overlap in Dataset B:** `4,605 / 5,572 = 82.65%`
- **Key Finding:** The `combined_dataset.csv` already contains 82.65% of the UCI SMS Spam Collection dataset. When merging, only **553 new unique messages** will be contributed by the UCI SMS Spam dataset.

---

### 2. `Combined Large SMS Dataset` ↔ `Indian Financial Messages Synthetic 800`
- **Dataset A Total Rows:** 10,961
- **Dataset B Total Rows:** 800 (722 unique)
- **Shared Exact Match Messages:** 0
- **Percentage Overlap:** `0.00%`
- **Key Finding:** Zero overlap. The synthetic Indian financial dataset provides 100% novel, domain-specific text samples targeting Indian UPI, OTP, KYC, and banking fraud.

---

### 3. `UCI SMS Spam Collection (archive)` ↔ `Indian Financial Messages Synthetic 800`
- **Dataset A Total Rows:** 5,572
- **Dataset B Total Rows:** 800
- **Shared Exact Match Messages:** 0
- **Percentage Overlap:** `0.00%`
- **Key Finding:** Zero overlap. Public international spam datasets contain no regional Indian financial scam templates.

---

## 📈 Expected Final Merged Dataset Size

| Step / Pipeline Stage | Message Count |
| :--- | :--- |
| **Sum of Raw Rows Across 3 Datasets** | 17,333 |
| **Internal Duplicates Removed (within datasets)** | -1,187 |
| **Cross-Dataset Duplicates Removed (between datasets)** | -4,605 |
| **Expected Final Master Dataset Size** | **11,541 unique rows** |

### Synthetic Dataset Contribution After Merge:
- Total unique master rows: **11,541**
- Unique synthetic rows: **722**
- **Synthetic Contribution Percentage:** **6.26%** of total master training dataset.
- *Conclusion:* At **6.26%**, the synthetic dataset acts as a targeted **Domain Augmentation** without dominating the global spam knowledge base.
