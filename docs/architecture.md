# TestPilot Architecture & Technical Specification

TestPilot is an AI-powered API quality engineering platform designed with a **deterministic testing core first** and **optional local AI integration**.

## Core Architecture

```text
User / Client
      │
      ▼
React 18 + Vite SPA Dashboard
      │
      ▼ (HTTP / REST)
Express.js Monolith API Server
  ├── Auth Controller (JWT + bcryptjs)
  ├── Project & Spec Importer (JSON / YAML OpenAPI 3.x)
  ├── Deterministic Test Generator (Happy Path, Required Fields, Types, Boundaries, Enums, Params, Auth)
  ├── Playwright Execution Engine (APIRequestContext)
  ├── Contract & Schema Validator (Ajv)
  ├── Quality Scoring Engine (Weighted Formula 0-100)
  └── AIService (Ollama Local LLM Provider + Deterministic Fallback)
```

## Quality Score Formula

$$\text{Quality Score} = \sum_{c} w_c \cdot S_c$$

| Category | Weight ($w_c$) |
| :--- | :--- |
| **Functional Coverage** | **30%** |
| **Contract Validation** | **25%** |
| **Negative Coverage** | **15%** |
| **Boundary Coverage** | **10%** |
| **Security Checks** | **10%** |
| **Execution Success** | **10%** |

## Database Schema (MongoDB / Mongoose)

- `User`: Credentials and authentication metadata.
- `Project`: Project ownership and description.
- `ApiSpec`: Imported raw & normalized OpenAPI 3.x document schemas.
- `Environment`: Target base URLs, auth config, variables.
- `TestCase`: Generated deterministic test definitions with assertions.
- `TestRun`: Async test suite execution run headers & scores.
- `TestResult`: Detailed assertion results, duration, request/response metadata.
- `AIReport`: AI-generated failure explanations and developer recommendations.
