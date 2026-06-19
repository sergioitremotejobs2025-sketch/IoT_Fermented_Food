import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertHistoryService, AlertEntry } from './alert-history.service';

export interface AppNotification extends AlertEntry {
    id: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly _activeNotifications = signal<AppNotification[]>([]);
    readonly activeNotifications = this._activeNotifications.asReadonly();

    constructor(
        private snackBar: MatSnackBar,
        private alertHistory: AlertHistoryService
    ) { }

    notify(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
        const id = Math.random().toString(36).substring(2, 9);
        const notification: AppNotification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        // Add to active notifications (toasts)
        this._activeNotifications.update(n => [...n, notification]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            this.dismiss(id);
        }, 5000);

        this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: [`snackbar-${type}`]
        });

        // Add to persistent history
        this.alertHistory.addAlert(notification);
    }

    dismiss(id: string): void {
        this._activeNotifications.update(n => n.filter(item => item.id !== id));
    }

    getHistory(): AlertEntry[] {
        return this.alertHistory.history();
    }

    notifyAlert(measure: string, value: number, unit: string, threshold: number, isAbove: boolean): void {
        const direction = isAbove ? 'superior' : 'inferior';
        this.notify(
            `ALERTA: ${measure} (${value}${unit}) es ${direction} al umbral de ${threshold}${unit}`,
            'warning'
        );
    }
}
