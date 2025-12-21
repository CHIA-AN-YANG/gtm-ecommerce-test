import { Component, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventParameter } from '../../models/ga4-events.model';
import eventSchema from '../../../../../../public/json/ecommerce-event-parameters.json';

@Component({
  selector: 'app-item-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.css'],
})
export class ItemEditorComponent {
  @Input() parentForm!: FormGroup;
  itemConfig: EventParameter[] = eventSchema.item_object as EventParameter[];

  constructor(private fb: FormBuilder) {}

  get items(): FormArray {
    return this.parentForm.get('items') as FormArray;
  }

  getItemGroup(index: number): FormGroup {
    return this.items.at(index) as FormGroup;
  }

  addItem(): void {
    const controls: { [key: string]: any } = {};

    this.itemConfig.forEach((field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'number') {
        validators.push(Validators.min(0));
      }
      controls[field.name] = [null, validators];
    });

    const itemGroup = this.fb.group(controls);
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  fillItemDefaults(index: number): void {
    const itemGroup = this.getItemGroup(index);
    const values: { [key: string]: any } = {};

    this.itemConfig.forEach((field) => {
      if (field.defaultValue !== undefined && field.defaultValue !== null) {
        values[field.name] = field.defaultValue;
      }
    });

    itemGroup.patchValue(values);
  }
}
