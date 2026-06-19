import { Component, OnInit } from '@angular/core'

import { ArduinoService } from '@services/arduino.service'

import { Microcontroller } from '@models/microcontroller.model'

import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-microcontrollers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    PipesModule
  ],
  styleUrls: [ './microcontrollers.component.less' ],
  templateUrl: './microcontrollers.component.html'
})
export class MicrocontrollersComponent implements OnInit {

  displayedColumns = [ 'measure', 'sensor', 'ip', 'actions' ]
  microcontrollers: Microcontroller[] = []

  constructor(
    private arduinoService: ArduinoService
  ) { }

  ngOnInit() {
    this.arduinoService.getMicrocontrollers()
      .subscribe(microcontrollers => this.microcontrollers = microcontrollers)
  }

  deleteMicrocontroller(micro: Microcontroller) {
    this.arduinoService.deleteMicrocontroller(micro)
      .subscribe(() => {
        this.arduinoService.clearMicrocontrollers()
        this.ngOnInit()
      })
  }

}
