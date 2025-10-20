# String Analyzer API

A **RESTful API** that analyzes strings, computes metadata, and supports advanced **filtering** — including **natural language queries**.
Built with **Node.js**, **Express**, and **TypeScript** for the **HNG13 Stage 1 Backend Task**.

---

## Features

* **String analysis**:

  * `length`, `is_palindrome`, `unique_characters`, `word_count`
  * `sha256_hash` (unique ID)
  * `character_frequency_map`
* **Persistent storage** (in-memory + JSON file)
* **Filtering** with query params (`is_palindrome`, `min_length`, etc.)
* **Natural language filtering** (e.g., *"all single word palindromic strings"*)
* **Error handling**: returns proper status codes (`400`, `404`, `409`, `422`, `204`)
* **Route order safety** to avoid path conflicts
* **CORS enabled** for frontend integration
* **Type-safe** with TypeScript interfaces

---

## API Endpoints

### 1. `POST /strings` — Analyze & Store String

```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "madam"}'
```

✅ **Response (201)**

```json
{
  "id": "e4d7f1b4f0d3a1c8a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "value": "madam",
  "properties": {
    "length": 5,
    "is_palindrome": true,
    "unique_characters": 3,
    "word_count": 1,
    "sha256_hash": "e4d7f1b4f0d3a1c8a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    "character_frequency_map": { "m": 2, "a": 1, "d": 2 }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```

❌ **Errors**:

* `400`: Missing `value`
* `422`: `value` not a string
* `409`: String already exists

---

### 2. `GET /strings/:id` — Get Specific String

```bash
curl http://localhost:3000/strings/<id>
```

✅ **200 OK**: Returns stored string
❌ **404 Not Found**: `"String not found"`

---

### 3. `GET /strings` — List with Filters

```bash
curl "http://localhost:3000/strings?is_palindrome=true&min_length=5&contains_character=a"
```

✅ **200 OK**

```json
{
  "data": [/* array of StoredString */],
  "count": 3,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "contains_character": "a"
  }
}
```

| Query Param          | Type             | Description      |
| -------------------- | ---------------- | ---------------- |
| `is_palindrome`      | `true` / `false` | Boolean string   |
| `min_length`         | integer ≥ 0      | Minimum length   |
| `max_length`         | integer ≥ 0      | Maximum length   |
| `word_count`         | integer > 0      | Exact word count |
| `contains_character` | single character | Case-insensitive |

❌ **400**: Invalid parameter

---

### 4. `GET /strings/filter-by-natural-language` — Natural Language Filtering

```bash
curl -G "http://localhost:3000/strings/filter-by-natural-language" \
  --data-urlencode "query=all single word palindromic strings"
```

| Example Query                                      | Interpreted As                               |
| -------------------------------------------------- | -------------------------------------------- |
| `all single word palindromic strings`              | `word_count=1`, `is_palindrome=true`         |
| `strings longer than 10 characters`                | `min_length=11`                              |
| `palindromic strings that contain the first vowel` | `is_palindrome=true`, `contains_character=a` |
| `strings containing the letter z`                  | `contains_character=z`                       |

✅ **200 OK**

```json
{
  "data": [/* ... */],
  "count": 2,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": { "word_count": 1, "is_palindrome": true }
  }
}
```

❌ **Errors**:

* `400`: Missing or unparsable `query`
* `422`: Conflicting filters

---

### 5. `DELETE /strings/:id` — Delete String

```bash
curl -X DELETE http://localhost:3000/strings/<id>
```

✅ **204 No Content**
❌ **404 Not Found**: `"String does not exist in the system"`

---

## 🏗 Project Structure

```
string-analyzer-api/
├── src/
│   ├── index.ts           # Main server & routes
│   ├── types.ts           # Interfaces (responses, errors)
│   ├── utils/
│   │   ├── helpers.ts     # analyzeString, load/save, sendError
│   │   └── nlParser.ts    # Natural language parser
├── data.json              # Persistent storage (auto-created)
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

---

## ⚙️ Setup & Installation

```bash
# Clone the repo
git clone https://github.com/blard-omu/string-analyzer-api.git
cd string-analyzer-api

# Install dependencies
npm install

# Build TypeScript
npm run build
```

---

## Running Locally

```bash
# Development mode
npm run dev

# Production
npm start
```

> Server runs at `http://localhost:3000`

---

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `PORT`   | `3000`  | Server port |

---

## Testing with cURL

```bash
# Create a new string
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'

# Natural language filter
curl -G "http://localhost:3000/strings/filter-by-natural-language" \
  --data-urlencode "query=palindromic strings that contain the first vowel"

# Basic filtering
curl "http://localhost:3000/strings?is_palindrome=true&word_count=1"
```

---

## Deployment

✅ Allowed: Railway, Heroku, AWS, PXXL App
❌ Forbidden: Vercel

### Deploy to Railway

1. Push project to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Link GitHub repo
4. Set `PORT` if needed
5. Deploy and get your live URL:

   ```
   https://your-app.up.railway.app
   ```

---

## Submission Instructions

Use the **Thanos bot** in `#stage-1-backend` channel:

```
/stage-one-backend
```

Submit:

* **API Base URL:** `https://your-app.up.railway.app`
* **GitHub Repo:** `https://github.com/yourusername/string-analyzer-api`
* **Full Name:** Your Name
* **Email:** [your.email@example.com](mailto:your.email@example.com)
* **Stack:** Node.js + Express + TypeScript

> **Deadline**: October 22, 2025 — 11:59 PM WAT

---

## Testing & Validation Checklist

* All endpoints tested with cURL
* Natural language parser works with provided queries
* Route order prevents conflicts
* Strict query validation (no silent failures)
* Proper error messages and HTTP status codes

---

## Author

**Your Name**

* GitHub: [@Blard-Omu](https://github.com/Blard-omu)
* Email: [peteromu76@gmail.com](mailto:peteromu76@gmail.com)

---

## License

[ISC](LICENSE)
