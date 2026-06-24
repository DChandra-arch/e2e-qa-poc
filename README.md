# e2e-qa-poc

## AI-Augmented Multi-Layer Test Automation Framework

![CI](https://github.com/DChandra-arch/e2e-qa-poc/actions/workflows/playwright.yml/badge.svg)
![Node Version](https://img.shields.io/badge/node-v24.15.0-green)
![Playwright](https://img.shields.io/badge/playwright-v1.59-blue)
![TypeScript](https://img.shields.io/badge/typescript-v6.0-blue)

> A production-grade, multi-layer test automation framework built with TypeScript and Playwright.
> Features enterprise API framework with BaseClient/AuthService/Service Object Model,
> AI-powered test generation (Claude API), and a CI/CD pipeline via GitHub Actions.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Layers](#test-layers)
- [Enterprise API Framework](#enterprise-api-framework)
- [AI Test Generator](#ai-test-generator)
- [CI/CD Pipeline](#cicd-pipeline)
- [Architectural Decisions](#architectural-decisions)

---

## Overview

This framework demonstrates a **multi-layer quality strategy** covering:

- **Web UI testing** — Playwright + Page Object Model against TodoMVC
- **Enterprise API testing** — BaseClient + AuthService + Service Object Model against Conduit API
- **AI test generation** — Two-stage pipeline: requirements → test cases → Page Object + spec scaffolds
- **CI/CD** — GitHub Actions with environment-aware configuration

**Key design principle:** Each layer is independently runnable, shares a common fixture model,
and follows the same architectural patterns — Page Objects for UI, Service Objects for API.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    e2e-qa-poc Framework                         │
├─────────────────────────────────────────────────────────────────┤
│  WEB UI LAYER (Playwright + POM)                               │
│  Browser-driven user flow validation                            │
│  TodoMVC — Page Object Model + custom fixtures                 │
├─────────────────────────────────────────────────────────────────┤
│  ENTERPRISE API LAYER (Playwright APIRequestContext)           │
│  BaseClient → AuthService → Service Object Model               │
│  Conduit API — auth, CRUD, permission validation               │
├─────────────────────────────────────────────────────────────────┤
│  AI GENERATION LAYER (Claude API)                              │
│  Stage 1: Requirements → structured test cases (JSON)          │
│  Stage 2: Test cases → Page Object + spec file scaffolds       │
├─────────────────────────────────────────────────────────────────┤
│  CI — GitHub Actions                                            │
│  API tests on push/PR, nightly full regression, env-aware      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
e2e-qa-poc/
├── .github/
│   └── workflows/
│       ├── playwright.yml          # CI gate — API tests on push/PR
│       ├── nightly.yml             # Scheduled full regression
│       └── dev-repo-example.yml    # Example: product repo CI gate pattern
│
├── tests/
│   ├── webUI/
│   │   ├── todo.spec.ts            # UI tests — TodoMVC (hand-written)
│   │   ├── gen_*.spec.ts           # AI-generated spec files (review before run)
│   │   └── env.spec.ts             # Environment switching validation
│   └── api/
│       ├── todo.api.spec.ts        # Basic API tests — JSONPlaceholder
│       └── conduit.api.spec.ts     # Enterprise API tests — Conduit API
│
├── lib/
│   ├── pages/
│   │   └── ToDoPage.ts             # Page Object — TodoMVC UI
│   ├── helpers/
│   │   ├── api/
│   │   │   ├── apiClient.ts        # BaseClient — headers, auth, correlation IDs, perf tracking
│   │   │   ├── authHelper.ts       # AuthService — login, token cache per test
│   │   │   └── services/
│   │   │       └── articlesService.ts  # ArticlesService extends BaseClient
│   │   ├── ui/                     # UI-specific helpers (Phase 2)
│   │   └── data/
│   │       └── userFactory.ts      # TestUsers — centralized user registry
│   ├── fixtures/
│   │   ├── pageFixtures.ts         # UI fixtures — todoPage injection
│   │   └── apiFixtures.ts          # API fixtures — authToken, articlesService injection
│   └── types/
│       └── todo.ts                 # TypeScript interfaces
│
├── fixtures/                       # Static test data (JSON)
│   ├── api/
│   ├── webUI/
│   └── ai-generated/               # AI-generated test plans and datasets
│
├── ai-generator/
│   ├── requirementToTestCases.ts   # Stage 1: requirement → test plan JSON
│   └── testCasesToScaffold.ts      # Stage 2: test plan → POM + spec files
│
├── playwright.config.ts            # Global config — projects, baseURL, reporters
├── prettier.config.js              # Code formatting
├── tsconfig.json                   # TypeScript compiler config
├── .nvmrc                          # Node version pin (v24.15.0)
└── package.json                    # Dependencies + npm scripts
```

---

## Tech Stack

| Category      | Technology                    | Why                                                                  |
| ------------- | ----------------------------- | -------------------------------------------------------------------- |
| Language      | TypeScript 6                  | Native to Playwright. Type safety catches errors at compile time.    |
| Test runner   | Playwright 1.59               | Auto-waiting, built-in API testing, mobile emulation, HTML reporter. |
| API framework | Playwright APIRequestContext  | Unified — API and UI share same framework, config, reporter.         |
| Auth pattern  | JWT token per test            | Simple, no test interdependency, supports multiple user roles.       |
| AI generation | Claude API (Anthropic TS SDK) | Structured JSON output → test cases + Page Object scaffolds.         |
| CI/CD         | GitHub Actions                | Zero infrastructure, environment-aware, nightly + PR gate.           |
| Node version  | v24.15.0 LTS                  | Pinned via .nvmrc for consistent environments.                       |

---

## Getting Started

### Prerequisites

- Node.js v24.15.0 (`nvm install --lts`)
- Git

### Installation

```bash
git clone https://github.com/DChandra-arch/e2e-qa-poc.git
cd e2e-qa-poc
nvm use
npm install
npx playwright install chromium
npx tsc --noEmit    # verify TypeScript is clean
```

### Environment Variables

Create `.env` at project root:

```bash
BASE_URL=https://demo.playwright.dev
API_URL=https://jsonplaceholder.typicode.com
CONDUIT_API_URL=https://conduit-api.bondaracademy.com
CONDUIT_USER_EMAIL=your_email_here
CONDUIT_USER_PASSWORD=your_password_here
ANTHROPIC_API_KEY=your_key_here   # required for ai-generator only
```

---

## Running Tests

```bash
# Type check
npm run typecheck

# UI tests
npm run test:ui

# API tests (JSONPlaceholder)
npm run test:api

# Conduit API tests (enterprise framework)
npm run test:conduit

# All tests
npm test

# Specific environment
npm run test:staging

# View HTML report
npm run report

# AI generator — Stage 1: requirement → test cases
npm run generate:tests

# AI generator — Stage 2: test cases → scaffold
npm run generate:scaffold
```

---

## Test Layers

### Web UI Tests — `tests/webUI/`

**Target:** TodoMVC (`https://demo.playwright.dev/todomvc`)
**Pattern:** Page Object Model + custom fixtures

```typescript
// Clean test — zero setup boilerplate
test('should add a todo', async ({ todoPage }) => {
  await todoPage.addTodo('Buy milk')
  expect(await todoPage.getTodoCount()).toBe(1)
})
```

`todoPage` fixture handles navigation, setup, and cleanup automatically.
Tests declare intent — Page Object handles implementation.

---

### Enterprise API Tests — `tests/api/conduit.api.spec.ts`

**Target:** Conduit API (`https://conduit-api.bondaracademy.com`)
**Pattern:** Service Object Model + API fixtures

```typescript
// Clean test — zero auth management
test('POST creates article', async ({ articlesService }) => {
  const article = await articlesService.createArticle({
    title: `Test Article ${Date.now()}`,
    description: 'Playwright automation',
    body: 'Article body',
    tagList: ['playwright'],
  })
  expect(article.slug).toBeDefined()
  await articlesService.deleteArticle(article.slug)
})
```

`articlesService` fixture handles login, token management, and service instantiation.

---

## Enterprise API Framework

### Architecture

```
TestUsers (userFactory.ts)
    ↓ provides credentials
AuthService (authHelper.ts)
    ↓ fetches JWT token, cached per test
BaseClient (apiClient.ts)
    ↓ builds headers, correlation IDs, perf tracking
ArticlesService (services/articlesService.ts)
    ↓ domain-specific methods
apiFixtures.ts
    ↓ injects into tests
conduit.api.spec.ts
```

### Key Design Decisions

**BaseClient** centralizes:

- `Authorization: Token <jwt>` header injection
- `X-Correlation-ID` — unique per request, traceable in logs
- Performance tracking — warns if request > 1500ms
- Error handling — throws with full context on failure

**AuthService** — token per test scope:

- One login call per test
- Avoids shared state between tests
- `clearToken()` for permission boundary testing

**Service Object Model** mirrors Page Object Model:

```
POM: TodoPage.addTodo()          → UI action
SOM: ArticlesService.createArticle() → API operation
```

**apiFixtures.ts** — single place to add new services:

```typescript
type ApiFixtures = {
  authToken: string
  articlesService: ArticlesService
  publicArticlesService: ArticlesService
  // add new services here
}
```

---

## AI Test Generator

Two-stage pipeline — plain English to runnable test scaffolds.

### Stage 1 — Requirements to Test Cases

```bash
npm run generate:tests
```

Input: Plain-English requirement or Jira story
Output: Structured JSON test plan with typed test cases

```
TC-001 [happy_path] — Successfully add a single todo item
TC-002 [happy_path] — Successfully add multiple todos sequentially
TC-003 [negative]   — Attempt to add empty todo item
TC-004 [negative]   — Attempt to add whitespace-only item
TC-005 [edge_case]  — Add item at maximum character length
TC-006 [edge_case]  — Add item exceeding maximum length
TC-007 [edge_case]  — Add item with special characters and emojis
TC-008 [negative]   — Attempt to add duplicate item
```

### Stage 2 — Test Cases to Scaffold

```bash
npm run generate:scaffold
```

Input: Test plan JSON from Stage 1
Output: Page Object stub + spec file (prefixed `gen_`)

```
lib/pages/gen_AddTodoItemPage.ts     ← Page Object with locators
tests/webUI/gen_add_todo_item.spec.ts ← Spec file implementing all test cases
```

**Review generated files before running** — locators may need adjustment
without Playwright MCP real-DOM inspection.

---

## CI/CD Pipeline

Three separate workflows — each with a single responsibility:

### `playwright.yml` — PR Gate (push + pull_request)

Runs on every push and PR to main. Fast — API tests only, no browser install.

```
Checkout → Setup Node → npm ci → TypeScript check → API tests → Upload report
```

### `nightly.yml` — Full Regression (scheduled + manual)

Runs at 2am UTC nightly. Also supports manual trigger with environment selection.

```
Environment dropdown: test | staging | production
Runs full test suite against selected environment
Reports retained 30 days
```

### `dev-repo-example.yml` — Product Repo Pattern (reference)

Documents how the automation repo integrates with a product repository:

```
Dev opens PR → App builds → deploys to staging
                          → automation repo pulled
                          → smoke tests run against staging
                          → PR blocked if tests fail
```

### Environment Configuration

Config externalized via GitHub Environments — no code changes to switch:

```
Settings → Environments → test / staging / production
Each has own BASE_URL and API_URL
Workflow reads ${{ vars.BASE_URL }} from selected environment
```

---

## Architectural Decisions

### Why TypeScript over Java?

TypeScript is native to Playwright — type-safe autocomplete, compile-time error catching. Keeps automation in the same language as the engineering stack so developers can contribute directly.

### Why Service Object Model for API?

Same principle as Page Object Model — encapsulate endpoint knowledge in service classes, keep tests clean. Tests call `articlesService.createArticle()` not `request.post('/api/articles', {...})`. If the API changes, update the service, not every test.

### Why test-scoped auth tokens?

Simpler than worker-scoped tokens, no test interdependency, supports multiple user roles cleanly. One login per test is a minor performance cost worth the simplicity.

### Why `lib/helpers/api/` vs `lib/helpers/ui/`?

Clear classification rule: `lib/` = directly imported by tests. Sub-folders by concern: `api/` for API helpers, `ui/` for UI helpers, `data/` for shared test data utilities.

### Why structured JSON output from AI generator?

Parseable, pipeable, storable. The test plan JSON from Stage 1 is the input to Stage 2. Structured output enables chaining — prose output doesn't.

### CI runner strategy

Free GitHub runners are too slow for browser downloads (15+ min for Chromium). PR gate runs API tests only — fast feedback in under 30 seconds. UI tests and full regression run in nightly pipeline where time constraint is less critical.

---

## Author

**Dharini Chandrasekhar**
QA Leader | 13+ years | Austin, TX

---

_Last updated: June 2026_
