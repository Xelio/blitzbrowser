import { env } from "$env/dynamic/public";

export const api_url = new URL(env.PUBLIC_API_URL || 'http://localhost:9999');

export const websocket_url = new URL(`${api_url.protocol === 'https' ? 'wss' : 'ws'}://${api_url.host}`)