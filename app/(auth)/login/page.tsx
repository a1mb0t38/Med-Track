'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Input, Button } from '@heroui/react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Login failed');
      return;
    }

    toast.success('Logged in successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-800">
        <CardHeader className="flex flex-col gap-1 items-center pt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to your MedTrack account</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onValueChange={setEmail}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onValueChange={setPassword}
              required
            />

            <Button
              type="submit"
              color="primary"
              className="mt-4 font-semibold"
              isLoading={isLoading}
            >
              Log In
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
