import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="lightbox-container glass">
      <div class="lightbox-header">
        <h3>{{ data.title }}</h3>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="lightbox-content">
        <img [src]="data.url" [alt]="data.title" class="shadow-lg">
      </div>
    </div>
  `,
  styles: [`
    .lightbox-container {
      padding: 1rem;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 90vw;
      max-height: 90vh;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .lightbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
    }
    .lightbox-header h3 { margin: 0; font-weight: 300; letter-spacing: 1px; }
    .lightbox-content {
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    .lightbox-content img {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 8px;
      object-fit: contain;
    }
  `]
})
export class LightboxComponent {
  constructor(
    public dialogRef: MatDialogRef<LightboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string, title: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
