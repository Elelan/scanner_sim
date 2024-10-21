import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc'; // Encryption algorithm
const KEY = process.env.ENCRYPTION_KEY || 'mysecretkeymysecretkey123456'; // Should be 32 characters for AES-256
const IV = crypto.randomBytes(16); // Random initialization vector

// Function to encrypt text
export function encrypt(text: string): string {
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${IV.toString('hex')}:${encrypted}`; // Return IV + encrypted text
}

// Function to decrypt text
export function decrypt(encryptedText: string): string {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}