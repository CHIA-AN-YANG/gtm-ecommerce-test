import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSelectorComponent } from './components/event-selector.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { PayloadPreviewComponent } from './components/payload-preview.component';
import {
  EventConfig,
  EventParameter,
  GA4EcommerceEvent,
  GA4EventType,
} from './models/ga4-events.model';
import { GtmService } from './services/gtm.service';
import eventParameters from '../../public/json/ecommerce-event-parameters.json';
import { BehaviorSubject, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EventSelectorComponent, EventFormComponent, PayloadPreviewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'GTM Ecommerce Event Testing App';
  selectedEventParameters: EventParameter[] | null = null;
  selectedEventName: GA4EventType | null = null;
  previewPayload: GA4EcommerceEvent | null = null;
  successMessage$ = new BehaviorSubject<string>('');
  lastPushedEvent: string = '';
  isSubmitting = false;
  private submitTimeout: any = null;

  constructor(private gtmService: GtmService, private cd: ChangeDetectorRef) {}

  onEventSelected(event: EventConfig): void {
    if (eventParameters.events[event.name] as EventParameter[]) {
      this.selectedEventParameters = eventParameters.events[event.name] as EventParameter[];
      this.selectedEventName = event.name;
    } else {
      this.selectedEventParameters = null;
      this.selectedEventName = null;
    }
    this.previewPayload = null;
  }

  onPreview(payload: GA4EcommerceEvent): void {
    this.previewPayload = payload;
  }

  onFormSubmit(payload: GA4EcommerceEvent): void {
    // Set submitting state
    this.isSubmitting = true;

    // Debounce for 1 second
    this.submitTimeout = setTimeout(() => {
      this.gtmService.pushEvent(payload);
      this.isSubmitting = false;
      this.cd.detectChanges();
      clearTimeout(this.submitTimeout);

      this.showSuccessMessageTimeout(payload.event);
    }, 1000);
  }

  showSuccessMessageTimeout(event: GA4EventType): void {
    this.successMessage$.next(event);
    const timer = setTimeout(() => {
      this.successMessage$.next('');
      clearTimeout(timer);
    }, 3000);
  }
}
