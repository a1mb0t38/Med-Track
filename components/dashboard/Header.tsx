'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: 'patient' | 'caregiver';
  };
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Logged out successfully');
            router.push('/login');
            router.refresh();
          }
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const navItems = user.role === 'caregiver'
    ? [
      { label: 'Patients', href: '/caregiver' },
      { label: 'Settings', href: '/settings' }
    ]
    : [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'History', href: '/history' },
      { label: 'Settings', href: '/settings' }
    ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={user.role === 'caregiver' ? '/caregiver' : '/dashboard'} className="flex items-center gap-2">
            <span className="font-bold text-2xl bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
              MedTrack
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/30'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
            <span className="text-xs text-slate-400 capitalize">{user.role}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/30"
          >
            Sign Out
          </button>
        </div>
      </div>
      {/* Mobile nav for small screens */}
      <div className="md:hidden flex items-center justify-center gap-4 pb-3 border-t border-slate-100 dark:border-slate-900 px-4 pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${isActive
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}