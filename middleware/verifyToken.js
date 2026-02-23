/* ========================================
   NEXTSOUND — Token Verification Middleware
   Validates Firebase ID tokens on protected routes
   ======================================== */

const admin = require('../config/firebase');

/**
 * Middleware: verifyToken
 * Expects: Authorization: Bearer <firebase_id_token>
 * On success:  attaches req.user = { uid, email, name }
 * On failure:  responds 401 Unauthorized
 */
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || decoded.email?.split('@')[0]
        };
        next();
    } catch (err) {
        console.error('[TOKEN ERROR]', err.code, err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }
}

module.exports = verifyToken;
