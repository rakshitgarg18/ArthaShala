# Frontend: Google Login Button -> Exchange token -> Call /private

A simple React frontend that demonstrates Google Sign-In authentication flow with a backend API.

## Features

- Google Sign-In button using `@react-oauth/google`
- Exchanges Google ID token for backend access token
- Calls authenticated `/private` endpoint
- Clean UI with status indicators and error handling

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID from Google Cloud Console
   - `VITE_BACKEND_URL`: Backend API URL (default: `http://localhost:8000`)

## Running the App

**Development mode:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser.

## How to Use

1. **Login:** Click the "Sign in with Google" button
2. **Exchange:** Frontend automatically sends Google ID token to backend `/auth/google`
3. **Call Private:** Click "Call /private" button to fetch authenticated data
4. **Logout:** Click "Logout" to clear authentication state

## Authentication Flow

1. User clicks Google Sign-In button
2. Frontend receives Google ID token (credential)
3. Frontend POSTs token to `VITE_BACKEND_URL/auth/google`
4. Backend verifies token and returns access token
5. Frontend stores access token in React state
6. User can call `/private` with Bearer authorization header

## UI Components

- **Google Login Button:** Initiates OAuth flow
- **Status Text:** Shows current authentication state (logged out/logging in/logged in)
- **Call /private Button:** Makes authenticated API call
- **Output Panel:** Displays JSON response from private endpoint
- **Error Panel:** Shows any authentication or API errors

## Security Notes

- Access tokens are stored in React state only (not localStorage)
- Tokens are never logged to console
- Failed API calls are handled gracefully with user-friendly error messages
 
