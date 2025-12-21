import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import {
  Setting,
  UpdateSettingRequest,
  CreateSettingRequest,
} from '../../../core/models/settings.model';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css'],
})
export class SettingsFormComponent implements OnInit {
  @Input() setting: Setting | null = null;
  @Output() close = new EventEmitter<void>();

  settingForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {
    this.settingForm = this.fb.group({
      gtm_container_id: ['', [Validators.required, this.gtmIdValidator]],
      ga_measurement_id: ['', [Validators.required, this.gaIdValidator]],
    });
  }

  ngOnInit(): void {
    if (this.setting) {
      this.settingForm.patchValue({
        gtm_container_id: this.setting.gtm_container_id,
        ga_measurement_id: this.setting.ga_measurement_id,
      });
    }
  }

  gtmIdValidator(control: any) {
    const value = control.value;
    if (value && !value.startsWith('GTM-')) {
      return { invalidGtmId: true };
    }
    return null;
  }

  gaIdValidator(control: any) {
    const value = control.value;
    if (value && !value.startsWith('G-')) {
      return { invalidGaId: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.settingForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = this.settingForm.value;

    const request = this.setting
      ? this.settingsService.updateSetting(this.setting.id, formData as UpdateSettingRequest)
      : this.settingsService.createSetting(formData as CreateSettingRequest);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
