import { Component } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'

import { AuthService } from '@services/auth.service'

import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  styleUrls: [ './login.component.less' ],
  templateUrl: './login-dialog.component.html'
})
export class LoginDialogComponent {

  loginForm: FormGroup

  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginDialogComponent>
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [ Validators.required, Validators.maxLength(30) ]),
      password: new FormControl('', [ Validators.required, Validators.maxLength(30) ])
    })
  }

  onNoClick() {
    this.dialogRef.close()
  }

  login({ username, password }: { username: string, password: string }) {
    this.authService.login(username, password)
      .subscribe(
        () => this.dialogRef.close(username),
        () => this.loginForm.get(['password']).reset()
      )
  }

  changeToRegister() {
    this.dialogRef.close(true)
  }

}
