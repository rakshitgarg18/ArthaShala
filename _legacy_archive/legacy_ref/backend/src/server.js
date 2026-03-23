import admin from "firebase-admin";
import express from "express";
import cors from "cors";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const serviceAccount = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

app.use(cors());

// Authentication middleware
const authenticateFirebase = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Contains user info (uid, email, etc.)
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Protected route
app.get('/private', authenticateFirebase, (req, res) => {
  // Access user info
  console.log('Authenticated user:', req.user.uid, req.user.email);
  res.json({ message: 'Access granted', user: req.user });
});

app.listen(5000, () => console.log('API running on port 3000'));
 
