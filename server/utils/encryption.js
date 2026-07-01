import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Derive a consistent 32-byte key from the JWT_SECRET
const getKey = () => {
    return crypto.createHash('sha256').update(process.env.JWT_SECRET).digest();
};

/**
 * Encrypt a plaintext string (e.g. a GitHub personal access token).
 * Returns a string in the format "iv:encryptedData" (both hex-encoded).
 */
export const encryptToken = (plainText) => {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt a previously encrypted string back to plaintext.
 * Expects the "iv:encryptedData" format produced by encryptToken.
 */
export const decryptToken = (cipherText) => {
    const key = getKey();
    const [ivHex, encryptedHex] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
