import { PUBLIC_API_URL } from "$env/static/public";

export const api_url = new URL(PUBLIC_API_URL);

export const websocket_url = new URL(`${api_url.protocol === 'https' ? 'wss' : 'ws'}://${api_url.host}`)