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

  static isEncrypted(value: string): boolean {
    // 암호화된 문자열은 'base64로 인코딩된 IV : 암호화된 텍스트' 형식입니다.
    const parts = value.split(':');

    // 암호화된 문자열은 정확히 두 부분으로 나뉘어야 합니다.
    if (parts.length !== 2) {
      return false;
    }

    const [iv, encryptedText] = parts;

    // IV는 base64로 인코딩된 16바이트여야 합니다.
    if (Buffer.from(iv, 'base64').length !== this.IV_LENGTH) {
      return false;
    }

    // 암호화된 텍스트는 base64로 인코딩되어 있어야 합니다.
    try {
      Buffer.from(encryptedText, 'base64');
    } catch {
      return false;
    }

    // 모든 조건을 만족하면 암호화된 것으로 간주합니다.
    return true;
  }
}
