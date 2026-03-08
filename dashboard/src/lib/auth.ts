import type { Cookies } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE_NAME, hashAuthKey, expectedHashedAuthKey, isAuthRequired, isHashedAuthKeyValid } from '../../auth-check.ts';

const is_https_required = env.HTTPS_DISABLED !== 'true';

export function isAuthenticated(cookies: Cookies) {
    if (!isAuthRequired()) return true;
    return isHashedAuthKeyValid(cookies.get(SESSION_COOKIE_NAME));
}

export async function authenticate(auth_key: string, cookies: Cookies) {
    if (!isAuthRequired()) return true;
    if (!isHashedAuthKeyValid(hashAuthKey(auth_key))) return false;

    cookies.set(SESSION_COOKIE_NAME, expectedHashedAuthKey(), {
        path: '/',
        httpOnly: true,
        secure: is_https_required
    });

    return true;
}
