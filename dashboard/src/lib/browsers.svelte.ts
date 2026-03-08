import { getBrowserInstancesEventsWebsocketURL, getBrowserPool, type BrowserPool } from "./api";

export interface BrowserInstances {
    id: string;

    vnc_enabled: boolean;

    browser_pool: BrowserPool;

    connected_at: string | undefined;
    preparation_tasks_started_at: string | undefined;
    browser_process_launching_at: string | undefined;
    browser_process_launched_at: string | undefined;
    browser_process_cdp_connected_at: string | undefined;
    browser_process_cdp_terminated_at: string | undefined;
    completion_tasks_started_at: string | undefined;

    cdp_close_event_at: string | undefined;
};

export class BrowserStore {

    browser_pool: BrowserPool | undefined = $state(undefined);

    browsers: Map<string, BrowserInstances> = $state(new Map());

    connection_error: string | undefined = $state(undefined);

    #websocket: WebSocket | undefined;

    #ws_consecutive_failures = 0;

    static readonly MAX_RETRIES = 3;

    /**
     * Connect the client to the backend. Update the browser pool status and connect to the browser instances status feed.
     */
    async connect() {
        const ok = await this.#updateBrowserPool();
        if (ok) {
            this.#connectBrowserInstances();
        }
    }

    #connectBrowserInstances() {
        this.#websocket = new WebSocket(getBrowserInstancesEventsWebsocketURL());

        this.#websocket.onmessage = (event) => {
            this.#ws_consecutive_failures = 0;
            this.connection_error = undefined;

            const browser_instances = JSON.parse(event.data) as BrowserInstances[];

            this.browsers = browser_instances.reduce((map, browser) => {
                map.set(browser.id, browser);
                return map;
            }, new Map());
        };

        this.#websocket.onclose = () => {
            this.#ws_consecutive_failures++;

            if (this.#ws_consecutive_failures >= BrowserStore.MAX_RETRIES) {
                this.connection_error = 'Unable to connect to BlitzBrowser';
                return;
            }

            setTimeout(() => {
                this.#connectBrowserInstances();
            }, 250);
        };
    }

    async #updateBrowserPool() {
        for (let attempt = 0; attempt < BrowserStore.MAX_RETRIES; attempt++) {
            try {
                this.browser_pool = await getBrowserPool();
                this.connection_error = undefined;
                return true;
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        this.connection_error = 'Unable to connect to BlitzBrowser';
        return false;
    }

}

export const browser_store = new BrowserStore();