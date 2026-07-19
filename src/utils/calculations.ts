import type { InvoiceItem } from '../types';

/**
 * Calculates square footage for a single row: Length (ft) * Width (ft) * Quantity
 */
export function calculateRowSqFt(length: string, width: string, quantity: string): number {
  const len = parseFloat(length);
  const wid = parseFloat(width);
  const qty = parseInt(quantity, 10);

  if (isNaN(len) || isNaN(wid) || isNaN(qty) || len <= 0 || wid <= 0 || qty <= 0) {
    return 0;
  }
  return len * wid * qty;
}

/**
 * Calculates total cost for a single row: Row SqFt * Price/SqFt
 */
export function calculateRowTotal(
  length: string,
  width: string,
  quantity: string,
  price: string
): number {
  const sqFt = calculateRowSqFt(length, width, quantity);
  const prc = parseFloat(price);

  if (isNaN(prc) || prc <= 0) {
    return 0;
  }
  return sqFt * prc;
}

/**
 * Aggregates subtotals, GST (18%), and Grand Total across all invoice rows
 */
export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  tax: number;
  grandTotal: number;
} {
  let subtotal = 0;

  items.forEach((item) => {
    subtotal += calculateRowTotal(item.length, item.width, item.quantity, item.price);
  });

  const tax = subtotal * 0.18; // 18% standard GST
  const grandTotal = subtotal + tax;

  return {
    subtotal,
    tax,
    grandTotal,
  };
}
