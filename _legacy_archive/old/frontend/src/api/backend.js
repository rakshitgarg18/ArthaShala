// Backend API functions for authentication and private calls
// This module handles all communication with the backend API

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Exchange Google ID token for backend access token
 * @param {string} googleIdToken - The Google ID token from Google Sign-In
 * @returns {Promise<Object>} Response containing access_token and user info
 */
export async function exchangeGoogleToken(googleIdToken) {
  const response = await fetch(`${BACKEND_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      google_id_token: googleIdToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Call the private endpoint with backend access token
 * @param {string} accessToken - The backend access token
 * @returns {Promise<Object>} Response from the private endpoint
 */
export async function callPrivate(accessToken) {
  const response = await fetch(`${BACKEND_URL}/private`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
} 
