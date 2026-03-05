import http from 'node:http';
import https from 'node:https';
import type { Duplex } from 'node:stream';
import type { EventEmitter } from 'node:events';
import { isAuthenticatedByCookie } from './auth-check.ts';

export function setupWebSocketProxy(httpServer: EventEmitter): void {
    const apiUrl = process.env.BLITZBROWSER_API_URL || 'http://localhost:9999';
    const apiKey = process.env.BLITZBROWSER_API_KEY;

    httpServer.on('upgrade', (req: http.IncomingMessage, socket: Duplex, head: Buffer) => {
        const url = req.url || '';
        if (!url.startsWith('/api/ws/')) {
            return;
        }

        // Prevent unhandled socket errors from crashing the process
        socket.on('error', () => socket.destroy());

        // Authenticate via session cookie
        if (!isAuthenticatedByCookie(req.headers.cookie)) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
        }

        // Strip /api/ws prefix to get the backend path
        const backendPath = url.replace(/^\/api\/ws/, '');

        // Add API key as query parameter
        const separator = backendPath.includes('?') ? '&' : '?';
        const targetPath = apiKey
            ? `${backendPath}${separator}apiKey=${encodeURIComponent(apiKey)}`
            : backendPath;

        const target = new URL(apiUrl);
        const transport = target.protocol === 'https:' ? https : http;

        const proxyReq = transport.request({
            hostname: target.hostname,
            port: target.port || (target.protocol === 'https:' ? 443 : 80),
            path: targetPath,
            method: 'GET',
            headers: {
                ...req.headers,
                host: target.host,
            },
        });

        proxyReq.on('upgrade', (proxyRes: http.IncomingMessage, proxySocket: Duplex, proxyHead: Buffer) => {
            let response = 'HTTP/1.1 101 Switching Protocols\r\n';
            for (const [key, value] of Object.entries(proxyRes.headers)) {
                if (value !== undefined) {
                    const values = Array.isArray(value) ? value : [value];
                    for (const v of values) {
                        response += `${key}: ${v}\r\n`;
                    }
                }
            }
            response += '\r\n';

            socket.write(response);

            // Forward any buffered data
            if (proxyHead.length > 0) socket.write(proxyHead);
            if (head.length > 0) proxySocket.write(head);

            // Pipe bidirectionally
            proxySocket.pipe(socket);
            socket.pipe(proxySocket);

            proxySocket.on('error', () => socket.destroy());
            socket.on('error', () => proxySocket.destroy());
        });

        proxyReq.on('response', (proxyRes: http.IncomingMessage) => {
            // Backend rejected the upgrade - forward the error
            const statusCode = proxyRes.statusCode || 502;
            const statusMessage = proxyRes.statusMessage || 'Bad Gateway';
            socket.write(`HTTP/1.1 ${statusCode} ${statusMessage}\r\n\r\n`);
            socket.destroy();
        });

        proxyReq.on('error', () => {
            socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
            socket.destroy();
        });

        proxyReq.end();
    });
}
