# Dataset Methodology & Anthropometric Modeling

## 1. Problem Formulation & Objective

The objective of the BodyCurve Analyzer machine-learning component is multi-class tabular classification of human body shapes based on anatomical circumferences and derived anthropometric ratios.

### Input Features:
- `height` (cm) — Stature
- `weight` (kg) — Total body mass
- `shoulder` (cm) — Biacromial/shoulder circumference
- `bust` (cm) — Chest/bust circumference at fullest point
- `waist` (cm) — Natural waist circumference at narrowest point
- `hip` (cm) — Maximum circumference around buttocks/hips

### Derived Anthropometric Features:
- **Body Mass Index (BMI)**: $\text{BMI} = \frac{\text{weight}}{(\text{height}/100)^2}$
- **Waist-to-Hip Ratio (WHR)**: $\text{WHR} = \frac{\text{waist}}{\text{hip}}$
- **Shoulder-to-Hip Ratio (SHR)**: $\text{SHR} = \frac{\text{shoulder}}{\text{hip}}$
- **Waist-to-Bust Ratio (WBR)**: $\text{WBR} = \frac{\text{waist}}{\text{bust}}$
- **Bust-to-Hip Ratio (BHR)**: $\text{BHR} = \frac{\text{bust}}{\text{hip}}$

### Target Classes:
1. `hourglass` — Balanced bust & hips with well-defined, significantly narrower waist.
2. `rectangle` — Straight silhouette where bust, waist, and hips are relatively uniform.
3. `pear` (Triangle) — Lower body dominance; hip circumference significantly exceeds bust and shoulder width.
4. `inverted_triangle` — Upper body dominance; broad shoulders and fuller bust tapering to narrower hips.
5. `apple` (Oval) — Central volume distribution; waist circumference approaches or exceeds bust/hip measurements.

---

## 2. Proportion Rules & Synthetic Data Generation

Human anthropometric measurements naturally follow bivariate and multivariate Gaussian distributions constrained by skeletal proportions. To construct a balanced training dataset of 3,000 records without requiring invasive scanning equipment or violating individual health privacy, synthetic data was generated using biomechanically validated proportion constraints.

### Core Geometric Archetypes:
| Body Shape | Bust vs. Hip Relationship | Waist Definition | Shoulder Profile |
| :--- | :--- | :--- | :--- |
| **Hourglass** | $|Bust - Hip| \le 5\text{ cm}$ | $Waist \le 0.75 \times Hip$ & $Waist \le 0.75 \times Bust$ | Balanced with hips ($|Shoulder - Hip| \le 6\text{ cm}$) |
| **Rectangle** | $|Bust - Hip| \le 6\text{ cm}$ | $Waist > 0.75 \times Hip$ (subtle indentation) | Balanced with hips |
| **Pear** | $Hip \ge Bust + 5\text{ cm}$ | Variable waist; lower body dominant | Shoulders narrower than hips ($Shoulder < Hip - 4\text{ cm}$) |
| **Inverted Triangle** | $Bust \ge Hip + 5\text{ cm}$ or $Shoulder \ge Hip + 5\text{ cm}$ | Variable waist | Prominent shoulder broadness |
| **Apple** | Central torso fullness | $Waist \ge 0.88 \times Hip$ and $Waist \ge 0.88 \times Bust$ | Variable shoulder width, midsection emphasis |

### Anthropometric Noise Injection:
To prevent models from simply memorizing deterministic thresholds, each measurement includes continuous Gaussian variation ($\sigma \in [1.2, 3.5]\text{ cm}$) simulating real-world measuring tape discrepancies, posture variations, and natural human anatomical variance.

---

## 3. Critical Academic Disclaimer & Synthetic Data Caveat

> [!CAUTION]
> **Synthetic Data Caveat for Technical Interviews & Peer Review**:
> The initial training dataset is synthetically generated according to documented body-proportion rules and anthropometric approximations.
> 
> Therefore, model performance (e.g. accuracy, F1-scores) demonstrates **how effectively candidate machine-learning algorithms reproduce and generalize the underlying geometric proportion rules**.
> 
> These metrics **must not be interpreted as clinical, epidemiological, or population-level real-world diagnostic accuracy**. Real-world deployment would require stratified clinical or 3D optical body scan datasets (such as CAESAR anthropometric database) with human panel labeling to establish real-world external validity.
