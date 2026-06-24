---
description: Run unit and E2E tests
---

Run all tests via Turborepo (Vitest unit tests + Playwright E2E):

```bash
cd docker && docker compose exec app bun run test
```

To run only unit tests for a specific package, e.g. `presentation-bot`:

```bash
cd docker && docker compose exec app sh -c "cd src/presentation/bot && bun run test"
```

To run only web E2E tests (Playwright):

```bash
cd docker && docker compose exec app sh -c "cd src/presentation/web && npx playwright test"
```

Report failures and suggest fixes.
