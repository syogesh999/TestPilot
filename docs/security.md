# Security Architecture & Controls

TestPilot implements strict security-first engineering practices.

## 1. SSRF (Server-Side Request Forgery) Protection

TestPilot executes outbound HTTP requests against user-specified target API servers. To prevent malicious SSRF attacks:
- Internal AWS/GCP cloud metadata IP addresses (`169.254.169.254`, `metadata.google.internal`) are blocked at the network middleware layer (`ssrfProtection.js`).
- Target URLs are validated before execution.
- Protocols are strictly limited to `http:` and `https:`.

## 2. Password & Secret Management

- User passwords are standard bcrypt hashed with 10 salt rounds.
- Plaintext passwords and long-lived secrets are masked via `secretMasker.js` before logging or storing.
- JWT secret tokens are passed securely via environment variables (`JWT_SECRET`).

## 3. Input Validation & Code Isolation

- Uploaded OpenAPI JSON/YAML specifications are validated strictly using schema parsers (`yaml` & `parser.js`).
- Test cases are executed isolated via Playwright's `APIRequestContext`, preventing arbitrary model-generated JavaScript execution.
