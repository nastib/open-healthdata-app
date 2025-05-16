import CryptoJS from 'crypto-js';

const CRYPTO_SECRET_KEY = 'default-secret-key';

export async function encrypt(data: any): Promise<string> {
  return CryptoJS.AES.encrypt(JSON.stringify(data), CRYPTO_SECRET_KEY).toString();
}

export async function decrypt(encrypted: string): Promise<string | null> {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, CRYPTO_SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}
