'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

// ─── Validation ───────────────────────────────────────────────────────────────

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

interface FormErrors {
  email?: string;
  password?: string;
}

const validate = (email: string, password: string): FormErrors => {
  const errors: FormErrors = {};
  if (!email) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
};

// ─── Google SVG Icon ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleDemoFill = () => {
    setEmail('demo@medtrack.com');
    setPassword('Demo1234!');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message ?? 'Login failed. Please try again.');
        return;
      }

      toast.success(`Welcome back, ${data?.user?.name ?? 'there'}!`);
      router.push('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed. Please try again.';
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">

          {/* Header strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-500" />

          <div className="px-8 pt-8 pb-10">
            {/* Logo + title */}
            <div className="text-center mb-8">
              <span className="text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
                <Link href="/">MedTrack</Link>
              </span>
              <h1 className="mt-3 text-xl font-bold text-neutral-800 dark:text-neutral-100">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Sign in to continue your interview prep
              </p>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/30 ${errors.email
                    ? 'border-danger-500 dark:border-danger-500'
                    : 'border-neutral-300 dark:border-neutral-700 focus:border-primary-500'
                    }`}
                />
                {errors.email && (
                  <p className="text-xs text-danger-600 dark:text-danger-400 mt-0.5">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/30 ${errors.password
                    ? 'border-danger-500 dark:border-danger-500'
                    : 'border-neutral-300 dark:border-neutral-700 focus:border-primary-500'
                    }`}
                />
                {errors.password && (
                  <p className="text-xs text-danger-600 dark:text-danger-400 mt-0.5">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                id="login-submit"
                className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Demo login */}
            <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
              <p className="text-xs text-warning-700 dark:text-warning-400 text-center mb-2 font-medium">
                🎭 Try the demo account
              </p>
              <button
                type="button"
                id="demo-login-btn"
                onClick={handleDemoFill}
                className="w-full py-2 rounded-xl border border-warning-300 dark:border-warning-700 bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300 text-xs font-semibold hover:bg-warning-200 dark:hover:bg-warning-800/40 transition-colors"
              >
                Fill Demo Credentials
              </button>
              <p className="text-xs text-neutral-400 text-center mt-1.5">
                demo@medtrack.com / Demo1234!
              </p>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-neutral-500 mt-6">
              New to PrepPilot?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}