import { ComponentFixture, TestBed } from '@angular/core/testing';
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

import { DashboardMicrocontrollerComponent } from './dashboard-microcontroller.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('DashboardMicrocontrollerComponent', () => {
  let component: DashboardMicrocontrollerComponent;
  let fixture: ComponentFixture<DashboardMicrocontrollerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMicrocontrollerComponent, RouterTestingModule, MatMenuModule, MatIconModule],
      providers: [provideNoopAnimations()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardMicrocontrollerComponent);
    component = fixture.componentInstance;
    component.micro = {
      ip: '192.168.1.1',
      measure: 'temperature',
      sensor: 'DHT11',
      username: 'alice',
      isInactive: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display sensor and measure', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.sensor-name').textContent).toContain('DHT11');
    expect(compiled.querySelector('.measure-label').textContent).toContain('Temperatura');
  });
});
