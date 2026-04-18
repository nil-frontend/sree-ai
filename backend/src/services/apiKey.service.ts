import { supabaseAdmin } from '../lib/supabase';
import { encrypt, decrypt } from '../lib/encryption';

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  provider: string;
  encrypted_key: string;
  iv: string;
  created_at: string;
}

export class ApiKeyService {
  /**
   * Fetches and decrypts an API key for a specific user and provider.
   * Falls back to environment variables if no user-specific key is found.
   */
  static async getUserApiKey(userId: string, provider: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (data) {
      const record = data as ApiKeyRecord;
      try {
        return decrypt(record.encrypted_key, record.iv);
      } catch (e) {
        console.error(`Failed to decrypt key for user ${userId}, provider ${provider}:`, e);
      }
    }

    // Fallback to system key if allowed
    const envKeyName = `${provider.toUpperCase()}_API_KEY`;
    return process.env[envKeyName] || null;
  }

  /**
   * Encrypts and saves an API key for a user
   */
  static async saveUserApiKey(userId: string, provider: string, rawKey: string): Promise<boolean> {
    const { encryptedData, iv } = encrypt(rawKey);

    // Upsert key (replace if exists for the same user+provider)
    const { error } = await supabaseAdmin
      .from('api_keys')
      .upsert({
        user_id: userId,
        provider,
        encrypted_key: encryptedData,
        iv: iv,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      console.error('Error saving API key:', error);
      return false;
    }

    return true;
  }
}
