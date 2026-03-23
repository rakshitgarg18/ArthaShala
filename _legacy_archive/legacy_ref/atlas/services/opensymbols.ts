import { API_ENDPOINTS, API_KEYS } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SYMBOL_CACHE_KEY = "opensymbols_cache";
const TOKEN_CACHE_KEY = "opensymbols_token";

type CachedSymbol = SymbolResult | null;
type SymbolCacheData = Record<string, CachedSymbol>;

let memoryCache: SymbolCacheData = {};
let memoryCacheLoaded = false;

async function loadCacheFromStorage(): Promise<void> {
  if (memoryCacheLoaded) return;

  try {
    const stored = await AsyncStorage.getItem(SYMBOL_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out null values from cache - they may be from failed requests with old keys
      memoryCache = Object.fromEntries(
        Object.entries(parsed).filter(([_, v]) => v !== null)
      );
    }
  } catch (error) {
    console.error("Failed to load symbol cache:", error);
  }
  memoryCacheLoaded = true;
}

async function saveCacheToStorage(): Promise<void> {
  try {
    await AsyncStorage.setItem(SYMBOL_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (error) {
    console.error("Failed to save symbol cache:", error);
  }
}

let cachedToken: { token: string; expires: number } | null = null;

async function loadTokenFromStorage(): Promise<void> {
  if (cachedToken) return;

  try {
    const stored = await AsyncStorage.getItem(TOKEN_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.expires > Date.now()) {
        cachedToken = parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load token cache:", error);
  }
}

async function saveTokenToStorage(): Promise<void> {
  if (!cachedToken) return;

  try {
    await AsyncStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cachedToken));
  } catch (error) {
    console.error("Failed to save token cache:", error);
  }
}

/**
 * Clear all OpenSymbols caches (token + symbols).
 * Call this when switching API keys or to force fresh data.
 */
export async function clearOpenSymbolsCache(): Promise<void> {
  cachedToken = null;
  memoryCache = {};
  memoryCacheLoaded = false;
  try {
    await AsyncStorage.multiRemove([TOKEN_CACHE_KEY, SYMBOL_CACHE_KEY]);
    console.log("OpenSymbols cache cleared");
  } catch (error) {
    console.error("Failed to clear OpenSymbols cache:", error);
  }
}

export async function getAccessToken(): Promise<string> {
  // The OPENSYMBOLS_SECRET is actually the access token itself (format: token::xxx)
  // No need to exchange it - just return it directly
  const secret = API_KEYS.OPENSYMBOLS_SECRET;
  
  if (!secret) {
    throw new Error("OpenSymbols secret is not configured");
  }

  console.log("[OpenSymbols] Using secret as access token");
  console.log("[OpenSymbols] Token length:", secret.length);
  console.log("[OpenSymbols] Token prefix:", secret.substring(0, 20));
  
  return secret;
}

export type SymbolResult = {
  id: number;
  symbol_key: string;
  name: string;
  locale: string;
  license: string;
  license_url: string;
  author: string;
  author_url: string;
  image_url: string;
  repo_key: string;
  extension: string;
  skins: boolean;
  hc: boolean;
};

export async function searchSymbol(
  query: string,
  locale = "en"
): Promise<SymbolResult | null> {
  await loadCacheFromStorage();

  const cacheKey = `${query.toLowerCase()}-${locale}`;
  if (cacheKey in memoryCache) {
    console.log("[OpenSymbols] Cache hit for:", query);
    return memoryCache[cacheKey];
  }

  console.log("[OpenSymbols] Searching for:", query);

  try {
    // ALWAYS use token authentication if secret is available
    const secret = API_KEYS.OPENSYMBOLS_SECRET;
    console.log("[OpenSymbols] Secret available:", !!secret, "length:", secret?.length);

    let token: string | null = null;

    // Only try to get token if secret is provided
    if (secret) {
      try {
        console.log("[OpenSymbols] Fetching token...");
        token = await getAccessToken();
        console.log("[OpenSymbols] Got token successfully");
      } catch (tokenError) {
        console.warn("[OpenSymbols] Token fetch failed, will try public API:", tokenError);
      }
    }

    // Build search URL with token if available
    let searchUrl = `${API_ENDPOINTS.OPENSYMBOLS}/symbols?q=${encodeURIComponent(
      query
    )}&locale=${locale}&safe=1`;

    if (token) {
      searchUrl += `&access_token=${encodeURIComponent(token)}`;
    }

    console.log("[OpenSymbols] Fetching from:", searchUrl.substring(0, 120) + "...");

    const response = await fetch(searchUrl);
    console.log("[OpenSymbols] Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("[OpenSymbols] API error response:", text.substring(0, 500));
      throw new Error(`OpenSymbols search error: ${response.status} - ${text}`);
    }

    const results: SymbolResult[] = await response.json();
    console.log("[OpenSymbols] Received", results.length, "results");

    if (!Array.isArray(results) || results.length === 0) {
      console.log("[OpenSymbols] No results found for:", query);
      return null;
    }

    // Prefer ARASAAC or Mulberry symbols, then first result
    const preferred =
      results.find(
        (r) => r.repo_key === "arasaac" || r.repo_key === "mulberry"
      ) ??
      results[0] ??
      null;

    console.log("[OpenSymbols] Selected symbol:", preferred?.name || "none");

    // Only cache successful results, not null
    if (preferred) {
      memoryCache[cacheKey] = preferred;
      saveCacheToStorage(); // Fire and forget
    }
    return preferred;
  } catch (error) {
    console.error("[OpenSymbols] Search failed for query:", query, error);
    // Don't cache failures - they may be due to bad keys
    return null;
  }
}

export async function searchSymbols(
  query: string,
  locale = "en",
  limit = 10
): Promise<SymbolResult[]> {
  try {
    const token = await getAccessToken();
    const url = `${
      API_ENDPOINTS.OPENSYMBOLS
    }/symbols?access_token=${encodeURIComponent(token)}&q=${encodeURIComponent(
      query
    )}&locale=${locale}&safe=1`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        cachedToken = null;
        return searchSymbols(query, locale, limit);
      }
      throw new Error(`OpenSymbols search error: ${response.status}`);
    }

    const results: SymbolResult[] = await response.json();
    return results.slice(0, limit);
  } catch (error) {
    console.error("OpenSymbols search failed:", error);
    return [];
  }
}
 
