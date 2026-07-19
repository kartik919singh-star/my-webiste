export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  length: string; // Stored as string to facilitate decimal input editing in forms
  width: string;  // Stored as string to facilitate decimal input editing in forms
  quantity: string; // Stored as string to facilitate editing in forms
  price: string;    // Stored as string to facilitate editing in forms
}
