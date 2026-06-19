import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        // Clear localStorage to ensure initial theme logic runs
        localStorage.clear();
        // Default mock for matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jasmine.createSpy('matchMedia').and.returnValue({
                matches: false,
                addListener: () => { },
                removeListener: () => { }
            }),
        });

        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should toggle theme from light to dark', () => {
        // Force set to light
        service.setTheme('light');
        service.toggleTheme();
        service.theme$.subscribe(theme => expect(theme).toBe('dark'));
    });

    it('should toggle theme from dark to light', () => {
        service.setTheme('dark');
        service.toggleTheme();
        service.theme$.subscribe(theme => expect(theme).toBe('light'));
    });

    it('should save theme to localStorage', () => {
        service.setTheme('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should apply theme as data-theme attribute', () => {
        service.setTheme('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should initialize with dark theme if media query matches and no localStorage', () => {
        localStorage.clear();
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jasmine.createSpy('matchMedia').and.returnValue({
                matches: true, // prefer dark
                addListener: () => { },
                removeListener: () => { }
            }),
        });

        // Re-inject service to run constructor with new matchMedia
        const darkService = new ThemeService();
        darkService.theme$.subscribe(theme => expect(theme).toBe('dark'));
    });

    it('should initialize with saved theme from localStorage', () => {
        localStorage.setItem('theme', 'dark');
        const savedService = new ThemeService();
        savedService.theme$.subscribe(theme => expect(theme).toBe('dark'));
        localStorage.clear();
    });
});
