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

import { NavbarComponent } from './navbar.component';
import { ThemeService } from '@services/theme.service';
import { LanguageService } from '@services/language.service';
import { ArduinoService } from '@services/arduino.service';
import { AuthService } from '@services/auth.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn(),
    setQuality: vi.fn()
  }
}));

// Global mock for matchMedia (needed by ThemeService)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let themeService: any;
  let languageService: any;

  beforeEach(async () => {
    themeService = {
      theme$: of('light'),
      toggleTheme: vi.fn(),
      getInitialTheme: vi.fn().mockReturnValue('light')
    };
    languageService = {
      lang$: of('es'),
      getCurrentLang: vi.fn().mockReturnValue('es'),
      setLanguage: vi.fn(),
      translate: vi.fn().mockImplementation(key => key)
    };
    const arduinoServiceMock = {
      getMicrocontrollers: vi.fn().mockReturnValue(of([]))
    };
    const authServiceMock = {
        isLoggedIn: vi.fn().mockReturnValue(of(false))
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [
        { provide: ThemeService, useValue: themeService },
        { provide: LanguageService, useValue: languageService },
        { provide: ArduinoService, useValue: arduinoServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLottieOptions({ player: () => player })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle and emit', () => {
    const emitSpy = vi.spyOn(component.opened, 'emit');
    component.toggle();
    expect(component.isOpen).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(true);

    component.toggle();
    expect(component.isOpen).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should toggle theme', () => {
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should toggle language', () => {
    component.toggleLanguage();
    expect(languageService.setLanguage).toHaveBeenCalledWith('en');
  });
});
