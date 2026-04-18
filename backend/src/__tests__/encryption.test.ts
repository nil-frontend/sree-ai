import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../lib/encryption';
import dotenv from 'dotenv';
import path from 'path';

// Load env if needed for the test
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

describe('Encryption Utility', () => {
  it('should encrypt and decrypt a string correctly', () => {
    const originalText = 'sk-test-123456789';
    const { encryptedData, iv } = encrypt(originalText);
    
    expect(encryptedData).not.toBe(originalText);
    expect(iv).toBeDefined();
    expect(iv.length).toBe(32); // 16 bytes IV as hex
    
    const decryptedText = decrypt(encryptedData, iv);
    expect(decryptedText).toBe(originalText);
  });

  it('should throw error if ENCRYPTION_KEY is missing', () => {
    const originalValue = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    
    expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY is not defined');
    
    process.env.ENCRYPTION_KEY = originalValue;
  });
});
