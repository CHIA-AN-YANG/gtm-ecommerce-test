import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-item-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="item-editor">
      <div class="header">
        <h3>Items Array</h3>
        <button type="button" (click)="addItem()" class="add-button">+ Add Item</button>
      </div>

      <div *ngIf="items.length === 0" class="empty-state">
        No items added yet. Click "Add Item" to begin.
      </div>

      <div
        *ngFor="let item of items.controls; let i = index"
        class="item-card"
        [formGroup]="getItemGroup(i)"
      >
        <div class="item-header">
          <h4>Item {{ i + 1 }}</h4>
          <button type="button" (click)="removeItem(i)" class="remove-button">Remove</button>
        </div>

        <div class="item-fields">
          <div class="form-row">
            <div class="form-group">
              <label>Item ID *</label>
              <input type="text" formControlName="item_id" placeholder="e.g., SKU123" />
              <div
                *ngIf="
                  getItemGroup(i).get('item_id')?.invalid && getItemGroup(i).get('item_id')?.touched
                "
                class="error"
              >
                Item ID is required
              </div>
            </div>

            <div class="form-group">
              <label>Item Name *</label>
              <input type="text" formControlName="item_name" placeholder="e.g., Blue T-Shirt" />
              <div
                *ngIf="
                  getItemGroup(i).get('item_name')?.invalid &&
                  getItemGroup(i).get('item_name')?.touched
                "
                class="error"
              >
                Item name is required
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Brand</label>
              <input type="text" formControlName="item_brand" placeholder="e.g., Nike" />
            </div>

            <div class="form-group">
              <label>Category</label>
              <input
                type="text"
                formControlName="item_category"
                placeholder="e.g., Apparel/Shirts"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price *</label>
              <input type="number" step="0.01" formControlName="price" placeholder="0.00" />
              <div
                *ngIf="
                  getItemGroup(i).get('price')?.invalid && getItemGroup(i).get('price')?.touched
                "
                class="error"
              >
                Valid price is required
              </div>
            </div>

            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" formControlName="quantity" placeholder="1" />
              <div
                *ngIf="
                  getItemGroup(i).get('quantity')?.invalid &&
                  getItemGroup(i).get('quantity')?.touched
                "
                class="error"
              >
                Valid quantity is required
              </div>
            </div>

            <div class="form-group">
              <label>Discount</label>
              <input type="number" step="0.01" formControlName="discount" placeholder="0.00" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .item-editor {
        margin: 20px 0;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .header h3 {
        margin: 0;
        color: #333;
      }

      .add-button {
        padding: 8px 16px;
        background: #34a853;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }

      .add-button:hover {
        background: #2d9348;
      }

      .empty-state {
        padding: 30px;
        text-align: center;
        color: #999;
        background: #f9f9f9;
        border: 2px dashed #ddd;
        border-radius: 6px;
      }

      .item-card {
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }

      .item-header h4 {
        margin: 0;
        color: #4285f4;
      }

      .remove-button {
        padding: 6px 12px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      }

      .remove-button:hover {
        background: #c82333;
      }

      .item-fields {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 5px;
        color: #555;
      }

      .form-group input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
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
    `,
  ],
})
export class ItemEditorComponent {
  @Input() parentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  get items(): FormArray {
    return this.parentForm.get('items') as FormArray;
  }

  getItemGroup(index: number): FormGroup {
    return this.items.at(index) as FormGroup;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      item_id: ['', Validators.required],
      item_name: ['', Validators.required],
      item_brand: [''],
      item_category: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount: [0, Validators.min(0)],
    });

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }
}
