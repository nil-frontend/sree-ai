import React from 'react';
import { AuthLayout } from '../features/auth/AuthLayout';
import { SignupForm } from '../features/auth/components/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;
