import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-black text-off-white">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-none rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome Back</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Login to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent gap-2">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-[#1e1e1e] data-[state=inactive]:text-gray-400 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-[#1e1e1e] data-[state=inactive]:text-gray-400 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
              >
                Register
              </TabsTrigger>
            </TabsList>
            
            <div className="relative min-h-[320px]">
              <AnimatePresence mode="wait">
                <TabsContent key="login-content" value="login" className="absolute w-full" asChild>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      <motion.div
                        key="login-email"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Input 
                          type="email" 
                          placeholder="Email" 
                          className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]" 
                        />
                      </motion.div>
                      <motion.div
                        key="login-password"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Input 
                          type="password" 
                          placeholder="Password" 
                          className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]" 
                        />
                      </motion.div>
                    </div>
                    <motion.div
                      key="login-button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button 
                        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-200 rounded-lg py-2.5"
                        onClick={onLogin}
                      >
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </Button>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent key="register-content" value="register" className="absolute w-full" asChild>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      {[
                        { key: 'name', type: 'text', placeholder: 'Full Name' },
                        { key: 'email', type: 'email', placeholder: 'Email' },
                        { key: 'password', type: 'password', placeholder: 'Password' },
                        { key: 'confirm', type: 'password', placeholder: 'Confirm Password' }
                      ].map((field, index) => (
                        <motion.div
                          key={`register-${field.key}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * (index + 1) }}
                        >
                          <Input 
                            type={field.type}
                            placeholder={field.placeholder}
                            className="bg-[#1e1e1e] border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      key="register-button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button 
                        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors duration-200 rounded-lg py-2.5"
                      >
                        Create Account
                      </Button>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
