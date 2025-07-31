'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { isValidEmail, isValidPhone } from '@/utils';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const AuthPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loginErrors, setLoginErrors] = useState<Partial<LoginForm>>({});
  const [signupErrors, setSignupErrors] = useState<Partial<SignupForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleLoginInputChange = (field: keyof LoginForm, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignupInputChange = (field: keyof SignupForm, value: string) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
    if (signupErrors[field]) {
      setSignupErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateLoginForm = (): boolean => {
    const errors: Partial<LoginForm> = {};
    
    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const errors: Partial<SignupForm> = {};
    
    if (!signupForm.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!signupForm.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(signupForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!signupForm.phone) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(signupForm.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!signupForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await login({ email: loginForm.email, password: loginForm.password });
      if (success) {
        // Success message is handled in AuthContext
        // Redirect will be handled by the router
      }
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signup({
        first_name: signupForm.firstName,
        last_name: signupForm.lastName,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password
      });
      toast.success('Account created successfully!');
    } catch (error) {
      // Error handling is done in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setLoginErrors({});
    setSignupErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          {isSignup ? (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={signupForm.firstName}
                  onChange={(e) => handleSignupInputChange('firstName', e.target.value)}
                  error={signupErrors.firstName}

                  required
                />
                <Input
                  label="Last Name"
                  value={signupForm.lastName}
                  onChange={(e) => handleSignupInputChange('lastName', e.target.value)}
                  error={signupErrors.lastName}

                  required
                />
              </div>
              
              <Input
                label="Email Address"
                type="email"
                value={signupForm.email}
                onChange={(e) => handleSignupInputChange('email', e.target.value)}
                error={signupErrors.email}
                
                required
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={signupForm.phone}
                onChange={(e) => handleSignupInputChange('phone', e.target.value)}
                error={signupErrors.phone}
                
                placeholder="+1 (555) 123-4567"
                required
              />
              
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={signupForm.password}
                onChange={(e) => handleSignupInputChange('password', e.target.value)}
                error={signupErrors.password}
                
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
              
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={signupForm.confirmPassword}
                onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                error={signupErrors.confirmPassword}
                
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
              
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full"
              >
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={loginForm.email}
                onChange={(e) => handleLoginInputChange('email', e.target.value)}
                error={loginErrors.email}
                
                required
              />
              
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => handleLoginInputChange('password', e.target.value)}
                error={loginErrors.password}
                
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full"
              >
                Sign In
              </Button>
            </form>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;