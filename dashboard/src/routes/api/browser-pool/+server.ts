import { env } from '$env/dynamic/private';
import { isAuthenticated } from '$lib/auth.js';
import { error, json } from '@sveltejs/kit';

export async function GET({ cookies }) {
    if (!isAuthenticated(cookies)) {
        error(403, 'You are not authenticated');
    }

    const api_url = (env.BLITZBROWSER_API_URL || 'http://localhost:9999').replace(/\/$/, '');
    const headers: Record<string, string> = {};
    if (env.BLITZBROWSER_API_KEY) {
        headers['x-api-key'] = env.BLITZBROWSER_API_KEY;
    }

    const response = await fetch(`${api_url}/browser-pool`, { headers });
    if (!response.ok) {
        error(response.status, await response.text());
    }
    return json(await response.json());
}
