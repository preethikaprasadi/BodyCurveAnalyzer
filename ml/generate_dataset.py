"""
Dataset generation script for BodyCurve Analyzer.

Synthesizes anthropometrically grounded human body measurements with continuous
Gaussian variation across five primary body-shape categories:
- Hourglass
- Rectangle
- Pear (Triangle)
- Inverted Triangle
- Apple (Oval)

Measurement Definitions:
- height: cm (stature)
- weight: kg (body mass)
- shoulder: cm (biacromial width across shoulders, typical range: 34-50 cm)
- bust: cm (chest circumference at fullest point, typical range: 75-130 cm)
- waist: cm (natural waist circumference at narrowest point, typical range: 55-125 cm)
- hip: cm (maximum circumference around buttocks/hips, typical range: 80-135 cm)
"""

import os
import numpy as np
import pandas as pd

def generate_body_shape_dataset(n_samples_per_class: int = 600, random_state: int = 42) -> pd.DataFrame:
    """
    Generate synthetic anthropometric data with realistic proportions and noise.
    
    Args:
        n_samples_per_class: Number of observations per target body-shape class.
        random_state: Seed for reproducibility.
        
    Returns:
        pd.DataFrame containing measurements and target body shape label.
    """
    rng = np.random.RandomState(random_state)
    data = []

    classes = ["hourglass", "rectangle", "pear", "inverted_triangle", "apple"]

    for shape in classes:
        for _ in range(n_samples_per_class):
            # Base stature and mass with natural biological correlation
            height = float(np.round(rng.normal(167.0, 8.5), 1))
            height = float(np.clip(height, 148.0, 198.0))

            # Base BMI distribution with realistic variation
            if shape == "apple":
                base_bmi = rng.normal(27.0, 3.5)
            elif shape == "hourglass":
                base_bmi = rng.normal(23.0, 2.8)
            elif shape == "rectangle":
                base_bmi = rng.normal(21.5, 2.6)
            elif shape == "pear":
                base_bmi = rng.normal(23.8, 3.0)
            else:  # inverted_triangle
                base_bmi = rng.normal(23.2, 2.8)

            base_bmi = float(np.clip(base_bmi, 18.0, 38.0))
            height_m = height / 100.0
            weight = float(np.round(base_bmi * (height_m ** 2) + rng.normal(0, 1.2), 1))
            weight = float(np.clip(weight, 42.0, 125.0))

            # Base hip anchor correlated with weight and height
            base_hip = 78.0 + (weight - 45.0) * 0.58 + (height - 150.0) * 0.12

            # Base shoulder width (across back, cm): typically 36-45 cm for average adults
            base_shoulder = 32.0 + (height - 150.0) * 0.15 + (weight - 45.0) * 0.05

            if shape == "hourglass":
                # Balanced bust and hips, distinct indented waist
                hip = base_hip + rng.normal(0.0, 2.0)
                bust = hip + rng.normal(0.0, 2.0)  # bust ~ hip
                # Narrow waist: WHR <= 0.74, WBR <= 0.74
                waist = min(hip, bust) * rng.uniform(0.65, 0.74) + rng.normal(0, 0.8)
                shoulder = base_shoulder + rng.normal(0.0, 1.0)

            elif shape == "rectangle":
                # Balanced bust and hip, straight silhouette (little waist curve)
                hip = base_hip + rng.normal(0.0, 2.2)
                bust = hip + rng.normal(0.0, 2.2)  # bust ~ hip
                # Waist relatively straight: WHR in 0.79 - 0.88
                waist = min(hip, bust) * rng.uniform(0.79, 0.88) + rng.normal(0, 0.8)
                shoulder = base_shoulder + rng.normal(0.0, 1.0)

            elif shape == "pear":
                # Hips dominate bust and shoulders
                hip = base_hip + rng.uniform(5.0, 14.0) + rng.normal(0, 1.5)
                bust = base_hip - rng.uniform(3.0, 8.0) + rng.normal(0, 1.5)
                # Shoulders narrower
                shoulder = base_shoulder - rng.uniform(1.5, 4.0) + rng.normal(0, 0.8)
                # Waist moderately defined
                waist = hip * rng.uniform(0.70, 0.78) + rng.normal(0, 1.0)

            elif shape == "inverted_triangle":
                # Shoulders and bust dominate hips
                hip = base_hip - rng.uniform(4.0, 10.0) + rng.normal(0, 1.5)
                bust = base_hip + rng.uniform(3.0, 10.0) + rng.normal(0, 1.5)
                # Shoulders noticeably broader
                shoulder = base_shoulder + rng.uniform(4.0, 8.5) + rng.normal(0, 0.8)
                waist = hip * rng.uniform(0.74, 0.83) + rng.normal(0, 1.0)

            else:  # apple
                # Central volume: waist is prominent compared to bust and hips
                hip = base_hip + rng.normal(0.0, 2.2)
                bust = base_hip + rng.normal(0.0, 2.5)
                # Waist approaches or exceeds hips/bust (WHR >= 0.89)
                waist = max(hip, bust) * rng.uniform(0.89, 1.05) + rng.normal(0, 1.2)
                shoulder = base_shoulder + rng.normal(0.0, 1.2)

            record = {
                "height": float(np.round(height, 1)),
                "weight": float(np.round(weight, 1)),
                "shoulder": float(np.round(np.clip(shoulder, 31.0, 56.0), 1)),
                "bust": float(np.round(np.clip(bust, 68.0, 138.0), 1)),
                "waist": float(np.round(np.clip(waist, 52.0, 135.0), 1)),
                "hip": float(np.round(np.clip(hip, 72.0, 142.0), 1)),
                "body_shape": shape,
            }
            data.append(record)

    df = pd.DataFrame(data)
    # Shuffle the dataset
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df

def main():
    os.makedirs("ml/data", exist_ok=True)
    output_path = os.path.join("ml", "data", "body_measurements_dataset.csv")
    
    print("Generating synthetic body measurements dataset...")
    df = generate_body_shape_dataset(n_samples_per_class=600, random_state=42)
    df.to_csv(output_path, index=False)
    
    print(f"Dataset generated successfully at: {output_path}")
    print(f"Total records: {len(df)}")
    print("\nClass distribution:")
    print(df["body_shape"].value_counts())
    print("\nFeature descriptive statistics:")
    print(df.describe().round(2))

if __name__ == "__main__":
    main()
