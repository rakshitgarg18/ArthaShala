/**
 * Debug utility to test OpenSymbols API directly
 * Run from browser console: await import('./debug-opensymbols.ts').then(m => m.testOpenSymbols())
 */

import { API_ENDPOINTS, API_KEYS } from "@/config/api";

export async function testOpenSymbols() {
  console.log("=== OpenSymbols Debug Test ===");
  console.log("API Keys loaded:");
  console.log("- OPENROUTER:", API_KEYS.OPENROUTER ? "✓" : "✗");
  console.log("- OPENSYMBOLS_SECRET:", API_KEYS.OPENSYMBOLS_SECRET ? "✓" : "✗");
  console.log("- ELEVENLABS:", API_KEYS.ELEVENLABS ? "✓" : "✗");

  // Test 1: Public search without token
  console.log("\n=== Test 1: Public search (no token) ===");
  const publicUrl = `${API_ENDPOINTS.OPENSYMBOLS}/symbols?q=hello&locale=en&safe=1`;
  console.log("URL:", publicUrl);
  try {
    const response = await fetch(publicUrl);
    console.log("Status:", response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Results:", data.length, "symbols");
      if (data.length > 0) {
        console.log("First result:", data[0]);
      }
    } else {
      const text = await response.text();
      console.log("Error:", text.substring(0, 200));
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }

  // Test 2: Secret validation
  console.log("\n=== Test 2: Token endpoint with secret ===");
  if (API_KEYS.OPENSYMBOLS_SECRET) {
    const tokenUrl = `${API_ENDPOINTS.OPENSYMBOLS}/token?secret=${encodeURIComponent(
      API_KEYS.OPENSYMBOLS_SECRET
    )}`;
    console.log("URL (truncated):", tokenUrl.substring(0, 100) + "...");
    console.log("Secret length:", API_KEYS.OPENSYMBOLS_SECRET.length);
    try {
      const response = await fetch(tokenUrl, { method: "POST" });
      console.log("Status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Token received:", !!data.access_token);
        console.log("Full response:", data);
      } else {
        const text = await response.text();
        console.log("Error:", text);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  }

  // Test 3: Authenticated search
  console.log("\n=== Test 3: Authenticated search ===");
  if (API_KEYS.OPENSYMBOLS_SECRET) {
    try {
      const tokenUrl = `${API_ENDPOINTS.OPENSYMBOLS}/token?secret=${encodeURIComponent(
        API_KEYS.OPENSYMBOLS_SECRET
      )}`;
      const tokenResponse = await fetch(tokenUrl, { method: "POST" });
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;
        console.log("Got token, now searching...");

        const searchUrl = `${API_ENDPOINTS.OPENSYMBOLS}/symbols?access_token=${encodeURIComponent(
          token
        )}&q=apple&locale=en&safe=1`;
        console.log("Search URL:", searchUrl.substring(0, 100) + "...");

        const searchResponse = await fetch(searchUrl);
        console.log("Search status:", searchResponse.status);
        if (searchResponse.ok) {
          const results = await searchResponse.json();
          console.log("Results:", results.length, "symbols");
          if (results.length > 0) {
            console.log("First result:", results[0]);
          }
        } else {
          const text = await searchResponse.text();
          console.log("Error:", text.substring(0, 200));
        }
      } else {
        console.log("Token request failed:", tokenResponse.status);
      }
    } catch (error) {
      console.error("Test failed:", error);
    }
  }
}

// Test CORS
export async function testCORS() {
  console.log("=== Testing CORS ===");
  const testUrl = "https://www.opensymbols.org/api/v2/symbols?q=test&locale=en&safe=1";
  console.log("Testing URL:", testUrl);
  try {
    const response = await fetch(testUrl);
    console.log("Response status:", response.status);
    console.log("Response headers:");
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
  } catch (error) {
    console.error("CORS error:", error);
  }
}
 
