# Serverless JSON Validator & Formatter

> A serverless-ready, cloud-native validation engine providing syntax verification, JSON Schema (draft-07) compliance checking, formatting, and structural diff comparison.

---

## 1. Project Overview

The **Serverless JSON Validator & Formatter** is an asynchronous microservice and cloud utility designed to enforce data contract integrity across distributed APIs, event streaming pipelines, and serverless architectures. Built on Node.js and Express utilizing the high-speed Ajv (Another JSON Schema Validator) compilation engine, it processes JSON payloads without requiring persistent state or infrastructure management.

In addition to pinpointing syntax anomalies with line and column precision, the service validates arbitrary JSON documents against JSON Schema specifications, formats strings (prettification, minification, and alphabetical key canonicalization), computes tree diffs between two payloads, and measures object nesting metrics. It exposes both a public RESTful API and an interactive violet-themed browser console.

---

## 2. Problem Statement

Modern cloud-native architectures rely extensively on JSON as the lingua franca for microservice communication, cloud queues (e.g., AWS SQS, Google Cloud Pub/Sub), webhook deliveries, and configuration manifests (e.g., Kubernetes, CloudFormation). Schema drift, malformed syntax, and unvalidated payloads frequently trigger cascading microservice failures, data pipeline dead-letter queues, and silent data corruption.

Validating payloads before processing or queuing is vital. However, embedding large schema engines into every microservice inflates memory footprints and maintenance complexity. Deploying a dedicated, stateless serverless JSON validation engine offloads syntax checking and schema contract verification to lightweight, globally scalable endpoints.

---

## 3. Objectives

- Implement an enterprise-grade JSON validation microservice capable of executing in serverless environments (e.g., Vercel, AWS Lambda).
- Provide syntax validation with exact error localization (line, column, and error context).
- Deliver JSON Schema (draft-07) validation via Ajv with detailed diagnostic error lists.
- Offer deterministic JSON manipulation tools including canonical key sorting, prettification, and whitespace stripping.
- Provide a deep recursive object comparison algorithm detailing keys added, removed, changed, or type-shifted.
- Supply an interactive, tabbed dashboard enabling developers to inspect, format, validate, and diff payloads.
- Guarantee reliability with comprehensive unit and integration test coverage across all features using Jest and Supertest.

---

## 4. Features

- **Syntax Validation with Context:**
  - Fast JSON parse validation returning precise line number, column, and code context upon error.
- **JSON Schema (draft-07) Validation:**
  - Full support for schema constraints (`type`, `properties`, `required`, `minimum`, `maximum`, `pattern`, `format`).
  - Aggregation of all validation errors in a single execution pass using `allErrors: true`.
- **JSON Transformation Tools:**
  - **Prettify:** Configurable indentation (default 2 spaces).
  - **Minify:** Strips extra whitespace for bandwidth optimization.
  - **Sort Keys:** Recursively sorts object keys alphabetically to create canonical representations.
- **Deep Structural JSON Diff:**
  - Compares two arbitrary JSON objects and returns semantic differences labeled as `added`, `removed`, `changed`, or `type_changed` with exact JSON pointer paths.
- **Document Profiling:**
  - Extracts structural metadata including byte size, nesting depth, root type, and top-level key lists.
- **Violet-Themed Single-Page Interface:**
  - Dedicated tabs for Validation, Formatting, Comparison, and Profiling.
  - Sample dataset loading buttons for rapid demonstration.

---

## 5. Cloud Computing Concepts Demonstrated

| Concept | Implementation in this Project |
| :--- | :--- |
| **Serverless Functions (FaaS)** | Adapts Express endpoints into stateless Vercel Serverless Functions triggered per HTTP event. |
| **API Gateway Pattern** | Serves as an input validation gatekeeper filtering payloads before they reach downstream compute instances. |
| **Stateless Execution** | Zero session state stored between requests; easily horizontally scalable across multiple cloud availability zones. |
| **Edge Computing Readiness** | Lightweight dependencies allow rapid cold starts and edge execution near end-users. |
| **Microservice Decoupling** | Isolates schema validation and document comparison logic from business applications. |

---

