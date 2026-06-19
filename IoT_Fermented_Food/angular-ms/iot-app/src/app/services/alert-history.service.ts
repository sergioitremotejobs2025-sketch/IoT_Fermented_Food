import { Injectable, signal, WritableSignal, computed } from '@angular/core';

export interface AlertEntry {
    message: string;
    type: 'success' | 'warning' | 'error';
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class AlertHistoryService {
    private readonly STORAGE_KEY = 'alert_history';
    private readonly MAX_ALERTS = 50;

    private readonly _history = signal<AlertEntry[]>([]);
    readonly history = computed(() => this._history());

    constructor() {
        this.loadHistory();
    }

    addAlert(alert: AlertEntry): void {
        this._history.update(h => {
            const newHistory = [alert, ...h];
            return newHistory.slice(0, this.MAX_ALERTS);
        });
        this.saveHistory();
    }

    clearHistory(): void {
        this._history.set([]);
        this.saveHistory();
    }

    private loadHistory(): void {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this._history.set(JSON.parse(saved));
            } catch (e) {
                this._history.set([]);
            }
        }
    }

    private saveHistory(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._history()));
    }
}
