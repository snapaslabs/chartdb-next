const windowEnv =
    typeof window !== 'undefined'
        ? (window as unknown as { env?: Record<string, string> }).env
        : undefined;

export const OPENAI_API_KEY: string =
    (windowEnv?.OPENAI_API_KEY ?? process.env.NEXT_PUBLIC_OPENAI_API_KEY) ?? '';
export const OPENAI_API_ENDPOINT: string =
    (windowEnv?.OPENAI_API_ENDPOINT ??
        process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT) ?? '';
export const LLM_MODEL_NAME: string =
    (windowEnv?.LLM_MODEL_NAME ?? process.env.NEXT_PUBLIC_LLM_MODEL_NAME) ?? '';
export const ANTHROPIC_API_KEY: string =
    (windowEnv?.ANTHROPIC_API_KEY ??
        process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) ?? '';
export const IS_CHARTDB_IO: boolean =
    process.env.NEXT_PUBLIC_IS_CHARTDB_IO === 'true';
export const APP_URL: string = process.env.NEXT_PUBLIC_APP_URL ?? '';
export const HOST_URL: string = process.env.NEXT_PUBLIC_HOST_URL ?? '';
export const HIDE_CHARTDB_CLOUD: boolean =
    (windowEnv?.HIDE_CHARTDB_CLOUD ??
        process.env.NEXT_PUBLIC_HIDE_CHARTDB_CLOUD) === 'true';
export const DISABLE_ANALYTICS: boolean =
    (windowEnv?.DISABLE_ANALYTICS ??
        process.env.NEXT_PUBLIC_DISABLE_ANALYTICS) === 'true';
export const SUPABASE_URL: string =
    (windowEnv?.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) ?? '';
export const SUPABASE_ANON_KEY: string =
    (windowEnv?.SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? '';
// Server-side only — never exposed to the browser via window.env
export const SUPABASE_SERVICE_ROLE_KEY: string =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Feature flags derived from env — both default to false so the app works
// out of the box without any backend configuration.
export const SUPABASE_CONFIGURED: boolean = !!(
    SUPABASE_URL && SUPABASE_ANON_KEY
);
export const LIVEBLOCKS_ENABLED: boolean =
    (windowEnv?.LIVEBLOCKS_ENABLED ??
        process.env.NEXT_PUBLIC_LIVEBLOCKS_ENABLED) === 'true';
