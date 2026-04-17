import React from 'react';
import { motion } from 'framer-motion';
import './Auth.css';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="aura-top" />
      <div className="aura-bottom" />
      <div className="auth-grid" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div className="auth-logo">S</div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Sree AI</h1>
          <p style={{ margin: '8px 0 0 0', color: '#94a3b8', textAlign: 'center', fontSize: '0.875rem' }}>
            The Pulse of Artificial Intelligence
          </p>
        </div>
        
        {children}
      </motion.div>
      
      <div style={{ position: 'absolute', bottom: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
        &copy; 2026 Sree AI. Production Grade SaaS.
      </div>
    </div>
  );
};
