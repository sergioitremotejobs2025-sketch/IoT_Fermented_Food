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

import { SliderComponent } from './slider.component'
import { MatSliderModule } from '@angular/material/slider'
import { By } from '@angular/platform-browser'
import { provideNoopAnimations } from '@angular/platform-browser/animations'

describe('SliderComponent', () => {
  let component: SliderComponent
  let fixture: ComponentFixture<SliderComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SliderComponent, MatSliderModule ],
      providers: [ provideNoopAnimations() ]
    }).compileComponents()

    fixture = TestBed.createComponent(SliderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should reflect value input', () => {
    fixture.componentRef.setInput('value', 50)
    fixture.detectChanges()
    
    const input = fixture.debugElement.query(By.css('input[matSliderThumb]'))
    expect(input.nativeElement.value).toBe('50')
  })
})
