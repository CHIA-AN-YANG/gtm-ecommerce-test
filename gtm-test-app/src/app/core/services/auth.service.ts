import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
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
  private userKey = 'auth_user';
  private isAuthenticatedState = false;

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.storeAuthData(response)),
        catchError(this.handleError)
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/register`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.storeAuthData(response)),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.baseUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.isAuthenticatedState = false;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(this.userKey);
          }
        }),
        catchError(() => {
          // Clear state even if logout fails
          this.isAuthenticatedState = false;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(this.userKey);
          }
          return of(undefined);
        })
      );
  }

  isAuthenticated(): boolean {
    console.log('AuthService: isAuthenticated called, state=', this.isAuthenticatedState);
    // Return cached state, actual validation happens via HTTP requests
    return this.isAuthenticatedState;
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http
      .get<{ authenticated: boolean }>(`${this.baseUrl}/auth/status`, { withCredentials: true })
      .pipe(
        map((result) => Boolean(result.authenticated)),
        catchError(() => {
          return of(false);
        })
      );
  }

  private storeAuthData(response: AuthResponse): void {
    // Token is stored in HTTP-only cookie by the server
    // Only store non-sensitive user info in sessionStorage
    this.isAuthenticatedState = true;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        this.userKey,
        JSON.stringify({
          email: response.email,
        })
      );
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('Auth error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
