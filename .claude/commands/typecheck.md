---
description: Run TypeScript type checking across all packages
---

Run `tsc --noEmit` across all packages via Turborepo:

```bash
cd docker && docker compose exec app sudo bun run typecheck
```

Report all type errors found and suggest fixes.
