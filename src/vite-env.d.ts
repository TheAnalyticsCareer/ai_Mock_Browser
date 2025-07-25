/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY_FALLBACK?: string;
  readonly VITE_GEMINI_API_KEY_FALLBACK2?: string;
  readonly VITE_GEMINI_FEEDBACK_API_KEY?: string;
  readonly VITE_GEMINI_FEEDBACK_API_KEY_FALLBACK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
