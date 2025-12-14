// GA4 Ecommerce Event Types and Interfaces

export type GA4EventType =
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'
  | 'refund';

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity: number;
  discount?: number;
}

export interface GA4EcommerceEvent {
  event: GA4EventType;
  ecommerce: {
    currency?: string;
    value?: number;
    transaction_id?: string;
    shipping?: number;
    tax?: number;
    payment_type?: string;
    shipping_tier?: string;
    items: GA4Item[];
    item_list_id?: string;
    item_list_name?: string;
  };
}

export interface EventConfig {
  name: GA4EventType;
  displayName: string;
  description: string;
  category: 'discovery' | 'cart' | 'checkout' | 'transaction';
  requiredFields: string[];
  optionalFields: string[];
}

export const GA4_EVENT_CONFIGS: EventConfig[] = [
  // Product Discovery & Engagement
  {
    name: 'view_item_list',
    displayName: 'View Item List',
    description: 'User views a list of items',
    category: 'discovery',
    requiredFields: ['items'],
    optionalFields: ['item_list_id', 'item_list_name'],
  },
  {
    name: 'select_item',
    displayName: 'Select Item',
    description: 'User selects an item from a list',
    category: 'discovery',
    requiredFields: ['items'],
    optionalFields: ['item_list_id', 'item_list_name'],
  },
  {
    name: 'view_item',
    displayName: 'View Item',
    description: 'User views item details',
    category: 'discovery',
    requiredFields: ['items', 'currency', 'value'],
    optionalFields: [],
  },
  // Shopping Cart Interactions
  {
    name: 'add_to_cart',
    displayName: 'Add to Cart',
    description: 'User adds items to cart',
    category: 'cart',
    requiredFields: ['items', 'currency', 'value'],
    optionalFields: [],
  },
  {
    name: 'remove_from_cart',
    displayName: 'Remove from Cart',
    description: 'User removes items from cart',
    category: 'cart',
    requiredFields: ['items', 'currency', 'value'],
    optionalFields: [],
  },
  {
    name: 'view_cart',
    displayName: 'View Cart',
    description: 'User views their cart',
    category: 'cart',
    requiredFields: ['items', 'currency', 'value'],
    optionalFields: [],
  },
  // Checkout Flow
  {
    name: 'begin_checkout',
    displayName: 'Begin Checkout',
    description: 'User begins checkout process',
    category: 'checkout',
    requiredFields: ['items', 'currency', 'value'],
    optionalFields: [],
  },
  {
    name: 'add_shipping_info',
    displayName: 'Add Shipping Info',
    description: 'User adds shipping information',
    category: 'checkout',
    requiredFields: ['items', 'currency', 'value', 'shipping_tier'],
    optionalFields: [],
  },
  {
    name: 'add_payment_info',
    displayName: 'Add Payment Info',
    description: 'User adds payment information',
    category: 'checkout',
    requiredFields: ['items', 'currency', 'value', 'payment_type'],
    optionalFields: [],
  },
  // Transaction & Revenue
  {
    name: 'purchase',
    displayName: 'Purchase',
    description: 'User completes a purchase',
    category: 'transaction',
    requiredFields: ['items', 'transaction_id', 'currency', 'value'],
    optionalFields: ['tax', 'shipping'],
  },
  {
    name: 'refund',
    displayName: 'Refund',
    description: 'Purchase is refunded',
    category: 'transaction',
    requiredFields: ['transaction_id', 'currency', 'value'],
    optionalFields: ['items'],
  },
];

declare global {
  interface Window {
    dataLayer: any[];
  }
}
