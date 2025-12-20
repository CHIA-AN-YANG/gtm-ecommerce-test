import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    // Check if using default user credentials
    if (
      data.email === environment.defaultUser.email &&
      data.password === environment.defaultUser.password
    ) {
      const defaultResponse: AuthResponse = {
        token: 'default-user-token',
        user_id: 'default-user-id',
        email: environment.defaultUser.email,
      };
      this.storeAuthData(defaultResponse);
      return of(defaultResponse);
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data).pipe(
      tap((response) => this.storeAuthData(response)),
      catchError(this.handleError)
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data).pipe(
      tap((response) => this.storeAuthData(response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(this.tokenKey);
  }

  private storeAuthData(response: AuthResponse): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(
      this.userKey,
      JSON.stringify({
        user_id: response.user_id,
        email: response.email,
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error) {
      errorMessage = error.error.message || errorMessage;
    }
    return throwError(() => new Error(errorMessage));
  }
}
