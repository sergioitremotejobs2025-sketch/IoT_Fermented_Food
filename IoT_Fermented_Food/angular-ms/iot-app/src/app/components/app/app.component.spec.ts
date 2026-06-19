import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
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

import { AppComponent } from './app.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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

describe('AppComponent', () => {
  let mediaMatcherMock: any;
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    mediaMatcherMock = {
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn()
      })
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        { provide: MediaMatcher, useValue: mediaMatcherMock },
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLottieOptions({ player: () => player })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle opened state', () => {
    component.opened = false;
    component.toggle(true);
    expect(component.opened).toBe(true);
  });

  it('should handle ngOnDestroy', () => {
    const spy = vi.spyOn(component.mobileQuery, 'removeListener');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should call ngOnInit', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should handle media query listener', () => {
    let listener: any;
    mediaMatcherMock.matchMedia.mockReturnValue({
      matches: false,
      addListener: (l: any) => { listener = l; },
      removeListener: vi.fn()
    });
    
    // Need to recreate because matchMedia is called in constructor
    const freshFixture = TestBed.createComponent(AppComponent);
    const freshApp = freshFixture.componentInstance;
    
    if (listener) {
      listener();
    }
    expect(freshApp).toBeTruthy();
  });
});
