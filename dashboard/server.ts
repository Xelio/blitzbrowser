import http from 'node:http';
import { setupWebSocketProxy } from './ws-proxy.ts';

// SvelteKit adapter-node build output
// @ts-ignore - build output only exists after `pnpm build`
const { server } = await import('../build/index.js') as { server: { server: http.Server } };

setupWebSocketProxy(server.server);
