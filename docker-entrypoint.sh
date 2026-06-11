#!/bin/sh
set -e

# Generate public/config.js from container env vars at startup.
# This lets users of the pre-built ghcr.io image pass NEXT_PUBLIC_* vars
# at runtime (docker-compose / docker run -e) without rebuilding.
#
# window.env is read first in src/lib/env.ts, so these values take
# precedence over any values baked in at build time.
#
# NEVER add server-only secrets here (SUPABASE_SERVICE_ROLE_KEY,
# LIVEBLOCKS_SECRET_KEY) — this file is served publicly by the browser.

node -e "
const fs = require('fs');
const env = {
  SUPABASE_URL:          process.env.NEXT_PUBLIC_SUPABASE_URL          || '',
  SUPABASE_ANON_KEY:     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY     || '',
  LIVEBLOCKS_ENABLED:    process.env.NEXT_PUBLIC_LIVEBLOCKS_ENABLED    || '',
  OPENAI_API_KEY:        process.env.NEXT_PUBLIC_OPENAI_API_KEY        || '',
  ANTHROPIC_API_KEY:     process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY     || '',
  OPENAI_API_ENDPOINT:   process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT   || '',
  LLM_MODEL_NAME:        process.env.NEXT_PUBLIC_LLM_MODEL_NAME        || '',
  HIDE_CHARTDB_CLOUD:    process.env.NEXT_PUBLIC_HIDE_CHARTDB_CLOUD    || '',
  DISABLE_ANALYTICS:     process.env.NEXT_PUBLIC_DISABLE_ANALYTICS     || '',
};
fs.writeFileSync(
  '/usr/src/app/public/config.js',
  'window.env = ' + JSON.stringify(env) + ';'
);
"

exec npx next start -p "${PORT:-8080}"
