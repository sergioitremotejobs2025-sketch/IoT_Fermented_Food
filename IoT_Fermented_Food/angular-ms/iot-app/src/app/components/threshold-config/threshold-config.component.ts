import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThresholdService, Threshold } from '@services/threshold.service';

@Component({
  selector: 'app-threshold-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './threshold-config.component.html',
  styleUrls: ['./threshold-config.component.less']
})
export class ThresholdConfigComponent implements OnInit {
  @Input() threshold!: Threshold;
  
  thresholdForm!: FormGroup;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private thresholdService: ThresholdService
  ) {}

  ngOnInit(): void {
    this.thresholdForm = this.fb.group({
      min: [this.threshold?.min || 0, [Validators.required]],
      max: [this.threshold?.max || 100, [Validators.required]]
    }, { validators: this.minMaxValidator });
  }

  private minMaxValidator(control: AbstractControl): ValidationErrors | null {
    const min = control.get('min')?.value;
    const max = control.get('max')?.value;
    return min !== null && max !== null && min >= max ? { minGreaterThanMax: true } : null;
  }

  onSubmit(): void {
    if (this.thresholdForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: Threshold = {
      ...this.threshold,
      min: this.thresholdForm.value.min,
      max: this.thresholdForm.value.max
    };

    this.thresholdService.updateThreshold(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Umbrales actualizados correctamente.';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Error al actualizar los umbrales. Verifique los datos.';
      }
    });
  }
}
