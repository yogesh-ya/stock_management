import type { InvoiceResponse } from "@shared/schema";
import { initSheet, doc } from "../google/sheets";

const SHEET_NAME = "Invoices";

/* ================= COLUMN ORDER (LOCKED) ================= */

const HEADERS = [
  "invoiceNo",
  "invoiceDate",
  "customerName",
  "customerGstin",
  "customerMobile",
  "serialNo",
  "itemName",
  "brand",
  "model",
  "qty",
  "rate",
  "paymentStatus",
];

/* ================= ENSURE SHEET ================= */

async function getInvoiceSheet() {
  await initSheet();

  let sheet = doc.sheetsByTitle[SHEET_NAME];

  if (!sheet) {
    sheet = await doc.addSheet({
      title: SHEET_NAME,
      headerValues: HEADERS,
    });
  }

  return sheet;
}

/* ================= READ ================= */

export async function readInvoicesFromExcel(): Promise<any[]> {
  const sheet = await getInvoiceSheet();
  const rows = await sheet.getRows();

  return rows.map(row => ({
    invoiceNo: String(row.invoiceNo ?? ""),
    invoiceDate: String(row.invoiceDate ?? ""),
    customerName: String(row.customerName ?? ""),
    customerGstin: String(row.customerGstin ?? ""),
    customerMobile: String(row.customerMobile ?? ""),
    serialNo: String(row.serialNo ?? ""),
    itemName: String(row.itemName ?? ""),
    brand: String(row.brand ?? ""),
    model: String(row.model ?? ""),
    qty: Number(row.qty ?? 0),
    rate: Number(row.rate ?? 0),
    paymentStatus: String(row.paymentStatus ?? ""),
  }));
}

/* ================= WRITE (FULL REWRITE – SAFE) ================= */

export async function writeInvoicesToExcel(rows: any[]) {
  const sheet = await getInvoiceSheet();

  // clear existing rows
  const existing = await sheet.getRows();
  for (const r of existing) {
    await r.delete();
  }

  // add fresh rows
  await sheet.addRows(rows);
}

/* ================= APPEND (SAFE & ORDERED) ================= */

export async function appendInvoiceToExcel(invoice: InvoiceResponse) {
  const sheet = await getInvoiceSheet();

  const rows = invoice.items.map(item => ({
    invoiceNo: invoice.invoiceNo,
    invoiceDate: invoice.invoiceDate,
    customerName: invoice.customerName,
    customerGstin: invoice.customerGstin ?? "",
    customerMobile: invoice.customerMobile ?? "",
    serialNo: item.serialNo,
    itemName: item.itemName,
    brand: item.brand,
    model: item.model,
    qty: item.qty,
    rate: item.rate,
    paymentStatus: invoice.paymentStatus, // PAID / NOT_PAID
  }));

  await sheet.addRows(rows);
}
