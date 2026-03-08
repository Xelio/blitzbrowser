export interface BrowserPool {
    id: string;
    started_at: string;
    max_browser_instances: number;
    tags: { [key: string]: string; };
};

const apiConfig: { proxy: boolean; url?: string; api_key?: string } =
    (await (await fetch('/api')).json());

// Pre-compute direct-mode values when not proxying
const api_url = apiConfig.proxy ? null : new URL(apiConfig.url!);
const websocket_url = apiConfig.proxy ? null : new URL(
    `${api_url!.protocol === 'https:' ? 'wss' : 'ws'}://${api_url!.host}`
);
const api_key_header: { [key: string]: string } =
    (!apiConfig.proxy && apiConfig.api_key) ? { 'x-api-key': apiConfig.api_key } : {};
const api_key_param = (!apiConfig.proxy && apiConfig.api_key) ? `apiKey=${apiConfig.api_key}` : '';
const is_authentication_required = !apiConfig.proxy && typeof apiConfig.api_key === 'string';

export async function getBrowserPool(): Promise<BrowserPool> {
    if (apiConfig.proxy) {
        const response = await fetch('/api/browser-pool');
        return await response.json();
    }
    const response = await fetch(`${api_url}browser-pool`, { headers: { ...api_key_header } });
    return await response.json();
}

export function getBrowserInstancesEventsWebsocketURL() {
    if (apiConfig.proxy) {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${location.host}/api/ws/browser-instances`;
    }
    return `${websocket_url}browser-instances${is_authentication_required ? `?${api_key_param}` : ''}`;
}

export function getLiveViewWebsocketUrl(browser_instance_id: string) {
    if (apiConfig.proxy) {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${location.host}/api/ws/browser-instances/${browser_instance_id}/vnc`;
    }
    return `${websocket_url}browser-instances/${browser_instance_id}/vnc${is_authentication_required ? `?${api_key_param}` : ''}`;
}
