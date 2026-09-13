let onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: () => void) {
    onSessionExpired = handler;
}

export function notifySessionExpired() {
    onSessionExpired?.();
}
