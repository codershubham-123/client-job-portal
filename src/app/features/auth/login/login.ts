import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthApi } from '@core/auth-api';
import { Auth } from '@core/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApi);
  private auth = inject(Auth);
  private router = inject(Router);

  formData = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    this.authApi.login(this.formData.getRawValue()).subscribe({
      next: (res) => {
        this.auth.login(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  goToRegistration() {
    this.router.navigate(['/signup']);
  }
}
