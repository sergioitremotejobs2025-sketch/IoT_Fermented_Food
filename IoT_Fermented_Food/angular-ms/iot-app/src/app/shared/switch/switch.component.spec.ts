import { ComponentFixture, TestBed } from '@angular/core/testing'
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

import { SwitchComponent } from './switch.component'
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle'
import { By } from '@angular/platform-browser'
import { signal, provideExperimentalZonelessChangeDetection } from '@angular/core'
import { vi } from 'vitest'
import { provideNoopAnimations } from '@angular/platform-browser/animations'

describe('SwitchComponent', () => {
  let component: SwitchComponent
  let fixture: ComponentFixture<SwitchComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SwitchComponent ],
      providers: [ provideNoopAnimations() ]
    }).compileComponents()

    fixture = TestBed.createComponent(SwitchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should reflect checked state from input signal', () => {
    const checkedSignal = signal(true)
    fixture.componentRef.setInput('checked', true)
    fixture.detectChanges()

    const toggle = fixture.debugElement.query(By.directive(MatSlideToggle))
    expect(toggle.componentInstance.checked).toBe(true)
  })

  it('should emit toggleChange when slide toggle changes', () => {
    const spy = vi.spyOn(component.toggleChange, 'emit')
    const toggle = fixture.debugElement.query(By.directive(MatSlideToggle))
    
    toggle.triggerEventHandler('change', { checked: true })
    expect(spy).toHaveBeenCalledWith(true)
  })

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true)
    fixture.detectChanges()

    const toggle = fixture.debugElement.query(By.directive(MatSlideToggle))
    expect(toggle.componentInstance.disabled).toBe(true)
  })
})
