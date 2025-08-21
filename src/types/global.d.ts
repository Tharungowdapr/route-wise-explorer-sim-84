
// Global type declarations for the project
declare global {
  interface Window {
    google?: any;
  }
}

// Gemini API types
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Export empty object to make this a module
export {};