## 6. Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | >= 18.0.0 | JavaScript runtime |
| **Framework** | Express.js | ^4.18.2 | REST API routing and middleware pipeline |
| **Schema Engine** | Ajv | ^8.12.0 | JSON Schema draft-07 compiler and validator |
| **Schema Formats** | Ajv-Formats | ^2.1.1 | Semantic formats (date-time, email, uri, etc.) |
| **CORS Support** | CORS | ^2.8.5 | Cross-Origin Request Sharing handler |
| **Frontend** | HTML5 / CSS3 / ES6 | Native | Interactive single-page user interface |
| **Testing** | Jest & Supertest | ^29.7.0 / ^6.3.3 | Automated unit and API integration testing |

---

## 7. Architecture & Workflow

```
+--------------------------------------------------------------------------+
|                               Client Layer                               |
|        Web Interface (Multi-Tab)     OR     Upstream Cloud Microservice   |
+------------------------------------+-------------------------------------+
                                     |
                                 HTTP POST
                                     v
+--------------------------------------------------------------------------+
|                     Cloud Edge / Serverless Gateway                      |
|                        (Vercel / Render Router)                          |
+------------------------------------+-------------------------------------+
                                     |
                               src/server.js
                                     v
                         src/routes/validatorRoutes.js
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
+------------------+       +-------------------+       +-------------------+
|  jsonValidator   |       |   jsonFormatter   |       |   jsonComparator  |
| - validateSyntax |       | - prettify()      |       | - compare()       |
| - validateSchema |       | - minify()        |       | - deepCompare()   |
| - getJsonInfo()  |       | - sortKeys()      |       | - type checking   |
+------------------+       +-------------------+       +-------------------+
         |                           |                           |
         +---------------------------+---------------------------+
                                     |
                           Structured JSON Output
                                     v
                           HTTP 200 OK Response
```

---

## 8. Folder Structure

```
project-3-json-validator/
├── .env.example              # Environment variables template
├── .gitignore                # Exclusions for node_modules, .env, and coverage
├── README.md                 # Project documentation
├── package.json              # Dependencies and script definitions
├── vercel.json               # Serverless deployment configuration
├── public/
│   ├── index.html            # Multi-tab single page application
│   ├── css/
│   │   └── styles.css        # Violet-themed stylesheet
│   └── js/
│       └── app.js            # Client-side tab navigation and API integration
├── src/
│   ├── server.js             # Express server setup and static host
│   ├── routes/
│   │   └── validatorRoutes.js# REST API endpoint definitions
│   ├── services/
│   │   ├── jsonValidator.js  # Ajv compilation and syntax check service
│   │   ├── jsonFormatter.js  # Formatting, minification, and key sorting
│   │   └── jsonComparator.js # Deep object difference detection
│   └── utils/
│       └── errorParser.js    # Line/column extraction and contextual error logs
└── tests/
    ├── api.test.js           # Integration tests for Express routes
    ├── jsonComparator.test.js# Unit tests for structural diffs
    ├── jsonFormatter.test.js # Unit tests for prettify, minify, and sorting
    └── jsonValidator.test.js # Unit tests for syntax and schema validation
```

---

## 9. Prerequisites

- **Node.js:** version `18.x` or later
- **npm:** version `9.x` or later
- **Git:** version `2.x` or later

---

## 10. Installation & Local Setup

1. **Navigate to the project folder:**
   ```bash
   cd cloud-computing-projects/project-3-json-validator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up local environment variables:**
   ```bash
   cp .env.example .env
   ```

---

## 11. Environment Variable Configuration

| Variable | Description | Default Value | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Local HTTP listening port | `3000` | No |
| `NODE_ENV` | Runtime mode (`development`, `production`, `test`) | `development` | No |
| `MAX_JSON_SIZE` | Maximum incoming request body limit | `2097152` (2MB) | No |

---

## 12. How to Run the Application

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```
*Expected Output:*
```
JSON Validator server running on port 3000
API available at http://localhost:3000/api
Frontend available at http://localhost:3000
```

Access the web interface at `http://localhost:3000`.

---

## 13. How to Test

Execute the Jest automated test suite:

```bash
npm test
```

### Coverage Report:
```bash
npm run test:coverage
```

*Expected Verification Output:*
```
PASS tests/jsonValidator.test.js
PASS tests/jsonFormatter.test.js
PASS tests/jsonComparator.test.js
PASS tests/api.test.js

Test Suites: 4 passed, 4 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        1.45 s
```

