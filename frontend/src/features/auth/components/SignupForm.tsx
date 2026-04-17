import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', color: '#4ade80' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Check your email</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>We've sent a verification link to {email}.</p>
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="auth-button" 
          style={{ marginTop: '24px' }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#f87171', marginBottom: '20px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="auth-input-group">
        <label className="auth-label">Email Address</label>
        <input 
          id="signup-email"
          type="email" 
          className="auth-input" 
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="auth-input-group">
        <label className="auth-label">Password</label>
        <input 
          id="signup-password"
          type="password" 
          className="auth-input" 
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="auth-input-group">
        <label className="auth-label">Confirm Password</label>
        <input 
          id="signup-confirm-password"
          type="password" 
          className="auth-input" 
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button id="signup-submit" type="submit" className="auth-button" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
        Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
      </div>
    </form>
  );
};
