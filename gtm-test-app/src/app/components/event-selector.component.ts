import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GA4EventType, GA4_EVENT_CONFIGS, EventConfig } from '../models/ga4-events.model';

@Component({
  selector: 'app-event-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="event-selector">
      <h2>Select GA4 Ecommerce Event</h2>

      <div class="event-categories">
        <div *ngFor="let category of categories" class="category-section">
          <h3>{{ categoryNames[category] }}</h3>
          <div class="event-buttons">
            <button
              *ngFor="let event of getEventsByCategory(category)"
              [class.selected]="selectedEvent === event.name"
              (click)="selectEvent(event)"
              class="event-button"
              type="button"
            >
              {{ event.displayName }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="selectedEventConfig" class="event-info">
        <h4>{{ selectedEventConfig.displayName }}</h4>
        <p>{{ selectedEventConfig.description }}</p>
        <p>
          <strong>Event Name:</strong> <code>{{ selectedEventConfig.name }}</code>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .event-selector {
        padding: 20px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      h2 {
        margin-top: 0;
        color: #333;
      }

      .category-section {
        margin-bottom: 20px;
      }

      .category-section h3 {
        color: #666;
        font-size: 16px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .event-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .event-button {
        padding: 10px 16px;
        background: white;
        border: 2px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .event-button:hover {
        border-color: #4285f4;
        background: #f0f7ff;
      }

      .event-button.selected {
        background: #4285f4;
        color: white;
        border-color: #4285f4;
      }

      .event-info {
        margin-top: 20px;
        padding: 15px;
        background: white;
        border-radius: 6px;
        border-left: 4px solid #4285f4;
      }

      .event-info h4 {
        margin-top: 0;
        color: #4285f4;
      }

      .event-info p {
        margin: 8px 0;
      }

      code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        color: #d63384;
      }
    `,
  ],
})
export class EventSelectorComponent {
  @Output() eventSelected = new EventEmitter<EventConfig>();

  selectedEvent: GA4EventType | null = null;
  selectedEventConfig: EventConfig | null = null;

  categories: ('discovery' | 'cart' | 'checkout' | 'transaction')[] = [
    'discovery',
    'cart',
    'checkout',
    'transaction',
  ];

  categoryNames = {
    discovery: 'Product Discovery & Engagement',
    cart: 'Shopping Cart Interactions',
    checkout: 'Checkout Flow',
    transaction: 'Transaction & Revenue',
  };

  getEventsByCategory(category: string): EventConfig[] {
    return GA4_EVENT_CONFIGS.filter((event) => event.category === category);
  }

  selectEvent(event: EventConfig): void {
    this.selectedEvent = event.name;
    this.selectedEventConfig = event;
    this.eventSelected.emit(event);
  }
}
