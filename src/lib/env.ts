// Environment variables configuration
export const env = {
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
};

// Validate required environment variables
export const validateEnv = () => {
  console.log('Environment variables loaded:', {
    geminiKey: env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing'
  });
  
  if (!env.VITE_GEMINI_API_KEY) {
    throw new Error('Missing required environment variables');
  }
  return true;
};
