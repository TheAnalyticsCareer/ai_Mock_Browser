// Environment variables configuration



// Support multiple Gemini API keys for fallback
export const env = {
  // For interview (2 keys)
  VITE_GEMINI_API_KEYS: [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK,
  ].filter(Boolean),
  // For feedback (2 keys)
  VITE_GEMINI_FEEDBACK_API_KEYS: [
    import.meta.env.VITE_GEMINI_FEEDBACK_API_KEY,
    import.meta.env.VITE_GEMINI_FEEDBACK_API_KEY_FALLBACK,
  ].filter(Boolean),
};

// Validate required environment variables
export const validateEnv = () => {
  console.log('Environment variables loaded:', {
    geminiKeys: env.VITE_GEMINI_API_KEYS.map((k, i) => `Key${i+1}: ${k ? 'Present' : 'Missing'}`),
    feedbackKeys: env.VITE_GEMINI_FEEDBACK_API_KEYS.map((k, i) => `Key${i+1}: ${k ? 'Present' : 'Missing'}`),
  });
  if (!env.VITE_GEMINI_API_KEYS.length) {
    throw new Error('Missing required Gemini API keys');
  }
  if (!env.VITE_GEMINI_FEEDBACK_API_KEYS.length) {
    throw new Error('Missing dedicated Gemini feedback API keys');
  }
  return true;
};
