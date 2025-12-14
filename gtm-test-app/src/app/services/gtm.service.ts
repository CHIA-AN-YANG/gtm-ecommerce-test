import { Injectable } from '@angular/core';
import { GA4EcommerceEvent } from '../models/ga4-events.model';

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  constructor() {
    // Initialize dataLayer if it doesn't exist
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }
  }

  /**
   * Push GA4 ecommerce event to dataLayer
   */
  pushEvent(event: GA4EcommerceEvent): void {
    if (typeof window !== 'undefined' && window.dataLayer) {
      // Clear previous ecommerce object
      window.dataLayer.push({ ecommerce: null });

      // Push new event
      window.dataLayer.push(event);

      console.log('Event pushed to dataLayer:', event);
    }
  }

  /**
   * Get current dataLayer (for debugging)
   */
  getDataLayer(): any[] {
    if (typeof window !== 'undefined' && window.dataLayer) {
      return window.dataLayer;
    }
    return [];
  }
}
