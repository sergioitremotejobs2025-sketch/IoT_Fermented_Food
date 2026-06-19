import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenterComponent } from './notification-center.component';
import { NotificationService } from '@services/notification.service';
import { AlertHistoryService } from '@services/alert-history.service';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let notificationServiceMock: any;
  let alertHistoryMock: any;

  beforeEach(async () => {
    const mockHistory = [
      { id: '1', message: 'Test 1', type: 'success', timestamp: new Date() },
      { id: '2', message: 'Test 2', type: 'error', timestamp: new Date() }
    ];

    notificationServiceMock = {
      activeNotifications: signal([]),
      dismiss: jasmine.createSpy('dismiss')
    };

    alertHistoryMock = {
      history: signal(mockHistory),
      clearHistory: jasmine.createSpy('clearHistory')
    };

    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: AlertHistoryService, useValue: alertHistoryMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list of historical notifications', () => {
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.notification-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Test 1');
    expect(items[1].textContent).toContain('Test 2');
  });

  it('should call clearHistory when clear button is clicked', () => {
    component.clearHistory();
    expect(alertHistoryMock.clearHistory).toHaveBeenCalled();
  });
});
