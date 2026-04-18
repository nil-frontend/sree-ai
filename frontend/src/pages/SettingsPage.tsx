import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, CheckCircle2, AlertCircle, ShieldCheck, Trash2, RefreshCcw } from 'lucide-react';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import api from '../lib/api';

interface ApiKeyInfo {
  provider: string;
  updated_at: string;
  last_used_at: string;
}

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [savedKeys, setSavedKeys] = useState<ApiKeyInfo[]>([]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchKeys = async () => {
    try {
      const response = await api.get('/user/settings/keys');
      setSavedKeys(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setStatus('saving');
    try {
      await api.post('/user/settings/keys', { nvidia_api_key: apiKey });
      setStatus('success');
      setApiKey(''); // Clear for security after save
      await fetchKeys();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to save API key');
    }
  };

  const handleDelete = async (provider: string) => {
    if (!confirm(`Are you sure you want to delete your ${provider} API key? This will stop AI features from working for you.`)) return;
    
    try {
      await api.delete(`/user/settings/keys/${provider}`);
      await fetchKeys();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete key');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>Workspace Settings</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your AI configurations and security preferences.</p>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: '24px', marginBottom: '24px' }}>
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

        {/* Saved Keys Section */}
        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Active API Configuration</h3>
          
          {savedKeys.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
              No custom API keys configured yet. The workspace will use system defaults if available.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedKeys.map((key) => (
                <div key={key.provider} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{key.provider}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      Status: <span style={{ color: '#10B981' }}>Active</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Last updated: {new Date(key.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(key.provider)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'rgba(239, 68, 68, 0.5)', 
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239, 68, 68, 0.5)')}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
