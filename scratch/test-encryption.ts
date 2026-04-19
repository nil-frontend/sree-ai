import { encrypt, decrypt } from '../backend/src/lib/encryption';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './backend/.env') });

const testText = 'test-api-key-12345';
console.log('Original Text:', testText);

try {
  const { encryptedData, iv } = encrypt(testText);
  console.log('Encrypted:', encryptedData);
  console.log('IV:', iv);

  const decrypted = decrypt(encryptedData, iv);
  console.log('Decrypted:', decrypted);

  if (testText === decrypted) {
    console.log('✅ Success: Decrypted text matches original.');
  } else {
    console.error('❌ Error: Decrypted text does not match.');
  }
} catch (error) {
  console.error('❌ Encryption test failed:', error);
}
