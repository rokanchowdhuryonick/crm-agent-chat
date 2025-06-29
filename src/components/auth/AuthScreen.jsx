// src/components/auth/AuthScreen.jsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react'; // Added UserPlus icon
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export const AuthScreen = () => {
  const { login, register, authOperationLoading } = useAuth();
  // Remove the local isLoading state as we'll use the context one
  // const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  
  const [error, setError] = useState('');

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // setIsLoading(true); // Don't set local loading state anymore
    // Don't set local loading state anymore
    setError('');


    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      // setIsLoading(false);
      return;
    }

    try {
      console.log('Calling login with:', loginData.email);
      const result = await login(loginData.email, loginData.password);
      console.log('Login result:', result);

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
      // On successful login, the AuthProvider will handle redirect/state change
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login.');
    } 
    // finally {
    //   setIsLoading(false);
    // }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // setIsLoading(true);
    // Don't set local loading state anymore
    setError('');

    if (!registerData.name || !registerData.email || !registerData.password || !registerData.password_confirmation) {
      setError('Please fill in all fields');
      // setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.password_confirmation) {
      setError('Passwords do not match');
      // setIsLoading(false);
      return;
    }

    try {
      const result = await register(registerData);

      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
      } 
      // else {
        // Optionally switch to login view after successful registration
        // setAuthMode('login');
        // Or rely on AuthProvider to redirect
      // }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred during registration.');
    } 
    // finally {
    //   setIsLoading(false);
    // }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError(''); // Clear errors when switching modes
    // Reset form data if needed, or keep it
    // setLoginData({ email: '', password: '' });
    // setRegisterData({ name: '', email: '', password: '', password_confirmation: '' });
  };

  const formVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction === 'right' ? -50 : 50,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction === 'right' ? 50 : -50,
      transition: { duration: 0.3, ease: "easeInOut" }
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md bg-card border-border rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-6 pt-8 text-center"> {/* Increased top/bottom padding, centered text */}
          <CardTitle className="text-3xl font-bold text-primary">
            {authMode === 'login' ? '' : 'Create Your Account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground px-4">
            {authMode === 'login' ? 'Sign in to access your AI Agent dashboard.' : 'Join us and explore the future of AI.'}
          </CardDescription>
          {error && <div className="text-destructive pt-3 text-sm px-4">{error}</div>}
        </CardHeader>
        <CardContent className="relative overflow-hidden min-h-[420px] p-0"> {/* Adjusted min-height, no padding here */}
          <AnimatePresence mode="wait" custom={authMode === 'login' ? 'right' : 'left'}>
            {authMode === 'login' ? (
              <motion.div
                key="login"
                custom="right"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-col justify-center items-center p-6 sm:p-8" // Use flex to center, added responsive padding
              >
                <form onSubmit={handleLogin} className="w-full space-y-6">
                  <div className="space-y-4">
                    <Input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="your@email.com"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base px-4" // Increased height and padding
                      required
                    />
                    <Input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base px-4" // Increased height and padding
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 rounded-lg py-3 text-base sm:text-lg font-semibold h-12 flex items-center justify-center" // Increased height, ensured flex centering for icon
                    disabled={authOperationLoading}
                  >
                    <LogIn className="mr-2 h-5 w-5" /> {authOperationLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-medium text-primary hover:underline focus:outline-none"
                    >
                      Register Now
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                custom="left"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex flex-col justify-center items-center p-6 sm:p-8" // Use flex to center, added responsive padding
              >
                <form onSubmit={handleRegister} className="w-full space-y-6">
                  <div className="space-y-4">
                    <Input
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      placeholder="Full Name"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base px-4" // Increased height and padding
                      required
                    />
                    <Input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="your@email.com"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base px-4" // Increased height and padding
                      required
                    />
                    <Input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Create a Password"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base px-4" // Increased height and padding
                      required
                    />
                    <Input
                      type="password"
                      name="password_confirmation"
                      value={registerData.password_confirmation}
                      onChange={handleRegisterChange}
                      placeholder="Confirm Password"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary h-12 text-base px-4" // Increased height and padding
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 rounded-lg py-3 text-base sm:text-lg font-semibold h-12 flex items-center justify-center" // Increased height, ensured flex centering for icon
                    disabled={authOperationLoading}
                  >
                     <UserPlus className="mr-2 h-5 w-5" /> {authOperationLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-medium text-primary hover:underline focus:outline-none"
                    >
                      Login Here
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};