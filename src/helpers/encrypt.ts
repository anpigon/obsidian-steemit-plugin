import crypto from 'crypto';

export default class Encrypt {
  static readonly IV_LENGTH = 16; // For AES, this is always 16
  static readonly ALGORITHM = 'aes-256-cbc';

  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || 'god-obsidian-steemit-encrypt-key';
    if (!key) {
      throw new Error('No encryption key is set.');
    }
    return Buffer.from(key);
  }

  static encryptString(text: string) {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv(this.ALGORITHM, this.getEncryptionKey(), iv);
      const encrypted = cipher.update(text, 'utf8', 'base64');
      return `${iv.toString('base64')}:${encrypted}${cipher.final('base64')}`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error encrypting:', error);
      throw new Error('Encryption failed.');
    }
  }

  static decryptString(text: string): string {
    try {
      const [textParts, encryptedText] = text.split(':');
      if (!textParts || !encryptedText) {
        throw new Error('An invalidly formatted encrypted string.');
      }
      const iv = Buffer.from(textParts, 'base64');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.getEncryptionKey(), iv);
      const decrypted = decipher.update(encryptedText, 'base64', 'utf8');
      return decrypted + decipher.final('utf8');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error decrypting:', error);
      throw new Error('Decryption failed.');
    }
  }

  static isEncrypted(value: string): boolean {
    const parts = value.split(':');
    if (parts.length !== 2) return false;

    const [ivHex, encryptedHex] = parts;
    if (ivHex.length !== this.IV_LENGTH * 2) return false;

    try {
      Buffer.from(ivHex, 'hex');
      Buffer.from(encryptedHex, 'hex');
    } catch {
      return false;
    }

    return true;
  }
}
