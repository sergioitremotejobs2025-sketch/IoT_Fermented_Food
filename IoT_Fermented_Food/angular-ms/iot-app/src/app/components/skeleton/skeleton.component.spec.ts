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

import { SkeletonComponent } from './skeleton.component';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply provided width and height', () => {
    // RED PHASE: We want to use signal inputs, but they are still Decorator inputs
    fixture.componentRef.setInput('width', '200px');
    fixture.componentRef.setInput('height', '100px');
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.skeleton-box');
    expect(element.style.width).toBe('200px');
    expect(element.style.height).toBe('100px');
  });

  it('should apply circle border radius when variant is circle', () => {
    fixture.componentRef.setInput('variant', 'circle');
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.skeleton-box');
    expect(element.style.borderRadius).toBe('50%');
  });

  it('should have a pulse animation class', () => {
    const element = fixture.nativeElement.querySelector('.skeleton-box');
    expect(element.classList.contains('pulse')).toBe(true);
  });
});
