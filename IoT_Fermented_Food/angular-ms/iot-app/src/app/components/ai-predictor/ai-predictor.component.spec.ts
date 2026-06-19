import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import '@analogjs/vitest-angular/setup-zone';

try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {}

import { AiPredictorComponent } from './ai-predictor.component';
import { AiService } from 'src/app/services/ai.service';
import { NotificationService } from 'src/app/services/notification.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AiPredictorComponent', () => {
  let component: AiPredictorComponent;
  let fixture: ComponentFixture<AiPredictorComponent>;
  let mockAiService: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockAiService = {
      evaluate: vi.fn(),
      trainModel: vi.fn(),
      predict: vi.fn()
    };
    mockNotificationService = {
      notify: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AiPredictorComponent, FormsModule],
      providers: [
        { provide: AiService, useValue: mockAiService },
        { provide: NotificationService, useValue: mockNotificationService },
        provideNoopAnimations()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AiPredictorComponent);
    component = fixture.componentInstance;
    
    // Set initial inputs
    fixture.componentRef.setInput('ip', '127.0.0.1');
    fixture.componentRef.setInput('measure', 'temperature');
    fixture.componentRef.setInput('recentValues', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch performance on init and handle success using signals', async () => {
    const perfData = { mae: 0.5, sample_count: 100 };
    mockAiService.evaluate.mockReturnValue(of(perfData));

    fixture.detectChanges(); // calls ngOnInit
    await fixture.whenStable();

    expect(mockAiService.evaluate).toHaveBeenCalledWith('127.0.0.1', 'temperature');
    // RED PHASE: Expect performance to be a signal
    expect(component.performance()).toEqual(perfData);
  });

  it('should generate a suggestion as a computed signal', () => {
    // RED PHASE: Expect suggestion to be a computed signal
    fixture.componentRef.setInput('measure', 'temperature');
    component.prediction.set(35);
    
    expect(component.suggestion()).toContain('ventilación');
  });

  it('should calculate confidenceScore as a computed signal', () => {
    // RED PHASE: Expect confidenceScore to be a computed signal
    component.performance.set({ mae: 0.1, sample_count: 100 });
    expect(component.confidenceScore()).toBeGreaterThan(90);
  });
});
