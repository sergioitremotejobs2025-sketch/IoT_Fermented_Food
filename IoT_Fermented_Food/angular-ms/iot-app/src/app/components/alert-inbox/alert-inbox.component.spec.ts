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

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { vi } from 'vitest';

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn(),
    setQuality: vi.fn()
  }
}));

import { AlertInboxComponent } from './alert-inbox.component';
import { AlertHistoryService, AlertEntry } from '../../services/alert-history.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';

import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('AlertInboxComponent', () => {
    let component: AlertInboxComponent;
    let fixture: ComponentFixture<AlertInboxComponent>;
    let alertHistorySpy: any;

    const mockHistory: AlertEntry[] = [
        { message: 'Alert 1', type: 'warning', timestamp: new Date() },
        { message: 'Alert 2', type: 'error', timestamp: new Date() }
    ];

    beforeEach(async () => {
        alertHistorySpy = {
            history: signal(mockHistory),
            clearHistory: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [AlertInboxComponent],
            providers: [
                { provide: AlertHistoryService, useValue: alertHistorySpy },
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideLottieOptions({ player: () => player })
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AlertInboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have access to history from service', () => {
        expect(component.history().length).toBe(2);
        expect(component.history()[0].message).toBe('Alert 1');
    });

    it('should call clearHistory on service when clear is clicked', () => {
        component.clearHistory();
        expect(alertHistorySpy.clearHistory).toHaveBeenCalled();
    });
});
