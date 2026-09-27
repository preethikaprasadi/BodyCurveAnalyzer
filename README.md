# BodyCurve Analyzer

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9-orange.svg)](https://scikit-learn.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-emerald.svg)](https://docs.pytest.org/)

> **An end-to-end, AI/ML-assisted full-stack platform for anatomical body proportion analysis, silhouette classification, and personalized wellness and style guidance.**

---

## Overview

Most fitness and fashion recommendations rely on generic height-weight charts or arbitrary sizing that ignore individual skeletal proportions. **BodyCurve Analyzer** bridges this gap by providing an explainable, data-driven system where users input body circumferences, receive an ML-assisted body shape classification with calibrated probabilities, inspect key biomechanical ratios, and access tailored non-medical guidance.

The application is engineered from the ground up to be **lightweight, resource-efficient, and CPU-friendly**, allowing full local execution with zero background daemons.

---

## Key Features

- **ML-Assisted Classification**: Categorizes silhouettes into 5 primary archetypes (*Hourglass*, *Rectangle*, *Pear / Triangle*, *Inverted Triangle*, *Apple / Oval*) with confidence scoring.
- **Biomechanical Ratio Engine**: Automatically extracts Body Mass Index (BMI), Waist-to-Hip Ratio (WHR), Shoulder-to-Hip Ratio (SHR), and Waist-to-Bust Ratio (WBR).
- **Rule-Based Recommendation Engine**: Tailors fitness routines, non-medical nutritional habits, posture cues, and flattering garment silhouettes based on shape, goal, and experience level.
- **Progress Tracking**: Tracks body changes over time with interactive **Recharts** time-series graphs and historical measurement logs.
- **Zero-Daemon Local Persistence**: Thread-safe SQLite persistence with parameterized SQL queries ensuring complete injection protection.
- **Production-Ready**: Multi-stage Dockerfiles, Docker Compose, WSGI entrypoint, and Procfile for cloud deployment.

---

## System Architecture

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

## Technology Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons | Strongly-typed, responsive UI with modern component states and zero CSS runtime bloat. |
| **Visualizations**| Recharts | Composable SVG-based charting for time-series progress tracking. |
| **Backend** | Python 3.13, Flask 3.1, Flask-CORS, Gunicorn | Lightweight, synchronous REST API with sub-10ms response latency. |
| **Machine Learning**| Scikit-learn, Pandas, NumPy, Joblib | CPU-optimized tabular classifiers bundled into a unified Scikit-learn pipeline. |
| **Persistence** | SQLite 3 | Embedded, zero-daemon, serverless database with zero memory footprint during development. |
| **Testing** | Pytest, ESLint | Continuous unit, integration, boundary, and regression testing. |
| **Deployment** | Docker, Docker Compose, Procfile | Containerized multi-stage builds ready for Vercel and Render / Railway. |

---

## Machine Learning Pipeline & Benchmarking

The ML task is formulated as **multi-class tabular classification**. Raw circumferences (`height`, `weight`, `shoulder`, `bust`, `waist`, `hip`) are transformed into engineered anthropometric ratios (`BMI`, `WHR`, `SHR`, `WBR`, `BHR`) and standardized via a `StandardScaler` inside a single Scikit-learn `Pipeline`.

### 4-Model Experimental Benchmark

All candidate models were benchmarked on CPU using **Stratified 5-Fold Cross-Validation** and evaluated on an independent 20% holdout test set (600 samples):

| Model | Training Latency | 5-Fold CV F1 (Macro) | Test Accuracy | Macro Precision | Macro Recall | Macro F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Champion)** | **29.8 ms** | **0.9983 (±0.002)** | **99.50%** | **0.9950** | **0.9950** | **0.9950** |
| **Decision Tree** (`max_depth=6`) | 16.6 ms | 0.9896 (±0.004) | 99.17% | 0.9918 | 0.9917 | 0.9917 |
| **Random Forest** (`n_estimators=50`) | 187.0 ms | 0.9967 (±0.002) | 99.33% | 0.9934 | 0.9933 | 0.9934 |
| **K-Nearest Neighbors** (`k=5`) | 12.0 ms | 0.9967 (±0.003) | 99.17% | 0.9918 | 0.9917 | 0.9917 |

