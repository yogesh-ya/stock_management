// Frontend/API Types
export interface StockItemResponse {
  serialNo: string;
  date: string;
  brand: string;
  model: string;
  purchasePrice: number;
  salePrice: number;
  gstPercent: number;
  status: string;
  hsn?: string;
  sold: boolean;
}

export interface InvoiceItemLine {
  serialNo: string;
  itemName: string;
  brand: string;
  model: string;
  hsn: string;
  qty: number;
  rate: number;
  discount: number;
  gstPercent: number;
  amount: number;
}

export interface InvoiceResponse {
  invoiceNo: string;
  customerName: string;
  customerGstin: string;
  customerPlace: string;
  customerMobile: string;
  invoiceDate: string;
  items: InvoiceItemLine[];
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  texableAmount: number;
  paymentStatus: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
  mobile: string;
  email: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
}
