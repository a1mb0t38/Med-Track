import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/medtrack';

let client: MongoClient;

if (process.env.NODE_ENV === 'development') {
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

const db = client.db('medtrack');

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
                input: true,
            },
        },
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: 'none',
            secure: true,
        },
    },
    trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET,
});