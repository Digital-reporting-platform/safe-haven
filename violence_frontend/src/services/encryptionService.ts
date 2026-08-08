// Encryption service using Web Crypto API
export class EncryptionService {
  private static algorithm = 'AES-GCM';
  private static keyLength = 256;

  // Generate a new encryption key
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Export key as base64 string
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  // Import key from base64 string
  static async importKey(keyData: string): Promise<CryptoKey> {
    const keyBytes = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      'raw',
      keyBytes,
      this.algorithm,
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data
  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM IV

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data
  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
