import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { exchangeGoogleToken, callPrivate } from './api/backend.js';

function App() {
  const [authStatus, setAuthStatus] = useState('logged out'); // 'logged out', 'logging in', 'logged in'
  const [accessToken, setAccessToken] = useState(null);
  const [privateData, setPrivateData] = useState(null);
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setAuthStatus('logging in');
      setError(null);

      // Exchange Google ID token for backend access token
      const response = await exchangeGoogleToken(credentialResponse.credential);

      // Store the access token in state (not localStorage as per requirements)
      setAccessToken(response.access_token);
      setAuthStatus('logged in');
    } catch (err) {
      setError(`Login failed: ${err.message}`);
      setAuthStatus('logged out');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
    setAuthStatus('logged out');
  };

  const handleCallPrivate = async () => {
    if (!accessToken) return;

    try {
      setError(null);
      const data = await callPrivate(accessToken);
      setPrivateData(data);
    } catch (err) {
      setError(`Private call failed: ${err.message}`);
      setPrivateData(null);
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setAuthStatus('logged out');
    setPrivateData(null);
    setError(null);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Google Auth Demo</h1>

        <div style={{ marginBottom: '20px' }}>
          <p><strong>Status:</strong> {authStatus}</p>
        </div>

        {authStatus === 'logged out' && (
          <div style={{ marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
            />
          </div>
        )}

        {authStatus === 'logged in' && (
          <div style={{ marginBottom: '20px' }}>
            <button onClick={handleCallPrivate} style={{ marginRight: '10px' }}>
              Call /private
            </button>
            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {privateData && (
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '4px',
            textAlign: 'left'
          }}>
            <strong>Private Data:</strong>
            <pre>{JSON.stringify(privateData, null, 2)}</pre>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App; 
