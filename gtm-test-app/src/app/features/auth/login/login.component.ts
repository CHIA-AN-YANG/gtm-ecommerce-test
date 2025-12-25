import { Component, OnDestroy, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of, take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal('');

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.authService
      .login(this.loginForm.value)
      .pipe(take(1))
      .subscribe({
        next: () => this.router.navigate(['/settings']),
        error: (err) => {
          const msg = err.error?.message || err.message || 'An unknown error occurred';
          this.errorMessage.set(msg);
        },
      });
  }
}
