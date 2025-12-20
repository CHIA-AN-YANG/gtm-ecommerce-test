import { Injectable } from '@angular/core';
import { GA4EcommerceEvent } from '../models/ga4-events.model';

declare global {
  interface Window {
    dataLayer: any[];
    google_tag_manager?: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GtmService {
  private isInitialized = false;
  private currentGtmId: string | null = null;

  constructor() {
    // Initialize dataLayer if it doesn't exist
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }
  }

  /**
   * Initialize GTM with a container ID
   * Dynamically injects the GTM script
   */
  init(gtmId: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    // If already initialized with the same ID, skip
    if (this.isInitialized && this.currentGtmId === gtmId) {
      console.log('GTM already initialized with ID:', gtmId);
      return;
    }

    // If switching to a different GTM ID, reload the page for clean state
    if (this.isInitialized && this.currentGtmId !== gtmId) {
      console.log('Switching GTM container, reloading page...');
      this.currentGtmId = gtmId;
      window.location.reload();
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });

    // Create and inject the GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

    script.onload = () => {
      console.log('GTM script loaded successfully:', gtmId);
      this.isInitialized = true;
      this.currentGtmId = gtmId;
    };

    script.onerror = () => {
      console.error('Failed to load GTM script:', gtmId);
    };

    document.head.appendChild(script);

    // Add noscript fallback to body
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  /**
   * Push any data to dataLayer
   */
  push(data: any): void {
    if (typeof window !== 'undefined' && window.dataLayer) {
      if (!this.isInitialized) {
        console.warn('GTM not initialized. Call init(gtmId) first.');
        return;
      }
      window.dataLayer.push(data);
      console.log('Data pushed to dataLayer:', data);
    }
  }

  /**
   * Push GA4 ecommerce event to dataLayer
   */
  pushEvent(event: GA4EcommerceEvent): void {
    if (!this.isInitialized) {
      console.warn('GTM not initialized. Call init(gtmId) first.');
      return;
    }

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

  /**
   * Check if GTM is initialized
   */
  isGtmInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current GTM container ID
   */
  getCurrentGtmId(): string | null {
    return this.currentGtmId;
  }
}
