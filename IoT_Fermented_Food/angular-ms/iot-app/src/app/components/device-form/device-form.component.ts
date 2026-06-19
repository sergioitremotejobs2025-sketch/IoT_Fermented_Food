import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ArduinoService } from '@services/arduino.service';
import { Microcontroller } from '@models/microcontroller.model';

@Component({
  selector: 'app-device-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './device-form.component.html',
  styleUrls: ['./device-form.component.less']
})
export class DeviceFormComponent implements OnInit {
  @Input() device?: Microcontroller;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deviceForm!: FormGroup;
  isEditMode = false;
  isSaving = false;
  errorMessage: string | null = null;

  measures = ['temperature', 'humidity', 'light', 'pictures'];
  
  // Simple IP Regex
  ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  constructor(
    private fb: FormBuilder,
    private arduinoService: ArduinoService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.device;
    this.initForm();
  }

  private initForm(): void {
    this.deviceForm = this.fb.group({
      ip: [this.device?.ip || '', [Validators.required, Validators.pattern(this.ipPattern)]],
      measure: [this.device?.measure || '', [Validators.required]],
      sensor: [this.device?.sensor || '', [Validators.required]],
      description: [this.device?.description || '']
    });

    if (this.isEditMode) {
      this.deviceForm.get('ip')?.disable(); // IP usually shouldn't change in edit mode for this app
      this.deviceForm.get('measure')?.disable();
    }
  }

  onSubmit(): void {
    if (this.deviceForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = null;

    const deviceData: Microcontroller = {
      ...this.device,
      ...this.deviceForm.getRawValue()
    };

    const request = this.isEditMode 
      ? this.arduinoService.putMicrocontroller(deviceData)
      : this.arduinoService.postMicrocontroller(deviceData);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving = false;
        if (err.status === 409) {
          this.errorMessage = 'Este dispositivo (IP y Medida) ya existe en el sistema.';
        } else {
          this.errorMessage = 'Ocurrió un error al guardar el dispositivo. Por favor, intente de nuevo.';
        }
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
