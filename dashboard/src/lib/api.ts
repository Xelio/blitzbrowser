const blitzbrowser_api: { url: string; api_key: string | undefined } = (await (await fetch('/api')).json());

const is_authentication_required = typeof blitzbrowser_api.api_key === 'string';

const api_key_header: { [key: string]: string } = blitzbrowser_api.api_key ? { 'x-api-key': blitzbrowser_api.api_key } : {};
const api_key_param = blitzbrowser_api.api_key ? `apiKey=${blitzbrowser_api.api_key}` : '';

const api_url = new URL(blitzbrowser_api.url);
const websocket_url = new URL(`${api_url.protocol === 'https' ? 'wss' : 'ws'}://${api_url.host}`);

export interface BrowserPool {
    id: string;
    started_at: string;
    max_browser_instances: number;
    tags: { [key: string]: string; };
};

export async function getBrowserPool(): Promise<BrowserPool> {
    const response = await fetch(`${api_url}browser-pool`, {
        headers: {
            ...api_key_header
        }
    });

    return await response.json();
}

export function getBrowserInstancesEventsWebsocketURL() {
    return `${websocket_url}browser-instances${is_authentication_required ? `?${api_key_param}` : ''}`;
}

export function getLiveViewWebsocketUrl(browser_instance_id: string) {
    return `${websocket_url}browser-instances/${browser_instance_id}/vnc${is_authentication_required ? `?${api_key_param}` : ''}`;
}