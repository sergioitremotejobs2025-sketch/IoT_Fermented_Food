import { Component, Input, OnInit } from '@angular/core'

import { Microcontroller } from '@models/microcontroller.model'

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-dashboard-microcontroller',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    PipesModule
  ],
  styleUrls: [ './dashboard-microcontroller.component.less' ],
  templateUrl: './dashboard-microcontroller.component.html'
})
export class DashboardMicrocontrollerComponent implements OnInit {

  @Input() isHistory: boolean = false
  @Input() micro: Microcontroller

  constructor() { }

  ngOnInit() { }

}
