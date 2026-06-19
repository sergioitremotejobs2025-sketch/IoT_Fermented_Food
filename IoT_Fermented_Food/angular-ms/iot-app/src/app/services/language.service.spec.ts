import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to "es" (current app standard)', () => {
    expect(service.getCurrentLang()).toBe('es');
  });

  it('should change language and persist it', () => {
    service.setLanguage('en');
    expect(service.getCurrentLang()).toBe('en');
    expect(localStorage.getItem('preferred_lang')).toBe('en');
  });

  it('should translate a known key', () => {
    expect(service.translate('NAVBAR.TITLE')).toBe('IoT_Microservices');
    service.setLanguage('en');
    // For now, let's assume english translation is the same or different.
    // Let's test a key that definitely changes.
    expect(service.translate('DASHBOARD.EMPTY_STATE')).toBe('No tienes microcontroladores registrados');
    service.setLanguage('en');
    expect(service.translate('DASHBOARD.EMPTY_STATE')).toBe('You have no registered microcontrollers');
  });
});
