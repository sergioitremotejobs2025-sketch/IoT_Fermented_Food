import { Component, OnInit, signal, computed } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop';

import { ArduinoService } from '@services/arduino.service'
import { AuthService } from '@services/auth.service'
import { Microcontroller } from '@models/microcontroller.model';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-microcontrollers-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterModule
  ],
  styleUrls: ['./microcontrollers-edit.component.less'],
  templateUrl: './microcontrollers-edit.component.html'
})
export class MicrocontrollersEditComponent implements OnInit {

  ipForm: FormGroup
  isEdit = signal(true);
  lastForm: FormGroup
  measureForm: FormGroup
  sensorForm: FormGroup
  thresholdForm: FormGroup
  
  measures = [
    { name: 'humidity', view: 'Humedad' },
    { name: 'light', view: 'Bombilla inteligente' },
    { name: 'temperature', view: 'Temperatura' },
    { name: 'pictures', view: 'Cámara de planta' }
  ]
  
  sensors: Record<string, string[]> = {
    humidity: ['Grove - Moisture', 'Fake Grove - Moisture'],
    light: ['Smart LED', 'Fake Smart LED'],
    temperature: ['Grove - Temperature', 'Fake Grove - Temperature'],
    pictures: ['Tomato Plant Camera']
  }

  // Reactive available sensors based on form value
  // Note: We use a signal to track the form change if we want it truly interactive via computed
  // But for now, we'll keep it simple or use a signal updated by form changes
  selectedMeasure = signal('humidity');
  availableSensors = computed(() => {
    return this.sensors[this.selectedMeasure()] || [];
  });

  constructor(
    private arduinoService: ArduinoService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.ipForm = new FormGroup({ ip: new FormControl('', [Validators.required]) })
    this.lastForm = new FormGroup({})
    this.measureForm = new FormGroup({ measure: new FormControl('', [Validators.required]) })
    this.sensorForm = new FormGroup({ sensor: new FormControl('', [Validators.required]) })
    this.thresholdForm = new FormGroup({
      thresholdMin: new FormControl(''),
      thresholdMax: new FormControl('')
    })

    // Bridge form to signal
    this.measureForm.get('measure')?.valueChanges.subscribe(v => {
        if (v) this.selectedMeasure.set(v);
    });
  }

  async ngOnInit() {
    const ip = this.route.snapshot.paramMap.get('ip')
    const measure = this.route.snapshot.paramMap.get('measure')

    this.isEdit.set(!!(ip && measure));

    if (this.isEdit()) {
      try {
        const micro = await this.arduinoService.getMicrocontroller(ip!, measure!)
        this.ipForm.setValue({ ip: micro.ip })

        const matchingMeasures = this.measures.filter(m => m.name === micro.measure)
        if (matchingMeasures.length > 0) {
            this.measureForm.setValue({ measure: matchingMeasures[0].name })
            this.selectedMeasure.set(matchingMeasures[0].name);
        }
        
        this.sensorForm.setValue({ sensor: micro.sensor })

        if (micro.thresholdMin !== undefined) this.thresholdForm.patchValue({ thresholdMin: micro.thresholdMin })
        if (micro.thresholdMax !== undefined) this.thresholdForm.patchValue({ thresholdMax: micro.thresholdMax })

        this.measureForm.disable()
        this.sensorForm.disable()
      } catch (error) {}
    }
  }

  submitMicrocontroller(measure: string, ip: string, sensor: string) {
    const microcontroller: Microcontroller = {
      ip,
      measure,
      sensor,
      username: this.authService.getUser(),
      thresholdMin: this.thresholdForm.value.thresholdMin !== '' ? Number(this.thresholdForm.value.thresholdMin) : undefined,
      thresholdMax: this.thresholdForm.value.thresholdMax !== '' ? Number(this.thresholdForm.value.thresholdMax) : undefined
    }

    if (this.isEdit()) {
      microcontroller['old_ip'] = this.route.snapshot.paramMap.get('ip')
      this.arduinoService.putMicrocontroller(microcontroller)
        .subscribe(() => {
          this.arduinoService.clearMicrocontrollers()
          this.router.navigate(['/my-microcontrollers'])
        })
    } else {
      this.arduinoService.postMicrocontroller(microcontroller)
        .subscribe(() => {
          this.arduinoService.clearMicrocontrollers()
          this.router.navigate(['/my-microcontrollers'])
        })
    }
  }

  resetSensors() {
    this.sensorForm.reset()
    this.sensorForm.markAsPending()
    this.lastForm.reset()
    this.lastForm.markAsPending()
  }

}
