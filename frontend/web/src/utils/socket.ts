// Lightweight WebSocket manager implementing on-demand connection with a short keepalive window,
// heartbeat and simple reconnection/backoff. Frontend-only; backend unchanged.

type MessageHandler = (msg: any) => void;

class SocketManager {
    private ws: WebSocket | null = null;
    private url: string | null = null;
    private subscribers = new Set<MessageHandler>();
    private connectPromise: Promise<void> | null = null;
    private idleTimer: number | null = null;
    private reconnectDelay = 1000; // start 1s
    private readonly MAX_RECONNECT = 30000; // max 30s
    private readonly IDLE_CLOSE_MS = 60_000; // keepalive when idle: 60s
    private readonly HEARTBEAT_MS = 30_000; // heartbeat interval
    private heartbeatTimer: number | null = null;
    private readonly CONNECT_TIMEOUT_MS = 10000; // how long connect() waits before timing out (ms)

    // Connect (on-demand). App should call connect(wsUrl) before sending.
    connect(url: string, connectTimeoutMs = this.CONNECT_TIMEOUT_MS) {
        // If already connected/connecting to same url, reuse
        if (this.ws && this.url === url && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return Promise.resolve();
        }

        // If there is an ongoing connect attempt for same url, return it
        if (this.connectPromise && this.url === url) return this.connectPromise;

        this.url = url;
        const wsEndpoint = url.endsWith('/ws') ? url : `${url.replace(/\/+$/, '')}/ws`;

        this.connectPromise = new Promise<void>((resolve, reject) => {
            let settled = false;
            let timeoutId: number | null = null;

            const attempt = () => {
                if (!this.url) {
                    if (!settled) {
                        settled = true;
                        reject(new Error('connect aborted'));
                    }
                    return;
                }

                try {
                    this.ws = new WebSocket(wsEndpoint);
                } catch (err) {
                    // failed to construct WebSocket (rare); schedule retry
                    scheduleRetry();
                    if (!settled) {
                        settled = true;
                        reject(err as any);
                    }
                    return;
                }

                // reject if not opened fast enough
                timeoutId = window.setTimeout(() => {
                    if (!settled) {
                        settled = true;
                        try { this.ws?.close(); } catch (_) {}
                        reject(new Error('connect timeout'));
                    }
                }, connectTimeoutMs);

                this.ws.onopen = () => {
                    if (timeoutId) { window.clearTimeout(timeoutId); timeoutId = null; }
                    settled = true;
                    this.reconnectDelay = 1000; // reset backoff
                    this.startHeartbeat();
                    resolve();
                };

                this.ws.onmessage = (ev) => {
                    let data: any = ev.data;
                    try { data = JSON.parse(ev.data); } catch (_) { /* keep raw */ }
                    this.subscribers.forEach(s => s(data));
                    this.touchIdleTimer();
                };

                this.ws.onclose = (ev) => {
                    if (timeoutId) { window.clearTimeout(timeoutId); timeoutId = null; }
                    this.stopHeartbeat();
                    this.subscribers.forEach(s => s({__socket_closed: true, code: ev.code, reason: ev.reason}));

                    // if connection wasn't established yet, reject the connect promise
                    if (!settled) {
                        settled = true;
                        reject(new Error('socket closed before open'));
                    }

                    // schedule reconnect attempts while url is desired
                    if (this.url) {
                        setTimeout(() => {
                            if (this.url) this.connect(this.url).catch(() => {});
                        }, this.reconnectDelay + this.jitter());
                        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.MAX_RECONNECT);
                    }
                };

                this.ws.onerror = (ev) => {
                    this.subscribers.forEach(s => s({__socket_error: true, detail: ev}));
                    if (!settled) {
                        settled = true;
                        if (timeoutId) { window.clearTimeout(timeoutId); timeoutId = null; }
                        reject(new Error('socket error'));
                    }
                };
            };

            const scheduleRetry = () => {
                setTimeout(() => {
                    if (this.url) attempt();
                }, this.reconnectDelay + this.jitter());
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.MAX_RECONNECT);
            };

            // start first attempt
            attempt();
        });

        return this.connectPromise.finally(() => { this.connectPromise = null; });
    }

    // small jitter to avoid thundering herd
    private jitter() { return Math.floor(Math.random() * 500); }

    send(obj: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return Promise.reject(new Error('Socket not open'));
        const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
        this.ws.send(payload);
        this.touchIdleTimer();
        return Promise.resolve();
    }

    // High-level helper to request a run for a project/file
    async runFile(projectName: string, path: string) {
        if (!this.url) return Promise.reject(new Error('No ws url provided'));
        await this.connect(this.url);
        const msg = {type: 'run_file', projectName, path, ts: Date.now()};
        return this.send(msg);
    }

    async runAllFiles(projectName: string) {
        if (!this.url) return Promise.reject(new Error('No ws url provided'));
        await this.connect(this.url);
        const msg = {type: 'run_all_files', projectName, ts: Date.now()};
        return this.send(msg);
    }

    subscribe(handler: MessageHandler) {
        this.subscribers.add(handler);
        return () => this.subscribers.delete(handler);
    }

    // touch idle timer: schedule a close in IDLE_CLOSE_MS after last activity
    private touchIdleTimer() {
        if (this.idleTimer) window.clearTimeout(this.idleTimer);
        this.idleTimer = window.setTimeout(() => this.close(), this.IDLE_CLOSE_MS);
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = window.setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                try { this.ws.send(JSON.stringify({type: 'ping', ts: Date.now()})); }
                catch (_) { /* ignore */ }
            }
        }, this.HEARTBEAT_MS);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) { window.clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
    }

    // Close the socket immediately and cancel timers
    close() {
        this.stopHeartbeat();
        if (this.idleTimer) { window.clearTimeout(this.idleTimer); this.idleTimer = null; }
        if (this.ws) {
            try { this.ws.close(); } catch (_) { }
            this.ws = null;
        }
        // clear desired url (so reconnect won't auto happen)
        this.url = null;
    }
}

const Singleton = new SocketManager();
export default Singleton;

