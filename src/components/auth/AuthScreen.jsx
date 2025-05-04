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
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-black text-off-white">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-none rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-white">
            {authMode === 'login' ? '' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {authMode === 'login' ? 'Sign in to continue' : 'Fill in the details to register'}
          </CardDescription>
          {error && <div className="text-red-500 text-center pt-2 text-sm">{error}</div>}
        </CardHeader>
        <CardContent className="relative overflow-hidden min-h-[350px] pt-4"> {/* Adjusted min-height */}
          <AnimatePresence mode="wait" custom={authMode === 'login' ? 'right' : 'left'}>
            {authMode === 'login' ? (
              <motion.div
                key="login"
                custom="right"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute w-full px-6" // Added padding to match CardContent default
              >
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Email"
                      className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      required
                    />
                    <Input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Password"
                      className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-200 rounded-lg py-2.5"
                    disabled={authOperationLoading}
                  >
                    <LogIn className="mr-2 h-4 w-4" /> {authOperationLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-medium text-[#2563eb] hover:underline focus:outline-none"
                    >
                      Register
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
                className="absolute w-full px-6" // Added padding to match CardContent default
              >
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      placeholder="Full Name"
                      className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      required
                    />
                    <Input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="Email"
                      className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      required
                    />
                    <Input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Password"
                      className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      required
                    />
                    <Input
                      type="password"
                      name="password_confirmation"
                      value={registerData.password_confirmation}
                      onChange={handleRegisterChange}
                      placeholder="Confirm Password"
                      className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-200 rounded-lg py-2.5"
                    disabled={authOperationLoading}
                  >
                     <UserPlus className="mr-2 h-4 w-4" /> {authOperationLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  <div className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-medium text-[#2563eb] hover:underline focus:outline-none"
                    >
                      Login
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