import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { EnvironmentPattern } from '@models/simulation.model';
import { SimulationService } from '@services/simulation/simulation.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-environment-simulator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './environment-simulator.component.html',
  styleUrls: ['./environment-simulator.component.less']
})
export class EnvironmentSimulatorComponent implements OnInit {

  patterns = [
    { value: EnvironmentPattern.STEADY, viewValue: 'Steady Baseline' },
    { value: EnvironmentPattern.PH_CRASH, viewValue: 'Lactic Acid Surge (pH Crash)' },
    { value: EnvironmentPattern.TEMP_SPIKE, viewValue: 'Runaway Exothermic (Temp Spike)' },
    { value: EnvironmentPattern.STALLED, viewValue: 'Stalled Fermentation (Low Temp)' }
  ];

  selectedPattern: EnvironmentPattern = EnvironmentPattern.STEADY;

  constructor(
    private simulationService: SimulationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

  applyPattern(): void {
    this.simulationService.setEnvironmentPattern(this.selectedPattern).subscribe({
      next: () => {
        this.notificationService.notify('Simulation pattern updated successfully.', 'success');
      },
      error: () => {
        this.notificationService.notify('Failed to update simulation pattern.', 'error');
      }
    });
  }
}
