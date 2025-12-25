import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GtmService } from './gtm.service';
import { Setting, CreateSettingRequest, UpdateSettingRequest } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = environment.apiUrl;
  private settingsSubject = new BehaviorSubject<Setting[]>([]);
  public settings$ = this.settingsSubject.asObservable();
  private activeSettingKey = 'active_setting_id';
  private activeSettingSubject = new BehaviorSubject<Setting | null>(null);
  public activeSetting$ = this.activeSettingSubject.asObservable();

  constructor(private http: HttpClient, private gtmService: GtmService) {
    this.activeSetting$
      .pipe(
        filter((setting) => Boolean(setting)),
        distinctUntilChanged()
      )
      .subscribe((setting) => {
        setting?.gtm_container_id
          ? this.gtmService.init(setting.gtm_container_id!)
          : this.gtmService.clear();
      });
  }

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(`${this.baseUrl}/api/settings`, { withCredentials: true }).pipe(
      tap((settings) => {
        this.settingsSubject.next(settings);
        this.loadActiveSetting(settings);
      }),
      catchError(this.handleError)
    );
  }

  createSetting(data: CreateSettingRequest): Observable<Setting> {
    return this.http
      .post<Setting>(`${this.baseUrl}/api/settings`, data, { withCredentials: true })
      .pipe(
        tap(() => this.refreshSettings()),
        catchError(this.handleError)
      );
  }

  updateSetting(id: string, data: UpdateSettingRequest): Observable<Setting> {
    return this.http
      .put<Setting>(`${this.baseUrl}/api/settings/${id}`, data, { withCredentials: true })
      .pipe(
        tap(() => this.refreshSettings()),
        catchError(this.handleError)
      );
  }

  deleteSetting(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/api/settings/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          // Clear active setting if it was deleted
          if (this.activeSettingSubject.value?.id === id) {
            this.clearActiveSetting();
          }
          this.refreshSettings();
        }),
        catchError(this.handleError)
      );
  }

  setActiveSetting(setting: Setting): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.activeSettingKey, setting.id);
    }
    this.activeSettingSubject.next(setting);
  }

  clearActiveSetting(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.activeSettingKey);
    }
    this.activeSettingSubject.next(null);
  }

  getActiveSetting(): Setting | null {
    return this.activeSettingSubject.value;
  }

  private loadActiveSetting(settings: Setting[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const activeId = localStorage.getItem(this.activeSettingKey);
    if (activeId) {
      const activeSetting = settings.find((s) => s.id == activeId);
      if (activeSetting) {
        this.activeSettingSubject.next(activeSetting);
      } else {
        // Active setting no longer exists
        this.clearActiveSetting();
      }
    }
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
