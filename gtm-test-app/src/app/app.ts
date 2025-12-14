import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSelectorComponent } from './components/event-selector.component';
import { EventFormComponent } from './components/event-form.component';
import { PayloadPreviewComponent } from './components/payload-preview.component';
import { EventConfig, GA4EcommerceEvent } from './models/ga4-events.model';
import { GtmService } from './services/gtm.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EventSelectorComponent, EventFormComponent, PayloadPreviewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'GTM Ecommerce Event Testing App';
  selectedEvent: EventConfig | null = null;
  previewPayload: GA4EcommerceEvent | null = null;
  showSuccessMessage = false;
  lastPushedEvent: string = '';

  constructor(private gtmService: GtmService) {}

  onEventSelected(event: EventConfig): void {
    this.selectedEvent = event;
    this.previewPayload = null;
    this.showSuccessMessage = false;
  }

  onPreview(payload: GA4EcommerceEvent): void {
    this.previewPayload = payload;
  }

  onFormSubmit(payload: GA4EcommerceEvent): void {
    this.gtmService.pushEvent(payload);
    this.lastPushedEvent = payload.event;
    this.showSuccessMessage = true;

    // Hide success message after 5 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
}
