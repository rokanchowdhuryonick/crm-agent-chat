// src/components/auth/AuthScreen.jsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export const AuthScreen = () => {
  // Destructure from useAuth directly
  const { login, register } = useAuth();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Add these handler functions that were missing
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Rest of your handleLogin function
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Calling login with:', loginData.email);
      const result = await login(loginData.email, loginData.password);
      console.log('Login result:', result);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.password_confirmation) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
  
    if (registerData.password !== registerData.password_confirmation) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
  
    try {
      const result = await register(registerData);
      
      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-black text-off-white">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-none rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome Back</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Login to your account or create a new one
          </CardDescription>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent gap-2">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-black data-[state=active]:text-black data-[state=inactive]:bg-[#1e1e1e] data-[state=inactive]:text-gray-400 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-black data-[state=active]:text-black data-[state=inactive]:bg-[#1e1e1e] data-[state=inactive]:text-gray-400 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
              >
                Register
              </TabsTrigger>
            </TabsList>
            
            <div className="relative min-h-[320px]">
              <AnimatePresence initial={false} mode="sync">
                <TabsContent key="login-content" value="login" className="absolute w-full" asChild>
                  <motion.form
                    onSubmit={handleLogin}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    {/* Login Form Fields */}
                    <div className="space-y-3">
                      <Input 
                        type="email" 
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="Email" 
                        className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]" 
                      />
                      <Input 
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Password" 
                        className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]" 
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-200 rounded-lg py-2.5"
                      disabled={isLoading}
                    >
                      <LogIn className="mr-2 h-4 w-4" /> {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </motion.form>
                </TabsContent>

                <TabsContent key="register-content" value="register" className="absolute w-full" asChild>
                  <motion.form
                    onSubmit={handleRegister}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    {/* Register Form Fields */}
                    <div className="space-y-3">
                      <Input 
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="Full Name"
                        className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      />
                      <Input 
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="Email"
                        className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      />
                      <Input 
                        type="password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="Password"
                        className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      />
                      <Input 
                        type="password"
                        name="password_confirmation"
                        value={registerData.password_confirmation}
                        onChange={handleRegisterChange}
                        placeholder="Confirm Password"
                        className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-200 rounded-lg py-2.5"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </motion.form>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};