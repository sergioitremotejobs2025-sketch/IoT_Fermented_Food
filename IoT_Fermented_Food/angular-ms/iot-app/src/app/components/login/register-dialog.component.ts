import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'

import { AuthService } from '@services/auth.service'

import { MustMatch } from '@helpers/must-match.helper'

import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-dialog',
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
  templateUrl: './register-dialog.component.html'
})
export class RegisterDialogComponent {

  registerForm: FormGroup

  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    private formBuilder: FormBuilder
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: [ '', [ Validators.required, Validators.maxLength(30) ] ],
        password: [ '', [ Validators.required, Validators.maxLength(30) ] ],
        repeatPassword: [ '', [ Validators.required, Validators.maxLength(30) ] ]
      },
      {
        validator: MustMatch('password', 'repeatPassword')
      }
    )
  }

  onNoClick() {
    this.dialogRef.close()
  }

  register({ username, password, repeatPassword }: { username: string, password: string, repeatPassword: string }) {
    if (password === repeatPassword) {
      this.authService.register(username, password)
        .subscribe(
          () => this.dialogRef.close(username),
          () => {
            this.registerForm.get(['password']).reset()
            this.registerForm.get(['repeatPassword']).reset()
          }
        )
    } else {
      this.registerForm.get(['password']).reset()
      this.registerForm.get(['repeatPassword']).reset()
    }
  }

  changeToLogin() {
    this.dialogRef.close(false)
  }

}
