import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';

import { AlertInboxComponent } from '@components/alert-inbox/alert-inbox.component';
import { LoginComponent } from '@components/login/login.component';
import { PipesModule } from '@modules/pipes.module';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    RouterModule,
    LoginComponent,
    AlertInboxComponent,
    PipesModule
  ],
  styleUrls: ['./navbar.component.less'],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  isOpen = false
  @Output() opened = new EventEmitter<boolean>()
  today = new Date()
  theme$ = this.themeService.theme$;
  lang$ = this.languageService.lang$;

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService
  ) { }

  ngOnInit() { }

  toggle() {
    this.isOpen = !this.isOpen
    this.opened.emit(this.isOpen)
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleLanguage() {
    const current = this.languageService.getCurrentLang();
    this.languageService.setLanguage(current === 'es' ? 'en' : 'es');
  }

}
