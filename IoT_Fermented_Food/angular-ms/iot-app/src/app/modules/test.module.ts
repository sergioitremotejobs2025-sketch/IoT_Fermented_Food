import { NgModule } from '@angular/core';

import { AppModule } from '@modules/app.module';
import { ArduinoServiceStub } from '../stubs/arduino.service.stub';
import { AuthServiceStub } from '../stubs/auth.service.stub';
import { ArduinoService } from '@services/arduino.service';
import { AuthService } from '@services/auth.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [], imports: [AppModule,
        RouterTestingModule], providers: [
        { provide: ArduinoService, useClass: ArduinoServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ] })
export class TestModule { }

