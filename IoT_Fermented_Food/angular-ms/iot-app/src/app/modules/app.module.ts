import { registerLocaleData } from '@angular/common'
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import localeEs from '@angular/common/locales/es'
import { isDevMode, LOCALE_ID, NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { provideLottieOptions } from 'ngx-lottie';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import player from 'lottie-web';

export function playerFactory() {
  return player;
}

import { DashboardModule } from '@modules/dashboard.module'
import { MatModule } from '@modules/mat.module'
import { MicrocontrollersModule } from '@modules/microcontrollers.module'

import { AppRoutingModule } from '@routes/app.routing.module'

import { ArduinoService } from '@services/arduino.service'
import { AuthService } from '@services/auth.service'

import { AuthGuard } from '@guards/auth.guard'

import { TokenInterceptor } from '@interceptors/token.interceptor'

import { AppComponent } from '@components/app/app.component'
import { IndexComponent } from '@components/index/index.component'
import { LoginComponent } from '@components/login/login.component'
import { LoginDialogComponent } from '@components/login/login-dialog.component'
import { RegisterDialogComponent } from '@components/login/register-dialog.component'
import { NavbarComponent } from '@components/navbar/navbar.component'
import { ChangePasswordDialogComponent } from '@components/login/change-password-dialog.component'
import { AlertInboxComponent } from '@components/alert-inbox/alert-inbox.component'
import { CommandPaletteComponent } from '@components/command-palette/command-palette.component'
import { SkeletonComponent } from '@components/skeleton/skeleton.component'
import { ThreeDHoverDirective } from '../shared/three-d-hover.directive'
import { AnalyticsComponent } from '@components/analytics/analytics.component'
import { LottieAnimationComponent } from '../shared/lottie-animation/lottie-animation.component'
import { LightboxComponent } from '../shared/lightbox/lightbox.component'
import { DeviceHealthComponent } from '@components/device-health/device-health.component'

registerLocaleData(localeEs, 'es')

@NgModule({ bootstrap: [
        AppComponent
    ],
    declarations: [],
    imports: [
        AppComponent,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        DashboardModule,
        FormsModule,
        MatModule,
        MicrocontrollersModule,
        ReactiveFormsModule,
        ReactiveFormsModule,
        BaseChartDirective,
        LottieAnimationComponent,
        LightboxComponent,
        IndexComponent,
        LoginComponent,
        LoginDialogComponent,
        RegisterDialogComponent,
        ChangePasswordDialogComponent,
        NavbarComponent,
        AlertInboxComponent,
        CommandPaletteComponent,
        SkeletonComponent,
        ThreeDHoverDirective,
        AnalyticsComponent,
        DeviceHealthComponent
    ],
 providers: [
        ArduinoService,
        AuthGuard,
        AuthService,
        {
            provide: LOCALE_ID,
            useValue: 'es'
        },
        {
            multi: true,
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideCharts(withDefaultRegisterables()),
        provideLottieOptions({
            player: playerFactory
        }),
        provideExperimentalZonelessChangeDetection()
    ] })
export class AppModule { }
