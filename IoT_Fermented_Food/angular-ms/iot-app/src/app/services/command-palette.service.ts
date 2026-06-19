import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommandPaletteComponent } from '../components/command-palette/command-palette.component';

@Injectable({
  providedIn: 'root'
})
export class CommandPaletteService {
  private dialogRef: MatDialogRef<CommandPaletteComponent> | null = null;

  constructor(private dialog: MatDialog) { }

  toggle(): void {
    if (this.dialogRef) {
      this.dialog.closeAll();
      this.dialogRef = null;
    } else {
      this.dialogRef = this.dialog.open(CommandPaletteComponent, {
        width: '600px',
        maxWidth: '90vw',
        position: { top: '15vh' },
        panelClass: 'command-palette-dialog',
        hasBackdrop: true,
        backdropClass: 'glass-backdrop'
      });

      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }
  }
}
