import { Component, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule],
  template: `
    <mat-slide-toggle
      [checked]="checked()"
      [disabled]="disabled()"
      (change)="toggleChange.emit($event.checked)"
      color="primary">
      <ng-content></ng-content>
    </mat-slide-toggle>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SwitchComponent {
  checked = input<boolean>(false)
  disabled = input<boolean>(false)
  toggleChange = output<boolean>()
}
