import crypto from 'crypto';

export default class Encrypt {
  static readonly ENCRYPTION_KEY = 'god-obsidian-steemit-encrypt-key';
  static readonly IV_LENGTH = 16; // For AES, this is always 16
  static readonly ALGORITHM = 'aes-256-cbc';

  static encryptString(text: string) {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY), iv);
    const encrypted = cipher.update(text, 'utf8', 'base64');
    return iv.toString('base64') + ':' + encrypted + cipher.final('base64');
  }

  static decryptString(text: string) {
    const [textParts, encryptedText] = text.split(':');
    const iv = Buffer.from(textParts, 'base64');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY), iv);
    const decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    return decrypted + decipher.final('utf8');
  }
}
