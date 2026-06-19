import '@analogjs/vitest-angular/setup-zone';
import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {}

import { PicturesHistoryComponent } from './pictures-history.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArduinoService } from '@services/arduino.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('PicturesHistoryComponent', () => {
  let component: PicturesHistoryComponent;
  let fixture: ComponentFixture<PicturesHistoryComponent>;
  let arduinoServiceMock: any;
  let routeMock: any;

  beforeEach(async () => {
    arduinoServiceMock = {
      getMicrocontroller: vi.fn(),
      getPicturesHistory: vi.fn()
    };
    routeMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1.2.3.4')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PicturesHistoryComponent, ReactiveFormsModule],
      providers: [
        { provide: ArduinoService, useValue: arduinoServiceMock },
        { provide: ActivatedRoute, useValue: routeMock },
        provideNoopAnimations()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PicturesHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create and load microcontroller', async () => {
    arduinoServiceMock.getMicrocontroller.mockResolvedValue({ ip: '1.2.3.4', measure: 'pictures' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.micro().ip).toBe('1.2.3.4');
  });

  it('should load history and filter pictures using signals', async () => {
    component.micro.set({ ip: '1.2.3.4' } as any);
    const mockData = [
      { timestamp: 1, url: 'url1', stage: 'seedling' },
      { timestamp: 2, url: 'url2', stage: 'young_plant' }
    ];
    arduinoServiceMock.getPicturesHistory.mockReturnValue(of(mockData));

    component.loadHistory(component.historyForm.value);
    
    expect(component.isLoading()).toBe(false);
    expect(component.pictures().length).toBe(2);

    component.currentStageFilter.set('seedling');
    expect(component.filteredPictures().length).toBe(1);
  });

  it('should handle timelapse using signals', async () => {
    const pictures = [{ timestamp: 1, url: 'url1' }, { timestamp: 2, url: 'url2' }] as any;
    component.pictures.set(pictures);
    component.currentStageFilter.set('all');

    component.toggleTimelapse();
    expect(component.isTimelapsePlaying()).toBe(true);
    expect(component.timelapseIndex()).toBe(0);

    // Wait for speed
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(component.timelapseIndex()).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 600));
    expect(component.timelapseIndex()).toBe(0);

    component.toggleTimelapse();
    expect(component.isTimelapsePlaying()).toBe(false);
  });
});
