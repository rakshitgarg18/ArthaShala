# Nexora Backend

Node.js backend API with Google ID Token authentication using JWKS verification and backend JWT issuance.

## Features

- **Google ID Token Verification**: Securely verifies Google ID tokens using JWKS (JSON Web Key Set)
- **Backend JWT Issuance**: Issues application-specific JWTs for authenticated users
- **Public/Private Endpoints**: `/public` works without auth, `/private` requires valid backend JWT
- **In-Memory User Store**: Simple user management (replace with database in production)
- **Security-First**: Strict token validation, no trust in frontend authentication state

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
    - `PORT`: Server port (default: 8000)
    - `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID from Google Cloud Console
    - `APP_JWT_SECRET`: A long, random secret string (32+ chars) for signing backend JWTs
    - `APP_JWT_EXPIRE_MINUTES`: Token expiration time in minutes (default: 60)

## Running the Server

**Production mode:**
```bash
npm start
```

**Development mode (with auto-restart):**
```bash
npm run dev
```

Server will start on `http://localhost:PORT` (default: 8000)

## API Endpoints

### GET /public
**Authentication:** None required

Returns a public message demonstrating unauthenticated access.

**Example Request:**
```bash
curl http://localhost:8000/public
```

**Response:**
```json
{
  "message": "This is a public endpoint",
  "hint": "Authenticate via POST /auth/google then call /private"
}
```

### POST /auth/google
**Authentication:** None required

Exchange a Google ID token for a backend access token. This is the only endpoint that accepts Google ID tokens.

**Request Body:**
```json
{
  "google_id_token": "PASTE_YOUR_GOOGLE_ID_TOKEN_HERE"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"google_id_token":"PASTE_YOUR_GOOGLE_ID_TOKEN_HERE"}'
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "sub": "google_unique_user_id",
    "email": "user@gmail.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing `google_id_token` in request body
- `401 Unauthorized`: Invalid Google ID token (wrong signature, expired, wrong audience, unverified email)
- `503 Service Unavailable`: JWKS verification service temporarily unavailable

### GET /private
**Authentication:** Required (Bearer token)

Returns authenticated user information. Requires valid backend JWT in Authorization header.

**Headers:**
```
Authorization: Bearer YOUR_BACKEND_ACCESS_TOKEN
```

**Example Request:**
```bash
curl http://localhost:8000/private \
  -H "Authorization: Bearer YOUR_BACKEND_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "message": "This is a private endpoint",
  "authenticated": true,
  "user": {
    "sub": "google_unique_user_id",
    "email": "user@gmail.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid or expired token"
}
```

## How to Obtain Google ID Token

1. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select a project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Configure authorized origins and redirect URIs

2. **Frontend Integration:**
   - Use Google Sign-In library or Firebase Auth
   - After successful sign-in, extract the ID token from the credential response
   - Send the ID token to `POST /auth/google` to receive the backend access token

3. **Example Frontend Code (vanilla JS):**
   ```javascript
   // After Google Sign-In success
   function onSignIn(googleUser) {
     const id_token = googleUser.getAuthResponse().id_token;

     // Send to backend
     fetch('/auth/google', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ google_id_token: id_token })
     })
     .then(res => res.json())
     .then(data => {
       // Store the access_token for future requests
       localStorage.setItem('access_token', data.access_token);
     });
   }
   ```

## Security Implementation Details

- **Google ID Token Verification:**
  - Fetches public keys from Google's JWKS endpoint
  - Verifies signature, audience (`GOOGLE_CLIENT_ID`), issuer, and expiration
  - Requires `email_verified: true` for security
  - Never accepts unverified tokens

- **Backend JWT:**
  - Signed with HS256 using `APP_JWT_SECRET`
  - Contains `sub`, `email`, `iat`, `exp`, `typ: "access"`, `iss: "simple-google-auth-backend"`
  - Expires after `APP_JWT_EXPIRE_MINUTES`
  - Verified on every private endpoint request

- **Authentication Flow:**
  - Frontend obtains Google ID token
  - Frontend sends ID token to `/auth/google` once
  - Backend verifies Google token and issues app JWT
  - Frontend uses app JWT for all subsequent `/private` requests
  - Backend enforces authentication on private routes

## Architecture

```
src/
├── server.js          # Server startup
├── app.js             # Express app configuration
├── config/env.js      # Environment variables
├── auth/
│   ├── googleVerify.js # Google ID token verification
│   └── appJwt.js       # Backend JWT handling
├── middlewares/
│   └── requireAuth.js  # Authentication middleware
├── routes/
│   ├── auth.routes.js  # /auth/google
│   ├── public.routes.js # /public
│   └── private.routes.js # /private
├── store/
│   └── userStore.js    # In-memory user storage
└── models/
    └── schemas.js      # User model definition
```

## Production Considerations

- Replace in-memory user store with persistent database
- Add rate limiting to prevent abuse
- Implement refresh tokens for better security
- Add request/response logging (avoid logging tokens)
- Set up proper error monitoring
- Use HTTPS in production
- Rotate `APP_JWT_SECRET` periodically
 
