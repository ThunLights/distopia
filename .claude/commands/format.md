---
description: Auto-format all source files
---

Format all packages:

```bash
cd docker && docker compose exec app sudo bun run format
```

- Bot and non-web packages: formatted by **oxfmt** (config: `lib/template/oxfmt.config.ts`)
  - Print width: 100, semicolons, double quotes, 2-space indent, trailing commas, sorted imports
- Web package: formatted by **Prettier**

`*.auto.ts` files and `dist/**` are excluded from formatting automatically.
