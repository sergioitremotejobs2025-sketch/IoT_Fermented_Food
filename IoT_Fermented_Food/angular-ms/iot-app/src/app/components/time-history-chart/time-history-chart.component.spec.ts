import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimeHistoryChartComponent } from './time-history-chart.component';
import { MeasureService } from '@services/measure.service';
import { DataExportService } from '@services/data-export.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TimeHistoryChartComponent', () => {
  let component: TimeHistoryChartComponent;
  let fixture: ComponentFixture<TimeHistoryChartComponent>;
  let measureServiceMock: any;
  let exportServiceMock: any;

  beforeEach(async () => {
    measureServiceMock = {
      getHistory: jasmine.createSpy('getHistory').and.returnValue(of([]))
    };
    exportServiceMock = {
      exportToCsv: jasmine.createSpy('exportToCsv')
    };

    await TestBed.configureTestingModule({
      imports: [TimeHistoryChartComponent],
      providers: [
        { provide: MeasureService, useValue: measureServiceMock },
        { provide: DataExportService, useValue: exportServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeHistoryChartComponent);
    component = fixture.componentInstance;
    component.micro = { ip: '192.168.1.36', measure: 'temperature' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getHistory on init with default range (24h)', () => {
    expect(measureServiceMock.getHistory).toHaveBeenCalledWith('192.168.1.36', 'temperature', '24h');
  });

  it('should call getHistory when range is changed', () => {
    component.onRangeChange('7d');
    expect(measureServiceMock.getHistory).toHaveBeenCalledWith('192.168.1.36', 'temperature', '7d');
  });

  it('should update chartData and rawHistory when getHistory returns data', () => {
    const mockHistory = [
      { date: '2026-04-20T10:00:00Z', value: 25 },
      { date: '2026-04-20T11:00:00Z', value: 26 }
    ];
    measureServiceMock.getHistory.and.returnValue(of(mockHistory));
    
    component.onRangeChange('24h');
    
    expect(component.chartData.datasets[0].data).toEqual([25, 26]);
    expect(component.chartData.labels?.length).toBe(2);
    expect(component.rawHistory).toEqual(mockHistory as any);
  });

  it('should call exportToCsv when exportData is triggered', fakeAsync(() => {
    const mockHistory = [{ date: '2026-04-20T10:00:00Z', value: 25 }];
    component.rawHistory = mockHistory as any;
    
    component.exportData();
    expect(component.isExporting).toBeTrue();
    
    tick(500);
    
    expect(exportServiceMock.exportToCsv).toHaveBeenCalledWith(
      mockHistory, 
      jasmine.stringMatching(/temperature_history_192.168.1.36_24h.csv/)
    );
    expect(component.isExporting).toBeFalse();
  }));

  it('should not call exportToCsv if rawHistory is empty', () => {
    component.rawHistory = [];
    component.exportData();
    expect(exportServiceMock.exportToCsv).not.toHaveBeenCalled();
  });
});
