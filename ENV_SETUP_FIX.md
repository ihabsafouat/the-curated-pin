# Local environment loading fix

Priority 11.1 updates standalone Node scripts to load `.env` and `.env.local` using Node 22 `--env-file-if-exists`.

1. Copy `.env.example` to `.env.local`.
2. Fill Neon and application secrets.
3. Run `npm run env:check`.
4. Run `npm run setup:priority11`.

Shell/hosting-provided environment variables still take precedence over file values.
