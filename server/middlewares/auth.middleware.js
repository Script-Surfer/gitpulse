import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

/**
 * Protect middleware — verifies JWT and attaches req.user.
 * Use on any route that requires authentication.
 */
const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (exclude password hash)
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

/**
 * Optional auth middleware — does NOT reject unauthenticated requests.
 * If a valid JWT is present, attaches req.user. Otherwise, continues without it.
 * Used on public routes that behave differently for logged-in users (e.g. repo analysis records history).
 */
export const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-passwordHash');
        } catch (error) {
            // Invalid token — just continue without user, don't reject
            req.user = null;
        }
    }

    next();
};

export default protect;
