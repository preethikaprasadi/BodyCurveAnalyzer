"""
Dataset generation script for BodyCurve Analyzer.

Synthesizes anthropometrically grounded human body measurements with continuous
Gaussian variation across gender-specific body-shape archetypes:

Female Body Shapes:
- Hourglass (balanced bust and hips with defined waist)
- Rectangle (straight silhouette, balanced bust/hips with minimal waist indent)
- Pear (hips significantly wider than bust and shoulders)
- Inverted Triangle (shoulders and bust noticeably broader than hips)
- Apple (central abdominal volume with waist approaching or exceeding hips)

Male Body Shapes:
- Trapezoid (the classic athletic build: broad shoulders/chest with gentle taper to waist and hips)
- Inverted Triangle (dramatic V-taper: very broad chest/deltoids with narrow waist/hips)
- Rectangle (straight athletic build: chest, waist, and hips of relatively uniform width)
- Triangle (A-frame: shoulders/chest narrower than waist and hips)
- Oval (center-heavy build: waist/midsection is the widest torso circumference)

Measurement Definitions:
- height: cm (stature)
- weight: kg (body mass)
- shoulder: cm (biacromial width across shoulders)
- bust: cm (bust circumference for women / chest circumference for men)
- waist: cm (natural waist circumference)
- hip: cm (widest hip/buttocks circumference)
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple

def generate_female_dataset(n_samples_per_class: int = 600, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic female anthropometric data."""
    rng = np.random.RandomState(random_state)
    data = []
    classes = ["hourglass", "rectangle", "pear", "inverted_triangle", "apple"]

    for shape in classes:
        for _ in range(n_samples_per_class):
            # Female stature & mass distribution
            height = float(np.round(rng.normal(164.0, 7.5), 1))
            height = float(np.clip(height, 148.0, 192.0))

            if shape == "apple":
                base_bmi = rng.normal(27.0, 3.5)
            elif shape == "hourglass":
                base_bmi = rng.normal(23.0, 2.5)
            elif shape == "rectangle":
                base_bmi = rng.normal(21.5, 2.4)
            elif shape == "pear":
                base_bmi = rng.normal(23.8, 2.8)
            else:  # inverted_triangle
                base_bmi = rng.normal(22.8, 2.5)

            base_bmi = float(np.clip(base_bmi, 18.0, 38.0))
            height_m = height / 100.0
            weight = float(np.round(base_bmi * (height_m ** 2) + rng.normal(0, 1.0), 1))
            weight = float(np.clip(weight, 42.0, 120.0))

            base_hip = 78.0 + (weight - 45.0) * 0.58 + (height - 150.0) * 0.12
            base_shoulder = 32.0 + (height - 150.0) * 0.14 + (weight - 45.0) * 0.05

            if shape == "hourglass":
                hip = base_hip + rng.normal(0.0, 2.0)
                bust = hip + rng.normal(0.0, 2.0)
                waist = min(hip, bust) * rng.uniform(0.65, 0.74) + rng.normal(0, 0.8)
                shoulder = base_shoulder + rng.normal(0.0, 1.0)

            elif shape == "rectangle":
                hip = base_hip + rng.normal(0.0, 2.2)
                bust = hip + rng.normal(0.0, 2.2)
                waist = min(hip, bust) * rng.uniform(0.79, 0.88) + rng.normal(0, 0.8)
                shoulder = base_shoulder + rng.normal(0.0, 1.0)

            elif shape == "pear":
                hip = base_hip + rng.uniform(5.0, 14.0) + rng.normal(0, 1.5)
                bust = base_hip - rng.uniform(3.0, 8.0) + rng.normal(0, 1.5)
                shoulder = base_shoulder - rng.uniform(1.5, 4.0) + rng.normal(0, 0.8)
                waist = hip * rng.uniform(0.70, 0.78) + rng.normal(0, 1.0)

            elif shape == "inverted_triangle":
                hip = base_hip - rng.uniform(4.0, 10.0) + rng.normal(0, 1.5)
                bust = base_hip + rng.uniform(3.0, 10.0) + rng.normal(0, 1.5)
                shoulder = base_shoulder + rng.uniform(4.0, 8.5) + rng.normal(0, 0.8)
                waist = hip * rng.uniform(0.74, 0.83) + rng.normal(0, 1.0)

            else:  # apple
                hip = base_hip + rng.normal(0.0, 2.2)
                bust = base_hip + rng.normal(0.0, 2.5)
                waist = max(hip, bust) * rng.uniform(0.89, 1.05) + rng.normal(0, 1.2)
                shoulder = base_shoulder + rng.normal(0.0, 1.2)

            record = {
                "height": float(np.round(height, 1)),
                "weight": float(np.round(weight, 1)),
                "shoulder": float(np.round(np.clip(shoulder, 31.0, 52.0), 1)),
                "bust": float(np.round(np.clip(bust, 68.0, 135.0), 1)),
                "waist": float(np.round(np.clip(waist, 52.0, 135.0), 1)),
                "hip": float(np.round(np.clip(hip, 72.0, 140.0), 1)),
                "gender": "female",
                "body_shape": shape,
            }
            data.append(record)

    df = pd.DataFrame(data)
    return df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)

