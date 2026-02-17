class SessionService {
    private lastAuthTime: number | null = null;
    private readonly AUTH_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

    public authenticate() {
        this.lastAuthTime = Date.now();
    }

    public isAuthenticated(): boolean {
        if (!this.lastAuthTime) return false;
        
        const now = Date.now();
        const diff = now - this.lastAuthTime;
        
        return diff < this.AUTH_WINDOW_MS;
    }

    public getRemainingTime(): number {
        if (!this.lastAuthTime) return 0;
        const now = Date.now();
        const diff = now - this.lastAuthTime;
        return Math.max(0, this.AUTH_WINDOW_MS - diff);
    }
}

export const sessionService = new SessionService();
