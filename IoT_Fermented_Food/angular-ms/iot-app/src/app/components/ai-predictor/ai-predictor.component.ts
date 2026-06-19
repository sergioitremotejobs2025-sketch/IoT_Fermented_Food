import { Component, OnInit, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatModule } from 'src/app/modules/mat.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { AiService, PerformanceResult } from 'src/app/services/ai.service';
import { NotificationService } from 'src/app/services/notification.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ai-predictor',
  standalone: true,
  imports: [
    CommonModule,
    MatModule,
    MatTooltipModule,
    FormsModule,
    MatProgressBarModule
  ],
  templateUrl: './ai-predictor.component.html',
  styleUrls: ['./ai-predictor.component.less']
})
export class AiPredictorComponent implements OnInit {
  ip = input.required<string>();
  measure = input.required<string>();
  recentValues = input<number[]>([]);

  performance = signal<PerformanceResult | null>(null);
  prediction = signal<number | null>(null);
  training = signal(false);
  loading = signal(false);

  limits = [
    { label: 'Última hora', value: 100 },
    { label: 'Últimas 6 horas', value: 600 },
    { label: 'Último día', value: 2400 }
  ];
  trainingLimit = signal(600);

  confidenceScore = computed(() => {
    const perf = this.performance();
    if (!perf) return 0;
    // Simple confidence mapping: 100 - (MAE * 100) / avgValue (mocked logic)
    // For this app, let's assume MAE < 0.2 is 95%+, MAE > 1 is < 70%
    const score = 100 - (perf.mae * 10);
    return Math.max(0, Math.min(100, score));
  });

  suggestion = computed(() => {
    const pred = this.prediction();
    const m = this.measure();
    if (pred === null) return null;

    if (m === 'temperature') {
      if (pred > 30) return 'La temperatura subirá. Considera activar ventilación.';
      if (pred < 15) return 'Se espera frío. Asegura el cierre de invernadero.';
    }
    if (m === 'humidity') {
      if (pred < 40) return 'La humedad bajará. Programando riego preventivo.';
    }
    return 'Condiciones estables previstas.';
  });

  constructor(
    private aiService: AiService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit() {
    await this.fetchPerformance();
  }

  async fetchPerformance() {
    try {
      const data = await firstValueFrom(this.aiService.evaluate(this.ip(), this.measure()));
      this.performance.set(data);
    } catch (err) {
      this.performance.set(null);
    }
  }

  async train() {
    if (this.recentValues().length < 10) {
      this.notificationService.notify('Necesitas al menos 10 lecturas para entrenar', 'warning');
      return;
    }

    this.training.set(true);
    try {
      await firstValueFrom(this.aiService.trainModel(this.ip(), this.measure(), 1000));
      this.notificationService.notify('Modelo entrenado con éxito');
      await this.fetchPerformance();
    } catch (err) {
      this.notificationService.notify('Error al entrenar el modelo', 'error');
    } finally {
      this.training.set(false);
    }
  }

  async predict() {
    if (this.recentValues().length < 10) {
      this.notificationService.notify('Necesitas al menos 10 lecturas recientes', 'warning');
      return;
    }

    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.aiService.predict(this.ip(), this.measure(), this.recentValues()));
      this.prediction.set(data.prediction);
    } catch (err) {
      this.notificationService.notify('Modelo no encontrado. ¡Entrénalo primero!', 'error');
      this.prediction.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
