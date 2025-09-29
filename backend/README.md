# ChalaniAI Backend API

## Overview

ChalaniAI is a TypeScript-based Express API that powers the ChalaniAI invoice automation platform. The service focuses on providing secure, reliable endpoints for invoice lifecycle management, user authentication, and operational insights. This document captures everything an engineer, SRE, or stakeholder needs to run, integrate with, and extend the backend.

- **Runtime:** Node.js 20+, Express 5, TypeScript
- **Core tooling:** Zod for validation, Winston for structured logging, Helmet & custom CORS for security, Jest & Supertest for automated tests
- **Deployment targets:** Container-friendly (stateless), suitable for PaaS (Render, Heroku), serverless adapters, or self-hosted environments

> **Status:** The current implementation exposes a minimal health endpoint while the rest of the feature set is under active development. The patterns described here (versioning, error envelopes, standards) are ready for immediate adoption as functionality grows.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Environment Configuration](#environment-configuration)
5. [Running the Service](#running-the-service)
6. [API Standards](#api-standards)
7. [API Reference](#api-reference)
8. [Error Model](#error-model)
9. [Validation](#validation)
10. [Security](#security)
11. [Logging & Observability](#logging--observability)
12. [Testing Strategy](#testing-strategy)
13. [Project Structure](#project-structure)
14. [Operational Playbook](#operational-playbook)
15. [Roadmap & Next Steps](#roadmap--next-steps)

---

## Architecture

- **Entry point:** `index.ts` wires configuration, logging, and the HTTP server defined in `src/server.ts`.
- **Application shell:** `src/app.ts` attaches global middleware (Helmet, JSON parsing, static assets, cookies) and mounts the router in `src/routes`.
- **Configuration:** `src/config` loads `.env`, validates via Zod, and exports a strongly typed config object.
- **Utilities:**
  - `src/lib/logger.ts` creates a Winston logger with JSON output, console transport in non-test environments, and file transports in production.
  - `src/lib/validate.ts` provides a reusable helper that throws typed `APIError` instances on validation failures.
  - `src/utils/response.ts` centralizes success and error response helpers.
- **Middleware:**
  - `src/middleware/compression.ts` configures adaptive compression with media-type guards.
  - `src/middleware/globalErrorHandler.ts` standardizes error handling and logging.
- **Routes:** Currently limited to the root router (`GET /`) for service health; future modules (auth, invoices, users) should reside under `src/routes` with feature-specific routers.

---

## Prerequisites

- Node.js **20.x** or higher
- npm **10.x** or higher (ships with Node 20)
- Git (for cloning the repository)
- (Optional) Docker for containerized local development

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/PrithiviPM2580/chalani-ai.git
cd chalani-ai/backend

# Install dependencies
npm install

# Copy environment template (if provided) and configure values
cp .env.example .env  # create this file if it does not exist yet
```

> If `.env.example` is not present, create `.env` manually using the variables listed below.

---

## Environment Configuration

Configuration is validated at startup via Zod. Missing or malformed values trigger a structured `APIError` with HTTP 400.

| Variable         | Required | Default                 | Description                                                                                        |
| ---------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `PORT`           | No       | `3000`                  | HTTP port the API listens on. Must be between 1 and 65535.                                         |
| `NODE_ENV`       | No       | `development`           | Environment mode. Supports `development`, `test`, and `production`. Controls logging & middleware. |
| `LOG_LEVEL`      | No       | `info`                  | Winston log level (`debug`, `info`, `warn`, `error`).                                              |
| `CORS_WHITELIST` | No       | `http://localhost:5173` | Comma-separated whitelist of origins allowed by the CORS middleware.                               |

> **Tip:** When deploying to production, ensure `NODE_ENV=production` and provide a robust `CORS_WHITELIST` and log aggregation strategy.

---

## Running the Service

```bash
# Start in watch mode with TS path mapping
npm run dev

# Compile TypeScript to ./dist
npm run build

# Run production bundle
npm run start

# Execute all tests
npm test
```

The dev command uses `tsx` with `tsconfig-paths/register`, enabling absolute imports such as `@/routes`.

---

## API Standards

- **Base URL:** By convention, future endpoints should live under `/api/v1`. The health check remains at `/` for infrastructure probes.
- **Versioning:** Adopt URI versioning (`/api/v{n}`) with semantic bump rules:
  - `v1`: initial stable contract
  - Minor breaking changes require a new major version
  - Sunset older versions with deprecation headers (`Sunset`, `Deprecation`) when feasible.
- **Content-Type:** All JSON endpoints must require `Content-Type: application/json` and respond with UTF-8 encoded JSON.
- **Authentication:** Not yet implemented. Preferred strategy is JWT or session tokens with short-lived access tokens and refresh handling.
- **Pagination & Filtering:** Reserve the conventions `?page`, `?limit`, `?sort`, and `?filter[field]` for collection endpoints.
- **Idempotency:** Non-GET endpoints that create or mutate resources should support Idempotency-Key headers once implemented.

---

## API Reference

### Health Check – `GET /`

Simple heartbeat endpoint used by monitoring systems or load balancers.

- **Purpose:** Verify that the API instance is reachable and bootstrapped.
- **Auth:** None
- **Request Body:** _Not applicable_
- **Query Params:** _Not applicable_

#### Example Request

```bash
curl -X GET http://localhost:3000/
```

#### Example Response — 200 OK

```json
{
  "message": "API is running",
  "status": "success",
  "version": "1.0.0",
  "docs": "/docs",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

> **Note:** `version` is hard-coded today; as new releases ship, keep this value synchronized with `package.json` or inject it via build metadata.

### Future Endpoints

The following modules are planned and will follow the standards defined above:

- `POST /api/v1/auth/login` – user authentication
- `POST /api/v1/invoices` – create invoices from structured payloads and uploaded files
- `GET /api/v1/invoices/:invoiceId` – retrieve invoice details (with PDF links)
- `PATCH /api/v1/invoices/:invoiceId/status` – update invoice status lifecycle

When implementing, inherit the error model and validation workflow described below.

---

## Error Model

All errors normalize to the following envelope and are logged with contextual metadata:

```json
{
  "success": false,
  "status": "error | fail",
  "message": "Human-readable summary",
  "errors": [
    {
      "field": "optional.field.path",
      "message": "Validation or domain-specific detail"
    }
  ]
}
```

- `status="fail"` is reserved for client-side issues such as validation errors.
- `status="error"` denotes unexpected server faults.
- `errors` array may be empty when no field-level issues apply.
- The `APIError` class ensures stack traces are preserved and consistent HTTP status codes are returned.

To raise a domain-specific failure, throw `new APIError('fail', 422, 'Invoice payload invalid', [{ field: 'lineItems[0].amount', message: 'Must be positive' }])`.

---

## Validation

- Zod schemas live in `src/validation`. They provide type inference and runtime guarantees.
- `validate(schema, data)` returns typed data or throws `APIError` with a normalized `errors` payload.
- Prefer colocating request schemas alongside route handlers, then re-exporting for reuse in tests.
- Keep schemas consistent with frontend form contracts to minimize drift.

---

## Security

- **Helmet:** Adds sensible HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.). Extend the configuration before shipping to production (e.g., CSP, HSTS).
- **CORS:** Only allows whitelisted origins outside of development. Review and tighten before public launch.
- **Compression:** Skips compressing already-compressed assets and large binary streams to avoid CPU waste and BREACH-style issues.
- **Error Hygiene:** Stack traces are not returned to clients; only logged internally.
- **Secrets Management:** Avoid committing `.env`. Use a secrets manager (Doppler, Vault, AWS Secrets Manager) in higher environments.

---

## Logging & Observability

- Winston logger writes JSON logs with timestamps and error stacks.
- In production, logs are sent to `logs/error.log` and `logs/combined.log` (configure log shipping via Fluent Bit, Vector, etc.).
- Each successful response can be wrapped with `successResponse` to capture structured audit logs.
- For distributed tracing, integrate OpenTelemetry by adding middleware before route registration.

---

## Testing Strategy

- **Unit tests:** Place under `test/unit`. Use Jest with `ts-jest` for TypeScript-friendly assertions.
- **Integration tests:** Use Supertest to hit the Express app; store under `test/integration`.
- **Test setup:** Shared hooks live in `test/setup.ts`.
- **Continuous Integration:** Leverage `npm run test:ci` for coverage and parallelizable runs.
- Add fixtures and contract tests for every new endpoint to maintain API guarantees.

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── @types/
│   ├── config/
│   ├── lib/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── validation/
├── test/
│   ├── integration/
│   └── unit/
├── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Operational Playbook

- **Liveness & Readiness:** Point probes to `GET /` in Kubernetes, ECS, or Load Balancer configs. Expand to `/health/live` & `/health/ready` once dependencies (DB, message queues) are introduced.
- **Graceful Shutdown:** Implement signal handling in `index.ts` before production (close DB connections, flush logs).
- **Deployments:** Use blue/green or rolling deployments. Ensure config validation fails fast to avoid serving traffic with invalid settings.
- **Monitoring:** Forward structured logs to your SIEM. Add metrics (request rate, latency, error ratio) via middleware (e.g., `prom-client`).
- **Backups:** For persistence layers (to be added), schedule backups and document restore procedures.

---

## Roadmap & Next Steps

1. **Routing Expansion:** Scaffold `/api/v1/auth` and `/api/v1/invoices` routers with modular controllers and services.
2. **Swagger/OpenAPI:** Auto-generate interactive docs (Swagger UI) served from `/docs`.
3. **Authentication:** Integrate JWT-based auth and role-based access control.
4. **Persistence Layer:** Introduce a database (PostgreSQL or MongoDB) with Prisma/TypeORM and migration strategy.
5. **Background Processing:** Add job queue for PDF generation and notification pipelines.
6. **Observability Enhancements:** Wire metrics, tracing, and alerting.

---

## Support & Contribution

- Check open issues or create new ones in the [GitHub repository](https://github.com/PrithiviPM2580/chalani-ai/issues).
- Follow conventional commit messages (`feat:`, `fix:`, `docs:`) for PRs.
- Run linting (`npm run lint`) and tests (`npm test`) before submitting changes.
- Reach out to the ChalaniAI backend maintainers for architecture decisions or onboarding support.
