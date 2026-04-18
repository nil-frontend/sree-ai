import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Zap, Shield, Key } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      // Simulate upgrade
      await updateProfile({ plan_type: 'pro' });
      alert('Successfully upgraded to Pro! You now have unlimited neural processing.');
    } catch (error) {
      alert('Failed to upgrade. Please check your connection.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>System Settings</h2>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Profile Intelligence</div>
                <div className={styles.row}>
                  <div className={styles.info}>
                    <span className={styles.label}>Identity</span>
                    <span className={styles.value}>{user?.email}</span>
                  </div>
                  <User size={20} className="text-muted" />
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Computational Plan</div>
                <div className={styles.row}>
                  <div className={styles.info}>
                    <span className={styles.label}>{user?.plan_type === 'pro' ? 'Pro Membership' : 'Standard Node'}</span>
                    <span className={styles.value}>
                      {user?.plan_type === 'pro' ? 'Unlimited High-Priority Access' : 'Standard performance tier'}
                    </span>
                  </div>
                  {user?.plan_type !== 'pro' ? (
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleUpgrade}>
                      <Zap size={14} style={{ marginRight: '6px' }} />
                      Upgrade
                    </button>
                  ) : (
                    <Zap size={20} style={{ color: 'var(--accent)' }} />
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Connectivity</div>
                <div className={styles.row}>
                  <div className={styles.info}>
                    <span className={styles.label}>NVIDIA API Keys</span>
                    <span className={styles.value}>Managed by CORE Infrastructure</span>
                  </div>
                  <Key size={20} className="text-muted" />
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Security</div>
                <div className={styles.row}>
                  <div className={styles.info}>
                    <span className={styles.label}>Neural Encryption</span>
                    <span className={styles.value}>Active and Verified</span>
                  </div>
                  <Shield size={20} style={{ color: 'var(--success)' }} />
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.btn} onClick={onClose} style={{ background: 'var(--bg-hover)', border: 'none', color: 'var(--text)' }}>
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
