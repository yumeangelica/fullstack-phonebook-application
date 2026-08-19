# Repository guidance

- This is an existing Bun application with a React/Vite client and Express/Mongoose backend.
- Use `bun install --frozen-lockfile`, `bun run lint`, `bun run test:frontend`, and `bun run build`.
- Backend tests require a disposable `TEST_MONGODB_URI`; never point them at the development database because tests delete data.
- Preserve authentication, validation, API response, environment-variable, and database contracts.
- Keep `.env`, credentials, local databases, caches, and generated output out of Git.
- Ask before every commit. Ask separately before any push or PR.
