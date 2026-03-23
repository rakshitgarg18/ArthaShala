// API Configuration
// Load from environment variables (set in .env.local)
// See .env.example for template

export const API_KEYS = {
  OPENROUTER: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || "",
  OPENSYMBOLS_SECRET: process.env.EXPO_PUBLIC_OPENSYMBOLS_SECRET || "",
  ELEVENLABS: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "",
};

// Debug: Log keys to console on initialization
if (typeof window !== 'undefined') {
  console.log("[API Config] Environment variables loaded:");
  console.log("[API Config] EXPO_PUBLIC_OPENROUTER_API_KEY:", process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ? `${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY.substring(0, 20)}...` : "NOT SET");
  console.log("[API Config] EXPO_PUBLIC_OPENSYMBOLS_SECRET:", process.env.EXPO_PUBLIC_OPENSYMBOLS_SECRET ? `${process.env.EXPO_PUBLIC_OPENSYMBOLS_SECRET.substring(0, 20)}...` : "NOT SET");
  console.log("[API Config] EXPO_PUBLIC_ELEVENLABS_API_KEY:", process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ? `${process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY.substring(0, 20)}...` : "NOT SET");
}

if (
  !API_KEYS.OPENROUTER ||
  !API_KEYS.OPENSYMBOLS_SECRET ||
  !API_KEYS.ELEVENLABS
) {
  console.warn(
    "⚠️ Missing API keys. Copy .env.example to .env.local and fill in your keys."
  );
}

export const API_ENDPOINTS = {
  OPENROUTER: "https://openrouter.ai/api/v1",
  OPENSYMBOLS: "https://www.opensymbols.org/api/v2",
  ELEVENLABS: "https://api.elevenlabs.io/v1",
};
 
