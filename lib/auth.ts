import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/medtrack';

let client: MongoClient;

if (process.env.NODE_ENV === 'development') {
  // In development, cache the MongoClient globally to prevent connection leaks during hot-reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoAuthClient?: MongoClient;
  };
  if (!globalWithMongo._mongoAuthClient) {
    globalWithMongo._mongoAuthClient = new MongoClient(uri);
  }
  client = globalWithMongo._mongoAuthClient;
} else {
  client = new MongoClient(uri);
}

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'patient',
        input: true, // Allow user to supply it on sign-up
      },
    },
  },
  // Ensure the base URL is configured properly
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});
