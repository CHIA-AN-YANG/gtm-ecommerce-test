import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Setting, CreateSettingRequest, UpdateSettingRequest } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = environment.apiUrl;
  private settingsSubject = new BehaviorSubject<Setting[]>([]);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(`${this.baseUrl}/api/settings`).pipe(
      tap((settings) => this.settingsSubject.next(settings)),
      catchError(this.handleError)
    );
  }

  createSetting(data: CreateSettingRequest): Observable<Setting> {
    return this.http.post<Setting>(`${this.baseUrl}/api/settings`, data).pipe(
      tap(() => this.refreshSettings()),
      catchError(this.handleError)
    );
  }

  updateSetting(id: string, data: UpdateSettingRequest): Observable<Setting> {
    return this.http.put<Setting>(`${this.baseUrl}/api/settings/${id}`, data).pipe(
      tap(() => this.refreshSettings()),
      catchError(this.handleError)
    );
  }

  deleteSetting(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/settings/${id}`).pipe(
      tap(() => this.refreshSettings()),
      catchError(this.handleError)
    );
  }

  private refreshSettings(): void {
    this.getSettings().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
