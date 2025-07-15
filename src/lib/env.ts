// Environment variables configuration

// Support multiple Gemini API keys for fallback
export const env = {
  VITE_GEMINI_API_KEYS: [
    import.meta.env.VITE_GEMINI_API_KEY,
    'AIzaSyBMLOoLEiL1XAZwm0yHBLMy6S38s6jwOGE', // Second key as fallback
  ].filter(Boolean),
  VITE_GEMINI_FEEDBACK_API_KEY: 'AIzaSyDtsgb7--7aS2RRVjxevR2bzfJdsY3uOtU', // Dedicated feedback key
};

// Validate required environment variables
export const validateEnv = () => {
  console.log('Environment variables loaded:', {
    geminiKeys: env.VITE_GEMINI_API_KEYS.map((k, i) => `Key${i+1}: ${k ? 'Present' : 'Missing'}`),
    feedbackKey: env.VITE_GEMINI_FEEDBACK_API_KEY ? 'Present' : 'Missing',
  });
  if (!env.VITE_GEMINI_API_KEYS.length) {
    throw new Error('Missing required Gemini API keys');
  }
  if (!env.VITE_GEMINI_FEEDBACK_API_KEY) {
    throw new Error('Missing dedicated Gemini feedback API key');
  }
  return true;
};
