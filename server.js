/* ========================================
   NEXTSOUND — EXPRESS + FIREBASE ADMIN
   Backend server: serves frontend + auth API
   ======================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('./config/firebase');
const verifyToken = require('./middleware/verifyToken');
const webConfig = require('./config/webConfig');

// Handle Vercel serverless environment
const isVercel = process.env.VERCEL === '1';
const basePath = isVercel ? path.join(process.cwd()) : __dirname;

const app = express();
const PORT = process.env.PORT || 5000;

// Web API Key — used for password-verified login via Identity Toolkit
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || webConfig.apiKey;

// ── Core Middleware ───────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve Frontend Static Files ──────────────────────────
app.use(express.static(path.join(basePath)));

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', project: webConfig.projectId });
});

// ── SIGNUP ────────────────────────────────────────────────
// POST /api/signup  →  { email, password, name }
// Creates user - requires email verification before login (NO AUTO LOGIN)
app.post('/api/signup', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'WEAK_PASSWORD: Password must be at least 8 characters.' });
    }

    try {
        // Create the user (user must verify email before logging in)
        const userRecord = await admin.auth().createUser({
            email: email.trim(),
            password,
            displayName: name?.trim() || email.split('@')[0]
        });

        console.log(`[SIGNUP] ✅ New user created: ${userRecord.email} (${userRecord.uid}) - Email verification required`);

        // Return success but indicate email verification is needed - NO TOKEN returned
        return res.status(201).json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            message: 'ACCOUNT_CREATED_VERIFY_EMAIL',
            requiresVerification: true
        });
    } catch (err) {
        const code = err.errorInfo?.code || 'auth/unknown';
        const msg = err.errorInfo?.message || err.message;
        console.error(`[SIGNUP ERROR] ${code}: ${msg}`);
        return res.status(400).json({ error: msg });
    }
});

// ── LOGIN ─────────────────────────────────────────────────
// POST /api/login  →  { email, password }
// Uses Firebase Identity Toolkit REST API with Web API Key
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true })
            }
        );
        const data = await response.json();

        if (!response.ok) {
            const errMsg = data.error?.message || 'INVALID_LOGIN_CREDENTIALS';
            console.error(`[LOGIN ERROR] ${errMsg}`);
            return res.status(401).json({ error: errMsg });
        }

        console.log(`[LOGIN] ✅ ${data.email}`);

        return res.json({
            uid: data.localId,
            email: data.email,
            displayName: data.displayName || email.split('@')[0],
            token: data.idToken
        });
    } catch (err) {
        console.error('[LOGIN NETWORK ERROR]', err.message);
        return res.status(500).json({ error: 'Login service unavailable. Try again.' });
    }
});

// ── PROTECTED: Get current user ───────────────────────────
// GET /api/me  →  requires: Authorization: Bearer <idToken>
app.get('/api/me', verifyToken, (req, res) => {
    res.json({
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name
    });
});

// ── Catch-all: Serve index.html ───────────────────────────
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(basePath, 'index.html'));
});

// ── Start Server ─────────────────────────────────────────
// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('');
        console.log('  ╔══════════════════════════════════════╗');
        console.log(`  ║  Nextsound running on port ${PORT}      ║`);
        console.log(`  ║  http://localhost:${PORT}               ║`);
        console.log(`  ║  Project: ${webConfig.projectId}   ║`);
        console.log('  ╚══════════════════════════════════════╝');
        console.log('');
        console.log('  ✅ Firebase Auth connected');
        console.log('  ✅ Signup: POST /api/signup (email verification required)');
        console.log('  ✅ Login:  POST /api/login  (password verified)');
        console.log('  ✅ Me:     GET  /api/me     (token protected)');
        console.log('');
    });
}

// Export for Vercel
module.exports = app;
