'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Input, Button, RadioGroup, Radio } from '@heroui/react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      role, // Custom field stored directly in user object
      callbackURL: '/dashboard',
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Signup failed');
      return;
    }

    toast.success('Account created successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-800">
        <CardHeader className="flex flex-col gap-1 items-center pt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your Account</h1>
          <p className="text-sm text-gray-500">Join MedTrack to manage medications</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              value={name}
              onValueChange={setName}
              required
            />
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
            
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Select your role:</span>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                orientation="horizontal"
                className="mt-1"
              >
                <Radio value="patient">Patient</Radio>
                <Radio value="caregiver">Caregiver</Radio>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              color="primary"
              className="mt-4 font-semibold"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Log In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
