import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'SESSION_ID';

export function hashAuthKey(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

export function isAuthRequired(): boolean {
    return !!process.env.AUTH_KEY;
}

export function expectedHashedAuthKey(): string {
    return hashAuthKey(process.env.AUTH_KEY!);
}

export function parseCookies(cookieStr: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieStr.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        if (name) cookies[name] = rest.join('=');
    });
    return cookies;
}

export function isHashedAuthKeyValid(hashedKey: string | undefined): boolean {
    return hashedKey === expectedHashedAuthKey();
}

/**
 * Check if a raw HTTP cookie header represents an authenticated session.
 * Returns true if AUTH_KEY is not set (no auth required).
 */
export function isAuthenticatedByCookie(cookieHeader: string | undefined): boolean {
    if (!isAuthRequired()) return true;
    const cookies = parseCookies(cookieHeader || '');
    return isHashedAuthKeyValid(cookies[SESSION_COOKIE_NAME]);
}
