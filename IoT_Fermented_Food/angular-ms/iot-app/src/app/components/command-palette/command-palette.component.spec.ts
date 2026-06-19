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

import { CommandPaletteComponent } from './command-palette.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArduinoService } from '../../services/arduino.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('CommandPaletteComponent', () => {
  let component: CommandPaletteComponent;
  let fixture: ComponentFixture<CommandPaletteComponent>;
  let routerMock: any;
  let arduinoServiceMock: any;
  let dialogRefMock: any;

  beforeEach(async () => {
    routerMock = {
      navigate: vi.fn()
    };
    arduinoServiceMock = {
      allArduinos: of([])
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CommandPaletteComponent, FormsModule, MatAutocompleteModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ArduinoService, useValue: arduinoServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CommandPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter items based on search query using signals', () => {
    component.query.set('ajustes');
    fixture.detectChanges();
    
    const filtered = component.filteredItems();
    expect(filtered.some(i => i.name.toLowerCase().includes('ajustes'))).toBe(true);
  });

  it('should navigate and close when item is selected', () => {
    const item = { name: 'Home', link: '/', icon: 'dashboard', type: 'nav' as const };
    component.selectItem(item);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
