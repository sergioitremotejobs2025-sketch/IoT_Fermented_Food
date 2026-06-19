import { MediaMatcher } from '@angular/cdk/layout'
import { ChangeDetectorRef, Component, OnDestroy, OnInit, HostListener } from '@angular/core'
import { CommandPaletteService } from '../../services/command-palette.service';

import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { LoginComponent } from '@components/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    NavbarComponent,
    LoginComponent
  ],
  styleUrls: [ './app.component.less' ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy, OnInit {

  ngOnInit() { }

  mobileQuery: MediaQueryList
  opened = false

  toggle(opened: boolean) {
    this.opened = !this.opened
  }

  private _mobileQueryListener: () => void

  constructor(
    changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher,
    private commandPaletteService: CommandPaletteService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)')
    this._mobileQueryListener = () => changeDetectorRef.detectChanges()
    this.mobileQuery.addListener(this._mobileQueryListener)
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener)
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.commandPaletteService.toggle();
    }
  }

  shouldRun = true
}
