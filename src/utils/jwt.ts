import jwt from 'jsonwebtoken'
import type { UserPayload } from '../types/user.types';

const getJWTSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if(!secret) {
        throw new Error("JWT_SECRET is not set");
    }
    return secret;
};

export const generateToken = (user: {
    id: string;
    role: string;
    name: string;
}) => {
    return jwt.sign({
        sub: user.id,
        role: user.role,
        name : user.name,
    },
    getJWTSecret(),
    { expiresIn : "1h" }
);
};

export const verifyToken = (token: string): UserPayload => {
    const decoded = jwt.verify(token, getJWTSecret()) as any;
    return {
        id: decoded.sub,
        role: decoded.role,
        name: decoded.name
    };
}