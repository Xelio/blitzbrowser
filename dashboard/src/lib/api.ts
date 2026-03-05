export interface BrowserPool {
    id: string;
    started_at: string;
    max_browser_instances: number;
    tags: { [key: string]: string; };
};

export async function getBrowserPool(): Promise<BrowserPool> {
    const response = await fetch('/api/browser-pool');
    return await response.json();
}

export function getBrowserInstancesEventsWebsocketURL() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}/api/ws/browser-instances`;
}

export function getLiveViewWebsocketUrl(browser_instance_id: string) {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}/api/ws/browser-instances/${browser_instance_id}/vnc`;
}