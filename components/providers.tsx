'use client';

import React from 'react';

/**
 * In HeroUI v3 (designed for React 19 and Tailwind CSS v4), a root provider 
 * is no longer required. We define a local placeholder here to align with the 
 * project requirements and support future context customization if needed.
 */
export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}
