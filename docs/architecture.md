# System Architecture & Technical Design

## 1. System Overview

**BodyCurve Analyzer** is an AI/ML-assisted full-stack web application that processes human anthropometric measurements, computes biomechanical proportion indices, classifies overall silhouette using reproducible Scikit-learn tabular models, and delivers explainable wellness, fitness, and style recommendations.

The architecture is specifically engineered to run efficiently on resource-constrained development machines without requiring external daemon processes (such as MongoDB or Docker) during local execution, while remaining cloud-deployable.

---

## 2. High-Level Architectural Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Next.js 14)                       │
│                                                                        │
│   • Next.js App Router (TypeScript)                                    │
│   • Tailwind CSS Design System                                         │
│   • Recharts Interactive Visualizations                                │
│   • Client-side Range & Boundary Validation                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ HTTP / REST (JSON)
                                    │ CORS Authenticated
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Flask + Python)                      │
│                                                                        │
│   • Flask Application Factory & Blueprints                             │
│   • Request Validation & Sanitization Layer (`schemas/validation.py`)  │
│   • Global Error & Exception Handlers                                  │
│   • Modular Endpoints: /api/analyze, /api/recommendations, /api/progress│
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
   ┌──────────────────────┐ ┌───────────────┐ ┌──────────────────────────┐
   │  ML INFERENCE ENGINE │ │ RECOMMENDATION│ │    PERSISTENCE LAYER     │
   │                      │ │    ENGINE     │ │                          │
   │ • Scikit-learn       │ │ • Rule-based  │ │ • SQLite3 Zero-Daemon    │
   │   Pipeline (Joblib)  │ │   classifier  │ │ • Parameterized queries  │
   │ • FeatureEngineer    │ │ • JSON rule   │ │ • Thread-safe connection │
   │ • Calibrated Proba   │ │   matrix      │ │   context manager        │
   │ • Latency: < 10ms    │ │ • Goal/Level  │ │ • Historical timeline    │
   └──────────────────────┘ └───────────────┘ └──────────────────────────┘
```

---

## 3. Component Breakdown

### 3.1 Frontend (`frontend/`)
- **Framework**: Next.js 14 with TypeScript and React 18.
- **Styling**: Tailwind CSS with custom emerald/teal wellness theme.
- **Charts**: Recharts (`ResponsiveContainer`, `LineChart`, `Tooltip`, `XAxis`, `YAxis`, `CartesianGrid`).
- **Pages**:
  - `/`: Interactive landing page with value proposition, architectural flow, and feature pillars.
  - `/analyze`: Measurement input form with live range validation, anatomical measurement tooltips, and demo presets.
  - `/results`: Dynamic result breakdown featuring body-shape badge, model confidence, class distribution, and tabbed recommendations.
  - `/dashboard`: Comprehensive user overview featuring current silhouette, biometric metrics, and progress snapshot.
  - `/progress`: Dedicated progress tracking page with interactive time-series charts and measurement history table.
  - `/recommendations`: Interactive guide allowing users to explore recommendations across all 5 body shapes, goals, and experience levels.

### 3.2 Backend (`backend/`)
- **Server Framework**: Flask 3.1 with Flask-CORS.
- **Endpoints**:
  - `POST /api/analyze`: Validates measurements, executes ML pipeline, retrieves recommendations, and auto-saves to database.
  - `GET /api/recommendations`: Queries rule-based guidance matrix by shape, goal, and activity level.
  - `POST /api/measurements`: Creates a historical measurement log.
  - `GET /api/measurements`: Lists past measurement entries.
  - `DELETE /api/measurements/<id>`: Deletes a measurement record.
  - `GET /api/progress`: Generates chronological time-series points for charting.
  - `GET /api/health`: Health status and service metadata.

### 3.3 Machine Learning Pipeline (`ml/`)
- **Feature Engineering Transformer**:
  - Encapsulated in a custom `FeatureEngineer` Scikit-learn transformer.
  - Computes $\text{BMI}$, $\text{Waist-to-Hip Ratio (WHR)}$, $\text{Shoulder-to-Hip Ratio (SHR)}$, $\text{Waist-to-Bust Ratio (WBR)}$, and $\text{Bust-to-Hip Ratio (BHR)}$.
- **Serialized Pipeline**:
  - Combined with `StandardScaler` and champion classifier into a single serialized `pipeline.pkl` artifact.
  - Guarantees zero training/serving skew.

### 3.4 Data Persistence (`backend/models/database.py`)
- **Engine**: SQLite 3 (Standard Python Library).
- **Design Decisions**:
  - Zero RAM overhead and zero background daemon processes.
  - Fully parameterized SQL queries preventing SQL injection vulnerabilities.
  - Stores measurements and user profiles in `backend/bodycurve.db`.

---

## 4. Resource Optimization Strategy
To enable seamless development on entry-level computers:
1. **CPU-Bound Tabular ML**: No deep learning or GPU dependencies (no PyTorch, no TensorFlow). Training takes < 250ms on CPU.
2. **Zero-Daemon Database**: Embedded SQLite avoids 500MB+ memory footprint of background MongoDB or PostgreSQL services.
3. **Stateless Inference**: The ML model is loaded once at server startup into memory (< 25MB footprint) and handles queries in < 10ms.
