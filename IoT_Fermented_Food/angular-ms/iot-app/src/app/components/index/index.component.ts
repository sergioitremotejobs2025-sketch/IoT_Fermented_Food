import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    PipesModule
  ],
  styleUrls: [ './index.component.less' ],
  templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {

  showBtn1 = false
  showBtn2 = false
  showBtn3 = false

  constructor() { }

  ngOnInit() { }

}
