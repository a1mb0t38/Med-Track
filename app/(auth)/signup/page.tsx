'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'caregiver',
  });
  const [uiError, setUiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (uiError) setUiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setUiError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setUiError(null);

    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (error) {
        setUiError(error.message ?? 'Something went wrong during signup.');
        return;
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong during signup.';
      setUiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">

        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">

          <div className="h-1.5 w-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-500" />

          <div className="px-8 pt-8 pb-10">
            <div className="text-center mb-8">
              <span className="text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
                <Link href="/">MediCare Tracker</Link>
              </span>
              <p className="mt-2 text-sm text-neutral-500">
                Manage your medications or monitor your family's health.
              </p>
            </div>

            {uiError && (
              <div className="mb-4 p-3 rounded-xl border border-danger-200 bg-danger-50 text-danger-700 text-sm">
                {uiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-name" className="text-sm font-medium text-neutral-700">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-email" className="text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-password" className="text-sm font-medium text-neutral-700">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  I want to use this app as a:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'patient' }))}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${formData.role === 'patient'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'caregiver' }))}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${formData.role === 'caregiver'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                  >
                    Caregiver
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formData.role === 'patient'
                    ? 'Track your own schedules and physical pill counts.'
                    : "Monitor a family member's adherence history remotely."}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}