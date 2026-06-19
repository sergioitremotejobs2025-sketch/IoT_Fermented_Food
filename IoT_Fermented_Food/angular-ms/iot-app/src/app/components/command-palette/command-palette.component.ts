import { Component, ElementRef, AfterViewInit, signal, computed, effect, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ArduinoService } from '../../services/arduino.service';
import { toSignal } from '@angular/core/rxjs-interop';

interface PaletteItem {
  name: string;
  link: string;
  icon: string;
  type: 'nav' | 'device';
}

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule,
    MatListModule,
    FormsModule
  ],
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.less']
})
export class CommandPaletteComponent implements AfterViewInit {
  searchInput = viewChild<ElementRef>('searchInput');
  
  query = signal('');
  
  staticNavItems: PaletteItem[] = [
    { name: 'Dashboard / Inicio', link: '/', icon: 'dashboard', type: 'nav' },
    { name: 'Analítica Avanzada / Trends', link: '/analytics', icon: 'bar_chart', type: 'nav' },
    { name: 'Ajustes de Dispositivos', link: '/settings', icon: 'settings', type: 'nav' },
    { name: 'Historial de Medidas', link: '/history', icon: 'history', type: 'nav' }
  ];

  arduinos = toSignal(this.arduinoService.allArduinos, { initialValue: [] });

  allItems = computed(() => {
    const devices: PaletteItem[] = this.arduinos().map(a => ({
      name: `Dispositivo: ${a.sensor} (${a.ip})`,
      link: '/',
      icon: 'memory',
      type: 'device' as const
    }));
    return [...this.staticNavItems, ...devices];
  });

  filteredItems = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.allItems();
    return this.allItems().filter(i => 
      i.name.toLowerCase().includes(q)
    );
  });

  constructor(
    private router: Router,
    private arduinoService: ArduinoService,
    private dialogRef: MatDialogRef<CommandPaletteComponent>
  ) {
    // Effect to handle initial focus
    effect(() => {
      const input = this.searchInput();
      if (input) {
        setTimeout(() => input.nativeElement.focus(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    // Focus handled by effect
  }

  selectItem(item: PaletteItem): void {
    this.router.navigate([item.link]);
    this.dialogRef.close();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.dialogRef.close();
    }
  }

  // Helper for ngModel binding
  updateQuery(val: string) {
    this.query.set(val);
  }
}
