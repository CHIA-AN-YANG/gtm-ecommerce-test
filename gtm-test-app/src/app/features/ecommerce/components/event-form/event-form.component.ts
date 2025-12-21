import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  EventParameter,
  GA4EcommerceEvent,
  GA4EventType,
  GA4Item,
} from '../../models/ga4-events.model';
import { ItemEditorComponent } from '../item-editor/item-editor.component';
import eventSchema from '../../../../../../public/json/ecommerce-event-parameters.json';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule, ItemEditorComponent],
  templateUrl: 'event-form.component.html',
  styleUrls: ['event-form.component.css'],
})
export class EventFormComponent implements OnChanges {
  readonly currencyOptions = eventSchema.currency_options;
  readonly fields = [
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
  @Input() eventParameters: EventParameter[] = [];
  @Input() eventName!: string;
  @Input() isSubmitting: boolean = false;
  @Output() formSubmit = new EventEmitter<GA4EcommerceEvent>();
  @Output() preview = new EventEmitter<GA4EcommerceEvent>();

  eventForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventParameters'] && this.eventParameters.length) {
      this.initForm();
    }
  }

  initForm(): void {
    let controls: { [key: string]: any } = {};
    this.eventParameters.forEach((config: EventParameter) => {
      const validators = [];
      if (config.required) {
        validators.push(Validators.required);
      }
      if (config.type === 'number') {
        validators.push(Validators.pattern(/^-?(0|[1-9]\d*)?$/));
      }
      if (config.options === 'currency_options') {
        config.options = eventSchema.currency_options;
      }
      controls[config.name] = [{ value: null, disabled: false }, validators];
    });
    controls['items'] = this.fb.array([]);

    this.eventForm = this.fb.group(controls);
  }

  requiresField(fieldName: string): boolean {
    const control = this.eventForm.get(fieldName);
    return !!control;
  }

  getFieldOptions(field: EventParameter): { label: string; value: any }[] | null {
    return Array.isArray(field.options) ? field.options : null;
  }

  requiresValidator(fieldName: string): boolean {
    const control = this.eventForm.get(fieldName);
    return control ? control.hasValidator(Validators.required) : false;
  }

  applyValidators(): void {
    Object.keys(this.eventForm.controls).forEach((key) => {
      this.eventForm.get(key)?.updateValueAndValidity();
    });
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
    const additionalFields: any = {};
    for (const field of this.fields) {
      if (formValue[field]) {
        additionalFields[field] = formValue[field];
      }
    }

    Object.assign(ecommerce, additionalFields);

    return {
      event: this.eventName as GA4EventType,
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
    const eventName = this.eventName;
    const eventData = (eventSchema as any).events[eventName];

    if (!eventData) return;

    // Fill event parameters from JSON
    const patch: Record<string, any> = {};

    this.fields.forEach((field) => {
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
