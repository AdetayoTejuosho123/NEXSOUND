const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

// Handle Vercel serverless environment
const isVercel = process.env.VERCEL === '1';
const basePath = isVercel ? path.join(process.cwd()) : __dirname;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountJson) {
    try {
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log('[Firebase] Using service account from FIREBASE_SERVICE_ACCOUNT env var');
    } catch (e) {
        console.error('[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
}

// Fallback: try to read from file
if (!serviceAccount) {
    const serviceAccountPath = path.join(basePath, 'serviceAccountKey.json');
    try {
        if (fs.existsSync(serviceAccountPath)) {
            const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
            serviceAccount = JSON.parse(fileContent);
            console.log('[Firebase] Using service account from file');
        }
    } catch (e) {
        console.error('[Firebase] Failed to load service account file:', e.message);
    }
}

// Last resort: try require (works in development)
if (!serviceAccount) {
    try {
        serviceAccount = require(path.join(basePath, 'serviceAccountKey.json'));
        console.log('[Firebase] Using service account from require');
    } catch (e) {
        console.error('[Firebase] All methods failed to load service account');
    }
}

if (!serviceAccount) {
    throw new Error('Firebase service account not found');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
