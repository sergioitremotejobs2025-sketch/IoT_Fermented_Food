import { TestBed } from '@angular/core/testing';
import { CommandPaletteService } from './command-palette.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('CommandPaletteService', () => {
  let service: CommandPaletteService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    TestBed.configureTestingModule({
      providers: [
        CommandPaletteService,
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    service = TestBed.inject(CommandPaletteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open the dialog when toggle is called and it is closed', () => {
    service.toggle();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should close the dialog when toggle is called and it is open', () => {
    // Manually set internal state or simulate first open
    service.toggle(); 
    expect(dialogSpy.open).toHaveBeenCalledTimes(1);
    
    // Toggle again
    service.toggle();
    expect(dialogSpy.closeAll).toHaveBeenCalled();
  });
});
