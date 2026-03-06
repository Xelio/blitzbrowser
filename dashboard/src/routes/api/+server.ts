import { env } from '$env/dynamic/private';
import { isAuthenticated } from '$lib/auth.js';
import { error, json } from '@sveltejs/kit';

export function GET({ cookies }) {
    if (!isAuthenticated(cookies)) {
        error(403, 'You are not authenticated');
    }

    if (env.PROXY_BLITZBROWSER_API === 'true') {
        return json({ proxy: true });
    }

    return json({
        proxy: false,
        url: env.BLITZBROWSER_API_URL || 'http://localhost:9999',
        api_key: env.BLITZBROWSER_API_KEY
    });
}
