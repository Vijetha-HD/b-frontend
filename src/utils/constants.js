/**
 * Application Constants
 * Centralized constants used across the application
 */

// Product Categories
export const PRODUCT_CATEGORIES = [
  "windows",
  "macbooks",
  "gaming",
  "mini-pcs",
  "workstations",
  "ultrabooks",
  "chromebooks",
];

// Product Conditions
export const PRODUCT_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "refurbished", label: "Refurbished" },
];

// RAM Options
export const RAM_OPTIONS = ["4GB", "8GB", "16GB", "32GB", "64GB"];

// Storage Options
export const STORAGE_OPTIONS = ["128GB", "256GB", "512GB", "1TB", "2TB"];

// Warranty Options
export const WARRANTY_OPTIONS = [
  "6 months",
  "12 months",
  "18 months",
  "24 months",
  "36 months",
];

// Default Values
export const DEFAULT_VALUES = {
  CONDITION: "new",
  GST_INCLUDED: true,
  GST_PERCENTAGE: 18,
  MOQ: 1,
  RATING: 0,
  REVIEWS_COUNT: 0,
  LIVE_VIEWERS: 0,
  DEFAULT_WARRANTY: 12,
  ESTIMATED_DELIVERY_DAYS: 7,
  FREE_SHIPPING: false,
  SOLD_COUNT: 0,
};

// Form Field Labels
export const FIELD_LABELS = {
  // Basic Information
  NAME: "Product Name",
  DESCRIPTION: "Description",
  BRAND: "Brand",
  CONDITION: "Condition",
  CATEGORY: "Category",

  // Pricing
  BASE_PRICE: "Base Price (₹)",
  MRP: "MRP (₹)",
  DISCOUNT_PERCENTAGE: "Discount Percentage (%)",
  B2B_PRICE: "B2B Price (₹)",
  GST_INCLUDED: "GST Included",
  GST_PERCENTAGE: "GST Percentage (%)",
  MOQ: "Minimum Order Quantity",

  // Stock & Inventory
  STOCK: "Stock Quantity",

  // Images
  IMAGES: "Product Images",

  // Ratings & Reviews
  RATING: "Rating (0-5)",
  REVIEWS_COUNT: "Reviews Count",
  LIVE_VIEWERS: "Live Viewers",
  SOLD_COUNT: "Sold Count",

  // Specifications
  SCREEN_SIZE: "Screen Size",
  RESOLUTION: "Resolution",
  PROCESSOR: "Processor",
  RAM: "RAM",
  STORAGE: "Storage",
  BATTERY: "Battery",

  // Warranty
  DEFAULT_WARRANTY: "Default Warranty",

  // Shipping
  FREE_SHIPPING: "Free Shipping",
  ESTIMATED_DELIVERY_DAYS: "Estimated Delivery Days",

  // Offers
  EXCHANGE_OFFER: "Exchange Offer",
  NO_COST_EMI: "No Cost EMI",
  BANK_OFFERS: "Bank Offers",
};
