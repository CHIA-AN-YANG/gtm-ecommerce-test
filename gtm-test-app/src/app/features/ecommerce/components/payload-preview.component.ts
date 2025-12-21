import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GA4EcommerceEvent } from '../models/ga4-events.model';

@Component({
  selector: 'app-payload-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payload-preview" *ngIf="payload">
      <div class="header">
        <h3>📋 Payload Preview</h3>
        <button type="button" (click)="copyToClipboard()" class="copy-button">
          {{ copied ? '✓ Copied' : 'Copy JSON' }}
        </button>
      </div>

      <div class="preview-info">
        <p>This is the exact payload that will be pushed to <code>window.dataLayer</code></p>
      </div>

      <pre class="json-preview">{{ formattedPayload }}</pre>

      <div class="validation-info">
        <div class="validation-item success">
          <span class="icon">✓</span>
          <span
            >GA4 event name: <strong>{{ payload.event }}</strong></span
          >
        </div>
        <div class="validation-item success">
          <span class="icon">✓</span>
          <span
            >Items count: <strong>{{ payload.ecommerce.items.length }}</strong></span
          >
        </div>
        <div class="validation-item success" *ngIf="payload.ecommerce.value">
          <span class="icon">✓</span>
          <span
            >Total value:
            <strong
              >{{ payload.ecommerce.currency || 'USD' }} {{ payload.ecommerce.value }}</strong
            ></span
          >
        </div>
      </div>
    </div>

    <div class="empty-preview" *ngIf="!payload">
      <p>Fill out the form and click "Preview Payload" to see the event data.</p>
    </div>
  `,
  styles: [
    `
      .payload-preview {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .header h3 {
        margin: 0;
        color: #fff;
        font-size: 18px;
      }

      .copy-button {
        padding: 8px 16px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s;
      }

      .copy-button:hover {
        background: #3367d6;
      }

      .preview-info {
        background: rgba(66, 133, 244, 0.1);
        border-left: 3px solid #4285f4;
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 4px;
      }

      .preview-info p {
        margin: 0;
        font-size: 13px;
        color: #d4d4d4;
      }

      .preview-info code {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
        color: #4ec9b0;
        font-family: 'Courier New', monospace;
      }

      .json-preview {
        background: #252526;
        border: 1px solid #3e3e42;
        border-radius: 6px;
        padding: 15px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #ce9178;
        margin: 0 0 15px 0;
        max-height: 400px;
        overflow-y: auto;
      }

      .validation-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .validation-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: rgba(52, 168, 83, 0.1);
        border-radius: 4px;
        font-size: 14px;
      }

      .validation-item.success {
        color: #81c784;
      }

      .validation-item .icon {
        font-weight: bold;
        font-size: 16px;
      }

      .validation-item strong {
        color: #fff;
      }

      .empty-preview {
        background: #f5f5f5;
        padding: 40px;
        text-align: center;
        border-radius: 8px;
        border: 2px dashed #ddd;
        color: #999;
        margin-top: 20px;
      }

      .empty-preview p {
        margin: 0;
        font-size: 14px;
      }
    `,
  ],
})
export class PayloadPreviewComponent {
  @Input() payload: GA4EcommerceEvent | null = null;
  copied = false;

  get formattedPayload(): string {
    return this.payload ? JSON.stringify(this.payload, null, 2) : '';
  }

  copyToClipboard(): void {
    if (this.payload) {
      navigator.clipboard.writeText(this.formattedPayload).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      });
    }
  }
}
