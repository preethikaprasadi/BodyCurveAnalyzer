# Machine Learning Experiments & Model Benchmarking

## 1. Overview & Experimental Setup

- **Total Samples**: 3000 (Train: 2400, Test: 600)
- **Target Classes**: `apple, hourglass, inverted_triangle, pear, rectangle`
- **Features Used**: Stature & Mass (`height`, `weight`), Circumferences (`shoulder`, `bust`, `waist`, `hip`) + Engineered ratios (`BMI`, `WHR`, `SHR`, `WBR`, `BHR`).
- **Evaluation Strategy**: Stratified 5-Fold Cross-Validation on training split + 20% holdout test evaluation.

## 2. Benchmark Comparison Table

| Model | Training Latency | 5-Fold CV F1 (Macro) | Test Accuracy | Test Precision (Macro) | Test Recall (Macro) | Test F1 (Macro) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** **(Champion)** | 29.8 ms | 0.9983 (±0.002) | 99.50% | 0.9951 | 0.9950 | 0.9950 |
| **Decision Tree** | 16.6 ms | 0.9896 (±0.004) | 99.17% | 0.9918 | 0.9917 | 0.9917 |
| **Random Forest** | 187.0 ms | 0.9967 (±0.002) | 99.33% | 0.9935 | 0.9933 | 0.9934 |
| **K-Nearest Neighbors** | 12.0 ms | 0.9967 (±0.003) | 99.17% | 0.9918 | 0.9917 | 0.9917 |

## 3. Champion Model Rationale: `Logistic Regression`

`Logistic Regression` was selected as the production model because:
1. **Generalization Stability**: Achieved the highest cross-validated macro F1 score with low variance across folds.
2. **Balanced Recall Across Classes**: Maintained high sensitivity without suffering class collapse on subtle silhouette differences (e.g. Hourglass vs. subtle Rectangle).
3. **Ultra-Low Latency Inference**: Generates predictions in single-digit milliseconds, making it suitable for responsive web deployment on low-spec hosting.

## 4. Confusion Matrix Analysis (Holdout Test Set)

**Champion Confusion Matrix (`Logistic Regression`):**

| Actual \ Predicted | `apple` | `hourglass` | `inverted_triangle` | `pear` | `rectangle` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`apple`** | 117 | 0 | 0 | 0 | 3 |
| **`hourglass`** | 0 | 120 | 0 | 0 | 0 |
| **`inverted_triangle`** | 0 | 0 | 120 | 0 | 0 |
| **`pear`** | 0 | 0 | 0 | 120 | 0 |
| **`rectangle`** | 0 | 0 | 0 | 0 | 120 |

## 5. Synthetic Data Limitations & Future Directions

> [!IMPORTANT]
> As detailed in `docs/dataset-methodology.md`, the dataset was synthetically synthesized with Gaussian anthropometric noise.
> Consequently, the high benchmark performance demonstrates algorithmic ability to learn non-linear proportion boundaries rather than clinical diagnostic ground truth.
> Future iterations can validate these models against standardized 3D body scan survey datasets (e.g., CAESAR anthropometric database).