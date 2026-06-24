---
description: Build all packages in the monorepo
---

Run the Turborepo build for all packages. Commands must be run from the `docker/` directory on the host:

```bash
cd docker && docker compose exec app sudo bun run build
```

If the build fails, read the error output and suggest a fix.
