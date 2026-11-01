import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  GEMINI_API_KEY: {
    public: false,
    static: false,
    description: 'Google Gemini API Key for InfraBot',
    schema: (value?: string) => value || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined) || ''
  }
});

