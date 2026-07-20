// import { createAuthClient } from 'better-auth/react';
// import { inferAdditionalFields } from 'better-auth/client/plugins';
// import type { auth } from './auth';

// export const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
//   plugins: [
//     inferAdditionalFields<typeof auth>(),
//   ],
// });

// export const { signIn, signUp, signOut, useSession } = authClient;

import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000',
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string', required: true, defaultValue: 'patient' },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;