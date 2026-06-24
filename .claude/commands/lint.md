---
description: Run linters across all packages
---

Run lint across all packages:

```bash
cd docker && docker compose exec app sudo bun run lint
```

- Bot and non-web packages use **oxlint + oxfmt** (config in `lib/template/`)
- Web package (`presentation-web`) uses **ESLint + Prettier**

To auto-fix oxlint issues in a specific package (e.g. `presentation-bot`):

```bash
cd docker && docker compose exec app sh -c "cd src/presentation/bot && bun run lint:fix"
```

Report errors and apply fixes where possible.
