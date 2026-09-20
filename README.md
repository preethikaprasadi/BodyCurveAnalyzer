# BodyCurve Analyzer

> AI/ML-assisted body proportion analysis and personalized wellness platform.

## Overview

BodyCurve Analyzer is an end-to-end full-stack machine learning application that analyzes user-provided body measurements, determines anatomical body-shape classifications using reproducible Scikit-learn tabular models, and generates personalized, non-medical wellness, fitness, and fashion styling recommendations.

## Architecture

```text
bodycurve-analyzer/
├── frontend/          # Next.js 14, TypeScript, Tailwind CSS, Recharts
├── backend/           # Flask REST API, ML Inference Service, Recommendation Engine
├── ml/                # Dataset generation, feature engineering, model benchmarking
├── tests/             # Automated test suite (Pytest)
├── docs/              # In-depth architectural & ML methodology documentation
├── README.md
└── .gitignore
```

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Python 3.13, Flask, Flask-CORS
- **Machine Learning**: Scikit-learn, Pandas, NumPy, Joblib
- **Testing**: Pytest
- **Database**: SQLite (Zero-daemon, local persistence)
