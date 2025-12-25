import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe, NgClass } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { GtmService } from '../../../core/services/gtm.service';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsFormComponent } from '../settings-form/settings-form.component';
import { Observable, of } from 'rxjs';
import { Setting } from '../../../core/models/settings.model';

@Component({
  selector: 'app-settings-list',
  standalone: true,
  imports: [SettingsFormComponent, DatePipe, AsyncPipe, RouterModule],
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css'],
})
export class SettingsListComponent implements OnInit {
  settings$: Observable<Setting[]> = this.settingsService.settings$;
  activeSetting: Setting | null = null;
  errorMessage: string | null = null;
  showForm = false;
  editingSetting: Setting | null = null;

  constructor(
    private settingsService: SettingsService,
    private gtmService: GtmService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.subscribeToActiveSetting();
  }

  subscribeToActiveSetting(): void {
    this.settingsService.activeSetting$.subscribe((setting) => {
      this.activeSetting = setting;
    });
  }

  loadSettings(): void {
    this.errorMessage = null;
    this.settingsService.getSettings().subscribe({
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

  onAdd(): void {
    this.editingSetting = null;
    this.showForm = true;
  }

  onEdit(setting: Setting): void {
    this.editingSetting = setting;
    this.showForm = true;
  }

  onDelete(setting: Setting): void {
    if (!confirm(`Are you sure you want to delete this setting (${setting.gtm_container_id})?`)) {
      return;
    }
    this.errorMessage = null;
    this.settingsService.deleteSetting(setting.id).subscribe({
      next: () => {
        this.loadSettings();
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

  onFormClose(): void {
    this.showForm = false;
    this.editingSetting = null;
    this.loadSettings();
  }

  onSetActive(setting: Setting): void {
    this.settingsService.setActiveSetting(setting);
  }

  isActive(setting: Setting): boolean {
    return this.activeSetting?.id === setting.id;
  }

  onLogout(): void {
    this.settingsService.clearActiveSetting();
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
