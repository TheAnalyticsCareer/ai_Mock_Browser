// Environment variables configuration
export const env = {
  VITE_VAPI_PUBLIC_KEY: import.meta.env.VITE_VAPI_PUBLIC_KEY,
  VITE_VAPI_ASSISTANT_ID: import.meta.env.VITE_VAPI_ASSISTANT_ID,
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
};

// Validate required environment variables
export const validateEnv = () => {
  console.log('Environment variables loaded:', {
    vapiKey: env.VITE_VAPI_PUBLIC_KEY ? 'Present' : 'Missing',
    assistantId: env.VITE_VAPI_ASSISTANT_ID ? 'Present' : 'Missing',
    geminiKey: env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing'
  });
  
  if (!env.VITE_VAPI_PUBLIC_KEY || !env.VITE_VAPI_ASSISTANT_ID || !env.VITE_GEMINI_API_KEY) {
    throw new Error('Missing required environment variables');
  }
  return true;
};
