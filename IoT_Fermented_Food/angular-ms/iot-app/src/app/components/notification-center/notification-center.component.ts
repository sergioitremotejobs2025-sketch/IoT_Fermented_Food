import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationService } from '@services/notification.service';
import { AlertHistoryService } from '@services/alert-history.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.less']
})
export class NotificationCenterComponent implements OnInit {
  
  constructor(
    public notificationService: NotificationService,
    public alertHistory: AlertHistoryService
  ) {}

  ngOnInit(): void {}

  clearHistory(): void {
    this.alertHistory.clearHistory();
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }
}
