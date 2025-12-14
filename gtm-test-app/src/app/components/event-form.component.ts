import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventConfig, GA4EcommerceEvent, GA4Item } from '../models/ga4-events.model';
import { ItemEditorComponent } from './item-editor.component';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ItemEditorComponent],
  template: `
    <div class="event-form" *ngIf="eventConfig">
      <h3>{{ eventConfig.displayName }} Form</h3>

      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
        <!-- Event-specific fields -->
        <div class="form-section">
          <h4>Event Parameters</h4>

          <!-- Currency (if required) -->
          <div class="form-group" *ngIf="requiresField('currency')">
            <label>Currency *</label>
            <input type="text" formControlName="currency" placeholder="USD" />
            <div
              *ngIf="eventForm.get('currency')?.invalid && eventForm.get('currency')?.touched"
              class="error"
            >
              Currency is required
            </div>
          </div>

          <!-- Value (if required) -->
          <div class="form-group" *ngIf="requiresField('value')">
            <label>Value *</label>
            <input type="number" step="0.01" formControlName="value" placeholder="0.00" />
            <div
              *ngIf="eventForm.get('value')?.invalid && eventForm.get('value')?.touched"
              class="error"
            >
              Value is required
            </div>
          </div>

          <!-- Transaction ID (if required) -->
          <div class="form-group" *ngIf="requiresField('transaction_id')">
            <label>Transaction ID *</label>
            <input type="text" formControlName="transaction_id" placeholder="T12345" />
            <div
              *ngIf="
                eventForm.get('transaction_id')?.invalid && eventForm.get('transaction_id')?.touched
              "
              class="error"
            >
              Transaction ID is required
            </div>
          </div>

          <!-- Shipping (if optional) -->
          <div class="form-group" *ngIf="hasOptionalField('shipping')">
            <label>Shipping</label>
            <input type="number" step="0.01" formControlName="shipping" placeholder="0.00" />
          </div>

          <!-- Tax (if optional) -->
          <div class="form-group" *ngIf="hasOptionalField('tax')">
            <label>Tax</label>
            <input type="number" step="0.01" formControlName="tax" placeholder="0.00" />
          </div>

          <!-- Payment Type (if required) -->
          <div class="form-group" *ngIf="requiresField('payment_type')">
            <label>Payment Type *</label>
            <input type="text" formControlName="payment_type" placeholder="Credit Card" />
            <div
              *ngIf="
                eventForm.get('payment_type')?.invalid && eventForm.get('payment_type')?.touched
              "
              class="error"
            >
              Payment type is required
            </div>
          </div>

          <!-- Shipping Tier (if required) -->
          <div class="form-group" *ngIf="requiresField('shipping_tier')">
            <label>Shipping Tier *</label>
            <input type="text" formControlName="shipping_tier" placeholder="Ground" />
            <div
              *ngIf="
                eventForm.get('shipping_tier')?.invalid && eventForm.get('shipping_tier')?.touched
              "
              class="error"
            >
              Shipping tier is required
            </div>
          </div>

          <!-- Item List ID (if optional) -->
          <div class="form-group" *ngIf="hasOptionalField('item_list_id')">
            <label>Item List ID</label>
            <input type="text" formControlName="item_list_id" placeholder="related_products" />
          </div>

          <!-- Item List Name (if optional) -->
          <div class="form-group" *ngIf="hasOptionalField('item_list_name')">
            <label>Item List Name</label>
            <input type="text" formControlName="item_list_name" placeholder="Related Products" />
          </div>
        </div>

        <!-- Items Array -->
        <div class="form-section">
          <app-item-editor [parentForm]="eventForm"></app-item-editor>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            type="button"
            (click)="onPreview()"
            class="preview-button"
            [disabled]="eventForm.invalid"
          >
            Preview Payload
          </button>
          <button type="submit" class="submit-button" [disabled]="eventForm.invalid">
            Push to DataLayer
          </button>
        </div>

        <div *ngIf="eventForm.invalid && eventForm.touched" class="form-error">
          Please fill in all required fields and add at least one item.
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .event-form {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 2px solid #4285f4;
        padding-bottom: 10px;
      }

      .form-section {
        margin-bottom: 25px;
      }

      .form-section h4 {
        color: #666;
        font-size: 16px;
        margin-bottom: 15px;
      }

      .form-group {
        margin-bottom: 15px;
      }

      .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 5px;
        color: #555;
      }

      .form-group input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-group input:focus {
        outline: none;
        border-color: #4285f4;
        box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
      }

      .form-group input.ng-invalid.ng-touched {
        border-color: #dc3545;
      }

      .error {
        color: #dc3545;
        font-size: 12px;
        margin-top: 4px;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      .preview-button,
      .submit-button {
        flex: 1;
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .preview-button {
        background: #6c757d;
        color: white;
      }

      .preview-button:hover:not(:disabled) {
        background: #5a6268;
      }

      .submit-button {
        background: #4285f4;
        color: white;
      }

      .submit-button:hover:not(:disabled) {
        background: #3367d6;
      }

      .preview-button:disabled,
      .submit-button:disabled {
        background: #e0e0e0;
        color: #999;
        cursor: not-allowed;
      }

      .form-error {
        color: #dc3545;
        padding: 12px;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        margin-top: 15px;
      }
    `,
  ],
})
export class EventFormComponent implements OnChanges {
  @Input() eventConfig!: EventConfig;
  @Output() formSubmit = new EventEmitter<GA4EcommerceEvent>();
  @Output() preview = new EventEmitter<GA4EcommerceEvent>();

  eventForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventConfig'] && this.eventConfig) {
      this.initForm();
    }
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      currency: [''],
      value: [0],
      transaction_id: [''],
      shipping: [0],
      tax: [0],
      payment_type: [''],
      shipping_tier: [''],
      item_list_id: [''],
      item_list_name: [''],
      items: this.fb.array([]),
    });

    // Apply validators based on event config
    if (this.eventConfig) {
      this.applyValidators();
    }
  }

  applyValidators(): void {
    const fields = this.eventConfig.requiredFields;

    if (fields.includes('currency')) {
      this.eventForm.get('currency')?.setValidators([Validators.required]);
    }
    if (fields.includes('value')) {
      this.eventForm.get('value')?.setValidators([Validators.required, Validators.min(0)]);
    }
    if (fields.includes('transaction_id')) {
      this.eventForm.get('transaction_id')?.setValidators([Validators.required]);
    }
    if (fields.includes('payment_type')) {
      this.eventForm.get('payment_type')?.setValidators([Validators.required]);
    }
    if (fields.includes('shipping_tier')) {
      this.eventForm.get('shipping_tier')?.setValidators([Validators.required]);
    }

    // Update validity
    Object.keys(this.eventForm.controls).forEach((key) => {
      this.eventForm.get(key)?.updateValueAndValidity();
    });
  }

  requiresField(field: string): boolean {
    return this.eventConfig?.requiredFields.includes(field) || false;
  }

  hasOptionalField(field: string): boolean {
    return this.eventConfig?.optionalFields.includes(field) || false;
  }

  buildEventPayload(): GA4EcommerceEvent {
    const formValue = this.eventForm.value;
    const items = this.eventForm.get('items') as FormArray;

    const ecommerce: any = {
      items: items.value.map((item: GA4Item) => {
        const cleanItem: any = {
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          quantity: item.quantity,
        };

        if (item.item_brand) cleanItem.item_brand = item.item_brand;
        if (item.item_category) cleanItem.item_category = item.item_category;
        if (item.discount) cleanItem.discount = item.discount;

        return cleanItem;
      }),
    };

    // Add fields based on what's filled
    if (formValue.currency) ecommerce.currency = formValue.currency;
    if (formValue.value) ecommerce.value = formValue.value;
    if (formValue.transaction_id) ecommerce.transaction_id = formValue.transaction_id;
    if (formValue.shipping) ecommerce.shipping = formValue.shipping;
    if (formValue.tax) ecommerce.tax = formValue.tax;
    if (formValue.payment_type) ecommerce.payment_type = formValue.payment_type;
    if (formValue.shipping_tier) ecommerce.shipping_tier = formValue.shipping_tier;
    if (formValue.item_list_id) ecommerce.item_list_id = formValue.item_list_id;
    if (formValue.item_list_name) ecommerce.item_list_name = formValue.item_list_name;

    return {
      event: this.eventConfig.name,
      ecommerce,
    };
  }

  onPreview(): void {
    if (this.eventForm.valid) {
      const payload = this.buildEventPayload();
      this.preview.emit(payload);
    }
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const payload = this.buildEventPayload();
      this.formSubmit.emit(payload);
    } else {
      // Mark all as touched to show errors
      this.eventForm.markAllAsTouched();
    }
  }
}
