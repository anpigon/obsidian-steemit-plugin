import crypto from 'crypto';

export default class Encrypt {
  static readonly IV_LENGTH = 16; // For AES, this is always 16
  static readonly ALGORITHM = 'aes-256-cbc';

  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || 'god-obsidian-steemit-encrypt-key';
    if (!key) {
      throw new Error('No encryption key is set.');
    }
    return crypto.scryptSync(key, 'salt', 32);
  }

  static encryptString(text: string) {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv(this.ALGORITHM, this.getEncryptionKey(), iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error encrypting:', error);
      throw new Error('Encryption failed.');
    }
  }

  static decryptString(text: string): string {
    try {
      const [ivHex, encryptedHex] = text.split(':');
      if (!ivHex || !encryptedHex) {
        throw new Error('잘못된 형식의 암호화된 문자열입니다.');
      }
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.getEncryptionKey(), iv);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
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