def generate_male_dataset(n_samples_per_class: int = 600, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic male anthropometric data."""
    rng = np.random.RandomState(random_state)
    data = []
    classes = ["trapezoid", "inverted_triangle", "rectangle", "triangle", "oval"]

    for shape in classes:
        for _ in range(n_samples_per_class):
            # Male stature & mass distribution
            height = float(np.round(rng.normal(177.5, 7.5), 1))
            height = float(np.clip(height, 158.0, 202.0))

            if shape == "oval":
                base_bmi = rng.normal(28.5, 3.2)
            elif shape == "trapezoid":
                base_bmi = rng.normal(24.5, 2.3)
            elif shape == "inverted_triangle":
                base_bmi = rng.normal(25.0, 2.2)
            elif shape == "rectangle":
                base_bmi = rng.normal(22.8, 2.2)
            else:  # triangle
                base_bmi = rng.normal(25.5, 2.6)

            base_bmi = float(np.clip(base_bmi, 18.5, 38.0))
            height_m = height / 100.0
            weight = float(np.round(base_bmi * (height_m ** 2) + rng.normal(0, 1.2), 1))
            weight = float(np.clip(weight, 52.0, 135.0))

            # Male base anthropometric anchors: wider shoulders, narrower pelvic base
            base_shoulder = 38.0 + (height - 160.0) * 0.18 + (weight - 60.0) * 0.08
            base_chest = 82.0 + (weight - 60.0) * 0.50 + (height - 160.0) * 0.12
            base_hip = 82.0 + (weight - 60.0) * 0.38 + (height - 160.0) * 0.10

            if shape == "trapezoid":
                # Athletic balanced: broad shoulders & chest, moderate waist taper, balanced hips
                shoulder = base_shoulder + rng.uniform(2.5, 5.0) + rng.normal(0, 0.8)
                bust = base_chest + rng.uniform(3.0, 7.0) + rng.normal(0, 1.2)  # chest
                hip = base_hip + rng.normal(0.0, 1.8)
                # Waist is comfortably tapered: WHR ~ 0.82 - 0.88, Chest-to-Waist ~ 1.18 - 1.28
                waist = bust * rng.uniform(0.79, 0.85) + rng.normal(0, 0.8)

            elif shape == "inverted_triangle":
                # Dramatic V-taper: very wide shoulders & chest, narrow waist and hips
                shoulder = base_shoulder + rng.uniform(5.5, 9.5) + rng.normal(0, 0.8)
                bust = base_chest + rng.uniform(7.0, 14.0) + rng.normal(0, 1.2)
                hip = base_hip - rng.uniform(2.0, 6.0) + rng.normal(0, 1.5)
                # Steep taper: WHR ~ 0.77 - 0.84, Chest-to-Waist >= 1.29
                waist = hip * rng.uniform(0.82, 0.89) + rng.normal(0, 0.8)

            elif shape == "rectangle":
                # Straight athletic: chest, waist, and hips follow an even line
                shoulder = base_shoulder + rng.normal(0.0, 1.2)
                hip = base_hip + rng.normal(0.0, 2.0)
                bust = hip + rng.normal(0.0, 2.0)
                # Waist relatively straight: WHR ~ 0.89 - 0.94, Chest-to-Waist ~ 1.06 - 1.14
                waist = min(hip, bust) * rng.uniform(0.89, 0.95) + rng.normal(0, 0.8)

            elif shape == "triangle":
                # A-frame: lower torso (waist/hips) wider than chest/shoulders
                shoulder = base_shoulder - rng.uniform(2.0, 4.5) + rng.normal(0, 0.8)
                bust = base_chest - rng.uniform(3.0, 7.0) + rng.normal(0, 1.2)
                hip = base_hip + rng.uniform(3.0, 9.0) + rng.normal(0, 1.5)
                # Waist wider than chest: WHR ~ 0.93 - 1.02
                waist = max(bust, hip) * rng.uniform(0.94, 1.02) + rng.normal(0, 1.0)

            else:  # oval
                # Center-heavy: prominent abdomen/waist, widest part of the torso
                shoulder = base_shoulder + rng.normal(0.0, 1.2)
                hip = base_hip + rng.normal(0.0, 2.2)
                bust = base_chest + rng.normal(0.0, 2.2)
                # Waist exceeds both chest and hips: WHR >= 0.98 - 1.15
                waist = max(bust, hip) * rng.uniform(1.02, 1.16) + rng.normal(0, 1.2)

            record = {
                "height": float(np.round(height, 1)),
                "weight": float(np.round(weight, 1)),
                "shoulder": float(np.round(np.clip(shoulder, 36.0, 56.0), 1)),
                "bust": float(np.round(np.clip(bust, 78.0, 142.0), 1)),
                "waist": float(np.round(np.clip(waist, 64.0, 142.0), 1)),
                "hip": float(np.round(np.clip(hip, 76.0, 138.0), 1)),
                "gender": "male",
                "body_shape": shape,
            }
            data.append(record)

    df = pd.DataFrame(data)
    return df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)

def main():
    os.makedirs("ml/data", exist_ok=True)
    female_path = os.path.join("ml", "data", "body_measurements_female.csv")
    male_path = os.path.join("ml", "data", "body_measurements_male.csv")
    combined_path = os.path.join("ml", "data", "body_measurements_dataset.csv")

    print("1. Generating synthetic female body measurements (3,000 samples)...")
    df_female = generate_female_dataset(n_samples_per_class=600, random_state=42)
    df_female.to_csv(female_path, index=False)
    print(f"Saved female dataset to: {female_path}")
    print(df_female["body_shape"].value_counts())

    print("\n2. Generating synthetic male body measurements (3,000 samples)...")
    df_male = generate_male_dataset(n_samples_per_class=600, random_state=42)
    df_male.to_csv(male_path, index=False)
    print(f"Saved male dataset to: {male_path}")
    print(df_male["body_shape"].value_counts())

    print("\n3. Saving combined dataset (6,000 samples)...")
    df_combined = pd.concat([df_female, df_male], ignore_index=True)
    df_combined.to_csv(combined_path, index=False)
    print(f"Saved combined dataset to: {combined_path}")

if __name__ == "__main__":
    main()
