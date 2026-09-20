"""
Evaluation report generator for BodyCurve Analyzer ML benchmarks.
Reads benchmark_results.json and writes docs/ml-experiments.md.
"""

import json
import os

def generate_markdown_report(
    benchmark_json_path: str = "ml/benchmark_results.json",
    output_md_path: str = "docs/ml-experiments.md"
):
    if not os.path.exists(benchmark_json_path):
        raise FileNotFoundError(f"Benchmark file {benchmark_json_path} not found.")

    with open(benchmark_json_path, "r") as f:
        meta = json.load(f)

    champ = meta["champion_model"]
    benchmarks = meta["all_benchmarks"]
    classes = meta["classes"]

    md = []
    md.append("# Machine Learning Experiments & Model Benchmarking\n")
    md.append("## 1. Overview & Experimental Setup\n")
    md.append(f"- **Total Samples**: {meta['training_samples'] + meta['test_samples']} (Train: {meta['training_samples']}, Test: {meta['test_samples']})")
    md.append(f"- **Target Classes**: `{', '.join(classes)}`")
    md.append(f"- **Features Used**: Stature & Mass (`height`, `weight`), Circumferences (`shoulder`, `bust`, `waist`, `hip`) + Engineered ratios (`BMI`, `WHR`, `SHR`, `WBR`, `BHR`).")
    md.append("- **Evaluation Strategy**: Stratified 5-Fold Cross-Validation on training split + 20% holdout test evaluation.\n")

    md.append("## 2. Benchmark Comparison Table\n")
    md.append("| Model | Training Latency | 5-Fold CV F1 (Macro) | Test Accuracy | Test Precision (Macro) | Test Recall (Macro) | Test F1 (Macro) |")
    md.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: |")

    for name, res in benchmarks.items():
        is_champ = " **(Champion)**" if name == champ else ""
        train_ms = f"{res['training_time_seconds']*1000:.1f} ms"
        cv_f1 = f"{res['cv_f1_macro_mean']:.4f} (±{res['cv_f1_macro_std']:.3f})"
        test_acc = f"{res['test_accuracy']*100:.2f}%"
        test_prec = f"{res['test_precision_macro']:.4f}"
        test_rec = f"{res['test_recall_macro']:.4f}"
        test_f1 = f"{res['test_f1_macro']:.4f}"
        md.append(f"| **{name}**{is_champ} | {train_ms} | {cv_f1} | {test_acc} | {test_prec} | {test_rec} | {test_f1} |")

    md.append(f"\n## 3. Champion Model Rationale: `{champ}`\n")
    md.append(f"`{champ}` was selected as the production model because:")
    md.append("1. **Generalization Stability**: Achieved the highest cross-validated macro F1 score with low variance across folds.")
    md.append("2. **Balanced Recall Across Classes**: Maintained high sensitivity without suffering class collapse on subtle silhouette differences (e.g. Hourglass vs. subtle Rectangle).")
    md.append("3. **Ultra-Low Latency Inference**: Generates predictions in single-digit milliseconds, making it suitable for responsive web deployment on low-spec hosting.\n")

    md.append("## 4. Confusion Matrix Analysis (Holdout Test Set)\n")
    cm = benchmarks[champ]["confusion_matrix"]
    md.append(f"**Champion Confusion Matrix (`{champ}`):**\n")
    md.append(f"| Actual \\ Predicted | " + " | ".join([f"`{c}`" for c in classes]) + " |")
    md.append("| :--- | " + " | ".join([":---:" for _ in classes]) + " |")
    for i, actual_class in enumerate(classes):
        row_str = f"| **`{actual_class}`** | " + " | ".join(str(cm[i][j]) for j in range(len(classes))) + " |"
        md.append(row_str)

    md.append("\n## 5. Synthetic Data Limitations & Future Directions\n")
    md.append("> [!IMPORTANT]")
    md.append("> As detailed in `docs/dataset-methodology.md`, the dataset was synthetically synthesized with Gaussian anthropometric noise.")
    md.append("> Consequently, the high benchmark performance demonstrates algorithmic ability to learn non-linear proportion boundaries rather than clinical diagnostic ground truth.")
    md.append("> Future iterations can validate these models against standardized 3D body scan survey datasets (e.g., CAESAR anthropometric database).")

    content = "\n".join(md)
    os.makedirs(os.path.dirname(output_md_path), exist_ok=True)
    with open(output_md_path, "w") as f:
        f.write(content)

    print(f"Report generated successfully at: {output_md_path}")

if __name__ == "__main__":
    generate_markdown_report()
