import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import api from '../lib/api';

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setStatus('saving');
    try {
      await api.post('/user/settings/keys', { nvidia_api_key: apiKey });
      setStatus('success');
      setApiKey(''); // Clear for security after save
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to save API key');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>Workspace Settings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your AI configurations and security preferences.</p>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Key className="text-gradient" size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>NVIDIA NIM (Bring Your Own Key)</h3>
          </div>

          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '20px',
            lineHeight: '1.6' 
          }}>
            To power your experience, Sree AI uses your personal NVIDIA NIM API keys. 
            Keys are encrypted using AES-256 before being stored and are only decrypted on-the-fly for generation.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '0.85rem', 
              color: 'var(--text-muted)' 
            }}>
              NVIDIA API Key
            </label>
            <div className="chat-input-wrapper" style={{ margin: 0 }}>
              <input
                type="password"
                className="chat-input"
                placeholder="nvapi-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span style={{ color: '#10B981' }}>End-to-End Encryption Active</span>
            </div>

            <button 
              className="send-btn" 
              style={{ width: 'auto', padding: '0 24px', display: 'flex', gap: '8px' }}
              onClick={handleSave}
              disabled={status === 'saving' || !apiKey.trim()}
            >
              {status === 'saving' ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                marginTop: '20px', 
                padding: '12px', 
                borderRadius: '12px', 
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <CheckCircle2 size={18} />
              NVIDIA API Key securely saved and active.
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                marginTop: '20px', 
                padding: '12px', 
                borderRadius: '12px', 
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <AlertCircle size={18} />
              {errorMessage}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
