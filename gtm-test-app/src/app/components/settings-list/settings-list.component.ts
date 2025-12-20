import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { GtmService } from '../../services/gtm.service';
import { Setting } from '../../models/settings.model';
import { SettingsFormComponent } from '../settings-form/settings-form.component';

@Component({
  selector: 'app-settings-list',
  standalone: true,
  imports: [CommonModule, SettingsFormComponent],
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css'],
})
export class SettingsListComponent implements OnInit {
  settings: Setting[] = [];
  activeSetting: Setting | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  showForm = false;
  editingSetting: Setting | null = null;

  constructor(
    private settingsService: SettingsService,
    private gtmService: GtmService,
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
    this.isLoading = true;
    this.errorMessage = null;
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
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

    this.isLoading = true;
    this.errorMessage = null;
    this.settingsService.deleteSetting(setting.id).subscribe({
      next: () => {
        this.loadSettings();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
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
    this.gtmService.init(setting.gtm_container_id);
  }

  isActive(setting: Setting): boolean {
    return this.activeSetting?.id === setting.id;
  }

  onLogout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.router.navigate(['/login']);
  }
}