---

## 14. API Documentation

### 1. Validate Syntax
- **Endpoint:** `POST /api/validate`
- **Request Body:** `{ "json": "{\"name\": \"Alice\", \"role\": \"Admin\"}" }`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": {
      "valid": true,
      "error": null
    }
  }
  ```

### 2. Validate Against JSON Schema
- **Endpoint:** `POST /api/validate-schema`
- **Request Body:**
  ```json
  {
    "json": "{\"name\": \"Bob\", \"age\": 15}",
    "schema": "{\"type\": \"object\", \"properties\": {\"age\": {\"minimum\": 18}}, \"required\": [\"age\"]}"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": {
      "valid": false,
      "errors": [
        {
          "path": "/age",
          "message": "must be >= 18",
          "keyword": "minimum",
          "params": { "limit": 18 }
        }
      ]
    }
  }
  ```

### 3. Format JSON
- **Endpoint:** `POST /api/format`
- **Request Body:** `{ "json": "{\"b\":2,\"a\":1}", "action": "sort-keys" }`
- **Actions:** `prettify`, `minify`, `sort-keys`, `yaml-like`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "action": "sort-keys",
    "formatted": "{\n  \"a\": 1,\n  \"b\": 2\n}"
  }
  ```

### 4. Compare JSON Documents
- **Endpoint:** `POST /api/compare`
- **Request Body:**
  ```json
  {
    "json1": "{\"user\": \"Alice\", \"role\": \"User\"}",
    "json2": "{\"user\": \"Alice\", \"role\": \"Admin\", \"active\": true}"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "result": {
      "identical": false,
      "differences": [
        {
          "path": "/role",
          "type": "changed",
          "oldValue": "User",
          "newValue": "Admin"
        },
        {
          "path": "/active",
          "type": "added",
          "oldValue": null,
          "newValue": true
        }
      ]
    }
  }
  ```

### 5. Document Metadata & Profiling
- **Endpoint:** `POST /api/info`
- **Request Body:** `{ "json": "{\"items\": [1, 2, 3]}" }`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "info": {
      "type": "object",
      "keys": ["items"],
      "depth": 2,
      "size": 20
    }
  }
  ```

---

## 15. Cloud Deployment Instructions

### Deploy to Vercel (Serverless FaaS)
1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Run deployment from the project root:
   ```bash
   vercel
   ```
3. Vercel utilizes `vercel.json` to configure the API routes as Serverless Functions and serve `public/` over global Edge CDN.

### Deploy to Render (Web Service)
1. In the [Render Dashboard](https://render.com), create a new **Web Service**.
2. Link your `serverless-json-validator` GitHub repository.
3. Configure:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy the service to obtain your public `.onrender.com` URL.

---

## 16. Verified Live Website URL

- **GitHub Repository:** https://github.com/nagavishwa-spidey/serverless-json-validator
- **Live Deployment URL:** _To be updated after cloud provider deployment verification_

---

## 17. Screenshots & Visual Captures

To document application capabilities:
1. Open the web interface in your browser.
2. Under the **Validate** tab, input invalid JSON and capture the syntax error with line/column highlighting.
3. Provide a JSON Schema and document schema violation alerts.
4. Under the **Compare** tab, input two distinct JSON documents and capture the visual diff highlighting additions and modifications.
5. Save captures in `assets/screenshots/`:
   - `01-syntax-validation.png`: Error banner indicating invalid syntax with context snippet.
   - `02-schema-validation.png`: Schema compliance checklist and failure parameters.
   - `03-diff-comparison.png`: Color-coded difference list between two documents.

---

## 18. Limitations & Future Improvements

- **JSON Schema Versions:** Currently optimized for draft-07; support for draft 2020-12 can be enabled.
- **Large Document Streaming:** Ingestion currently buffers the JSON payload up to 2MB; streaming token parsers (e.g., `stream-json`) can be integrated for 100MB+ documents.
- **Visual JSON Tree View:** Expand web dashboard with collapsible interactive node trees.

---

## 19. License

This project is open-source software licensed under the **MIT License**.

---

## 20. Author

Developed by **nagavishwa-spidey** for Cloud Computing Engineering.
