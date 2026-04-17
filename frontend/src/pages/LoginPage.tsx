import React from 'react';
import { AuthLayout } from '../features/auth/AuthLayout';
import { LoginForm } from '../features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
