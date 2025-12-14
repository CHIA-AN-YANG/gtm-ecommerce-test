import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventConfig, GA4EcommerceEvent, GA4Item } from '../../models/ga4-events.model';
import { ItemEditorComponent } from '../item-editor.component';
import eventParameters from '../../../../public/json/ecommerce-event-parameters.json';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ItemEditorComponent],
  templateUrl: 'event-form.component.html',
  styleUrls: ['event-form.component.css'],
})
export class EventFormComponent implements OnChanges {
  @Input() eventConfig!: EventConfig;
  @Input() isSubmitting: boolean = false;
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

  fillWithDefaults(): void {
    const eventName = this.eventConfig.name;
    const eventData = (eventParameters as any).events[eventName];

    if (!eventData) return;

    // Fill event parameters from JSON
    const fields = [
      'currency',
      'value',
      'transaction_id',
      'shipping',
      'tax',
      'payment_type',
      'shipping_tier',
      'item_list_id',
      'item_list_name',
    ];

    const patch: Record<string, any> = {};

    fields.forEach((field) => {
      if (eventData[field]?.default !== undefined) {
        patch[field] = eventData[field].default;
      }
    });

    if (Object.keys(patch).length) {
      this.eventForm.patchValue(patch);
    }

    // Fill items array from JSON
    if (eventData.items && eventData.items.default) {
      const itemsArray = this.eventForm.get('items') as FormArray;

      // Clear existing items
      while (itemsArray.length > 0) {
        itemsArray.removeAt(0);
      }

      // Add items from JSON
      eventData.items.default.forEach((item: any) => {
        const itemGroup = this.fb.group({
          item_id: [item.item_id || '', Validators.required],
          item_name: [item.item_name || '', Validators.required],
          item_brand: [item.item_brand || ''],
          item_category: [item.item_category || ''],
          price: [item.price || 0, [Validators.required, Validators.min(0)]],
          quantity: [item.quantity || 1, [Validators.required, Validators.min(1)]],
          discount: [item.discount || 0, Validators.min(0)],
        });
        itemsArray.push(itemGroup);
      });
    }
  }
}
