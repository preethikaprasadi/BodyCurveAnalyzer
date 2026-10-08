# BodyCurve Analyzer REST API Documentation

Base URL: `http://localhost:5000` (Local) / `/api`

All requests and responses use `application/json` content-type.

---

## 1. System Health

### `GET /api/health`
Returns health check status and service metadata.

#### Response:
```json
{
  "service": "BodyCurve Analyzer Backend API",
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 2. Body Shape Analysis & Inference

### `POST /api/analyze`
Validates input measurements, executes Scikit-learn inference, generates recommendations, and optionally saves the record.

#### Request Body:
| Field | Type | Required | Bounds | Description |
| :--- | :---: | :---: | :---: | :--- |
| `height` | `float` | Yes | 100.0 - 250.0 | Height in cm |
| `weight` | `float` | Yes | 25.0 - 300.0 | Weight in kg |
| `shoulder` | `float` | Yes | 20.0 - 80.0 | Shoulder biacromial width in cm |
| `bust` | `float` | Yes | 40.0 - 200.0 | Fullest chest circumference in cm |
| `waist` | `float` | Yes | 30.0 - 200.0 | Natural waist circumference in cm |
| `hip` | `float` | Yes | 40.0 - 220.0 | Widest hip circumference in cm |
| `goal` | `string` | No | `maintain`, `muscle_gain`, `fat_loss`, `mobility` | Fitness goal |
| `activityLevel` | `string` | No | `beginner`, `intermediate`, `advanced` | Experience level |
| `saveRecord` | `boolean`| No | `true`, `false` | Whether to persist in SQLite |
| `notes` | `string` | No | Any | Optional observation notes |

#### Example Request:
```json
{
  "height": 165.0,
  "weight": 60.0,
  "shoulder": 36.0,
  "bust": 92.0,
  "waist": 64.0,
  "hip": 94.0,
  "goal": "muscle_gain",
  "activityLevel": "intermediate",
  "saveRecord": true
}
```

#### Successful Response (`200 OK`):
```json
{
  "success": true,
  "inputMeasurements": {
    "bust": 92.0,
    "height": 165.0,
    "hip": 94.0,
    "shoulder": 36.0,
    "waist": 64.0,
    "weight": 60.0
  },
  "analysis": {
    "bodyShape": "hourglass",
    "displayName": "Hourglass",
    "description": "Balanced bust and hip measurements with a distinctly defined, narrower waist.",
    "confidence": 0.996,
    "modelUsed": "Logistic Regression",
    "probabilities": {
      "apple": 0.0001,
      "hourglass": 0.9962,
      "inverted_triangle": 0.0004,
      "pear": 0.0018,
      "rectangle": 0.0015
    },
    "proportions": {
      "bmi": 22.04,
      "bmiCategory": "Normal weight",
      "bustHipRatio": 0.979,
      "shoulderHipRatio": 0.383,
      "waistBustRatio": 0.696,
      "waistHipRatio": 0.681
    }
  },
  "recommendations": {
    "bodyShape": "hourglass",
    "displayName": "Hourglass",
    "summary": "Proportions are naturally balanced with a defined waist...",
    "fitness": { ... },
    "wellness": { ... },
    "fashion": { ... }
  },
  "savedRecord": {
    "id": 1,
    "date": "2026-09-27",
    "bodyShape": "hourglass",
    "confidence": 0.996
  }
}
```

#### Validation Error (`400 Bad Request`):
```json
{
  "success": false,
  "error": "Validation failed.",
  "details": [
    "Field 'height' (450.0 cm) is outside biologically plausible range [100.0 - 250.0 cm].",
    "Missing required field: 'waist' (Waist)."
  ]
}
```

---

## 3. Recommendations

### `GET /api/recommendations`
Query tailored recommendations without running an inference analysis.

#### Query Parameters:
- `bodyShape` (optional, default: `hourglass`): `hourglass`, `rectangle`, `pear`, `inverted_triangle`, `apple`
- `goal` (optional, default: `maintain`): `maintain`, `muscle_gain`, `fat_loss`, `mobility`
- `activityLevel` (optional, default: `beginner`): `beginner`, `intermediate`, `advanced`

#### Example Request:
`GET /api/recommendations?bodyShape=pear&goal=muscle_gain&activityLevel=intermediate`

---

## 4. Measurement Tracking & Progress

### `POST /api/measurements`
Manually create a measurement record in SQLite.
#### Response: `201 Created`

### `GET /api/measurements`
Retrieve past measurement logs.
- Query parameters: `userId` (optional), `limit` (default: 100).
#### Response: `200 OK`

### `GET /api/measurements/:id`
Retrieve a single measurement by ID.

### `DELETE /api/measurements/:id`
Delete a specific measurement record.
#### Response: `200 OK`

### `GET /api/progress`
Retrieve timeline points ordered chronologically for visualization charts.
- Query parameters: `userId` (optional).

#### Example Response:
```json
{
  "success": true,
  "data": {
    "totalRecords": 3,
    "timeline": [
      {
        "date": "2026-07-01",
        "weight": 65.0,
        "waist": 70.0,
        "hip": 98.0,
        "bust": 92.0,
        "bmi": 23.88,
        "waistHipRatio": 0.714,
        "bodyShape": "hourglass"
      }
    ]
  }
}
```

---

## 5. User Authentication & Profile Management

All authenticated endpoints require an `Authorization: Bearer <token>` HTTP header.

### `POST /api/auth/register`
Registers a new user account with secure password hashing and returns an initial JWT authentication token.

#### Request Body:
| Field | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| `name` | `string` | Yes | Full name (minimum 2 chars) |
| `email` | `string` | Yes | Valid email address |
| `password` | `string` | Yes | Raw password (minimum 6 chars) |
| `ageRange` | `string` | No | Age bracket (e.g. `20-29`, `30-39`) |
| `gender` | `string` | No | Self-identified gender |
| `goal` | `string` | No | Default fitness goal |
| `activityLevel` | `string` | No | Activity level |

#### Response (`201 Created`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr_9981a2f0-...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "ageRange": "25-29",
    "gender": "female",
    "goal": "maintain",
    "activityLevel": "intermediate"
  }
}
```

### `POST /api/auth/login`
Authenticates credentials against stored password hashes and issues a 7-day signed JWT token.

#### Request Body:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr_9981a2f0-...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "ageRange": "25-29",
    "gender": "female",
    "goal": "maintain",
    "activityLevel": "intermediate"
  }
}
```

### `GET /api/auth/me`
Fetches the currently authenticated profile using the Bearer JWT token.

#### Headers:
`Authorization: Bearer <token>`

#### Response (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": "usr_9981a2f0-...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "ageRange": "25-29",
    "gender": "female",
    "goal": "maintain",
    "activityLevel": "intermediate"
  }
}
```

### `PUT /api/auth/profile`
Updates profile demographics, goals, or activity level.

#### Headers:
`Authorization: Bearer <token>`

#### Request Body:
```json
{
  "name": "Jane Smith",
  "ageRange": "30-39",
  "gender": "female",
  "goal": "muscle_gain",
  "activityLevel": "advanced"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": "usr_9981a2f0-...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "ageRange": "30-39",
    "gender": "female",
    "goal": "muscle_gain",
    "activityLevel": "advanced"
  }
}
```

