import { Component, OnInit } from '@angular/core';
import { AlertHistoryService, AlertEntry } from '../../services/alert-history.service';

import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-alert-inbox',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule,
    PipesModule
  ],
  templateUrl: './alert-inbox.component.html',
  styleUrls: ['./alert-inbox.component.less']
})
export class AlertInboxComponent implements OnInit {

  readonly history = this.alertHistory.history;

  constructor(private alertHistory: AlertHistoryService) { }

  ngOnInit(): void {
  }

  clearHistory(): void {
    this.alertHistory.clearHistory();
  }

}