> **Champion Selection**: **Logistic Regression** achieved the highest cross-validated macro F1 score with exceptional calibration, single-digit millisecond inference latency, and negligible model artifact size (< 15 KB).

---

## Academic Integrity: Synthetic Data Caveat & Limitations

> [!CAUTION]
> **Important Note on Dataset & Model Evaluation**:
> The training dataset (3,000 observations) was synthetically generated using documented biomechanical proportion constraints with continuous Gaussian noise ($\sigma \in [1.2, 3.5]\text{ cm}$) to simulate biological variance and measuring errors.
>
> **The high benchmark performance evaluates how accurately conventional classifiers learn and reproduce the underlying geometric proportion rules.**
>
> This benchmark **must not be interpreted as evidence of real-world clinical, epidemiological, or population-level accuracy**. True clinical validation would require training on large-scale optical 3D anthropometric survey databases (such as the CAESAR database) with multi-expert consensus labeling.

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and version check |
| `POST` | `/api/analyze` | Validate measurements, run ML classification, generate recommendations, auto-save |
| `GET` | `/api/recommendations` | Retrieve rule-based guidance matrix by shape, goal, and activity level |
| `POST` | `/api/measurements` | Create a historical measurement log |
| `GET` | `/api/measurements` | List past measurement records |
| `DELETE` | `/api/measurements/:id` | Delete a specific measurement record |
| `GET` | `/api/progress` | Retrieve chronological timeline points for progress charts |

Full API contracts, schemas, and request/response examples are documented in [`docs/api.md`](docs/api.md).

---

## Local Setup & Quickstart

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node v20)
- Git

### 1. Clone & Set Up Backend
```bash
git clone https://github.com/your-username/BodyCurveAnalyzer.git
cd BodyCurveAnalyzer

# Create and activate virtual environment
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install lightweight dependencies
pip install -r backend/requirements.txt
```

### 2. Generate Dataset & Train ML Pipeline
```bash
# Generate synthetic dataset (takes ~0.5s)
python ml/generate_dataset.py

# Run model benchmarking and export champion pipeline (takes ~2s)
python ml/train.py

# Generate experiment markdown report
python ml/evaluate.py
```

### 3. Start the Backend API
```bash
python backend/app.py
# Backend runs at http://localhost:5000
```

### 4. Set Up & Run Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

Open `http://localhost:3000` in your browser.

---

## Automated Testing

The project includes 17 automated tests covering unit, ML pipeline, API validation, boundary edge cases, and SQL injection safety:

```bash
# Run full Pytest suite
pytest tests/

# Run frontend linting & static build check
cd frontend
npm run lint
npm run build
```

---

## Docker Quickstart

To run the entire full-stack application in isolated containers:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## In-Depth Documentation

- 📐 [Architecture & System Design](docs/architecture.md)
- 📊 [Dataset Methodology & Anthropometric Modeling](docs/dataset-methodology.md)
- 🧪 [Machine Learning Experiments & Benchmarks](docs/ml-experiments.md)
- 🔌 [REST API Specifications](docs/api.md)
- 🛡️ [Testing Strategy & Integration Verification](docs/testing.md)

---

## Future Roadmap

- **Phase 2**: User Authentication (JWT-based secure sessions) & multi-user profile switching.
- **Phase 3**: CAESAR 3D Anthropometric Dataset integration for real-world empirical validation.
- **Phase 4**: Privacy-preserving on-device computer vision pose estimation for automated circumference measurement via webcam.
- **Phase 5**: Cross-platform mobile companion app with React Native.

---

## License

MIT License. Designed and engineered as a high-impact AI/ML & Software Engineering portfolio project.
