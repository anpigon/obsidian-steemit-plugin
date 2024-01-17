import crypto from 'crypto';

export default class Encrypt {
  static readonly ENCRYPTION_KEY = 'god-obsidian-steemit-encrypt-key';
  static readonly IV_LENGTH = 16; // For AES, this is always 16
  static readonly ALGORITHM = 'aes-256-cbc';

  static encryptString(text: string) {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY), iv);
    const encrypted = cipher.update(text);
    return iv.toString('hex') + ':' + Buffer.concat([encrypted, cipher.final()]).toString('hex');
  }

  static decryptString(text: string) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY), iv);
    const decrypted = decipher.update(encryptedText);
    return Buffer.concat([decrypted, decipher.final()]).toString();
  }
}
