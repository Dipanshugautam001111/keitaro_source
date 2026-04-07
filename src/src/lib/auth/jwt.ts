import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const getSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
        throw new Error('JWT_SECRET environment variable is missing.');
    }
    return new TextEncoder().encode(secret);
};

export async function signToken(payload: { userId: number; role: string }) {
    const alg = 'HS256'; // Using HS256 for simplicity in the port, Keitaro uses RS256
    return new SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('1d') // 1 day expiration
        .sign(getSecretKey());
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getSecretKey());
        return payload as { userId: number; role: string };
    } catch {
        return null;
    }
}

export async function getUserFromRequest(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    return verifyToken(token);
}
