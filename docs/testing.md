# Testing Strategy & Automated Verification

## 1. Testing Philosophy

BodyCurve Analyzer implements an incremental testing strategy. Rather than postponing testing to the end of development, tests were written alongside each milestone:
1. **Milestone 1**: Environment & Sanity verification.
2. **Milestone 2**: ML mathematical feature extraction, pipeline loading, and boundary predictions.
3. **Milestone 3**: REST API contract, input validation rules, and SQLite CRUD.
4. **Milestone 4**: Frontend component type safety and static page rendering.
5. **Milestone 5**: Full-stack integration, SQL injection safety, and physiological boundary limits.

---

## 2. Test Suite Breakdown

### 2.1 Backend & ML Test Suites (`tests/`)

| Test File | Focus Area | Key Scenarios Tested |
| :--- | :--- | :--- |
| `tests/test_sanity.py` | Environment | Verification of Python 3.13, Scikit-learn, Pandas, NumPy, and Flask imports. |
| `tests/test_ml.py` | ML Pipeline | Dataset schema & class balance, feature engineering formula precision, transformer dimension consistency, pipeline persistence, calibrated probability distributions, and outlier handling. |
| `tests/test_api.py` | API Layer | HTTP 200 on valid inputs, HTTP 400 on missing or non-numeric fields, HTTP 400 on biologically impossible values, recommendation retrieval across shapes, and complete measurement CRUD cycle. |
| `tests/test_auth.py` | Authentication | User registration, password hashing, duplicate email rejection, validation errors, login credentials verification, JWT issuance, profile updates, and protected route access. |
| `tests/test_integration.py` | System E2E | End-to-end classification of all 5 archetypes, auto-save persistence, progress timeline retrieval, extreme physiological bounds (e.g. 100cm/25kg vs 250cm/300kg), and SQL injection payload neutralization. |

### 2.2 Frontend Verification (`frontend/`)
- **TypeScript Type Safety**: 100% strict type coverage across API responses, form inputs, and state variables (`tsc --noEmit`).
- **ESLint Cleanliness**: Strict conformance with Next.js core web vitals and React hook exhaustive dependency rules (`next lint`).
- **Build Compilation**: Full static generation and optimization across all 12 App Router routes (`next build`).

---

## 3. Running Tests Locally

### Running Backend Tests
Activate the virtual environment and execute Pytest:
```bash
# Windows PowerShell
.\.venv\Scripts\pytest.exe tests/

# macOS / Linux
source .venv/bin/activate
pytest tests/
```

### Running Frontend Checks
```bash
cd frontend
npm run lint
npm run build
```
