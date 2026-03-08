import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { setupWebSocketProxy } from './ws-proxy.ts';

function wsProxy(): Plugin {
    return {
        name: 'ws-proxy',
        configureServer(server) {
            if (server.httpServer) {
                setupWebSocketProxy(server.httpServer);
            }
        }
    };
}

export default defineConfig({
    plugins: [tailwindcss(), sveltekit(), wsProxy()]
});
