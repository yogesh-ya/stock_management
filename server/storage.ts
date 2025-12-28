import type { StockItemResponse, InvoiceResponse } from "@shared/schema";
import {
  readStockFromExcel,
  writeStockToExcel,
  appendStockToExcel,
  markStockAsSoldInExcel,
} from "./excel/stockExcel";

class Storage {
  /* ---------------- STOCK ---------------- */

  /**
   * Read stock from Excel.
   * Excel is the single source of truth.
   */
  async getStock(): Promise<StockItemResponse[]> {
    try {
      const items = await readStockFromExcel();
      return Array.isArray(items) ? items : [];
    } catch (err) {
      console.error("Failed to read stock from Excel:", err);
      return [];
    }
  }

  /**
   * Add ONE stock item.
   * ⚡ Appends a single row (fast, no delete).
   */
  async addStockItem(item: StockItemResponse): Promise<StockItemResponse> {
    await appendStockToExcel(item);
    return item;
  }

  /**
   * Add MULTIPLE stock items (bulk upload).
   * ⚠️ Full rewrite is acceptable ONLY here.
   */
  async addMultipleStockItems(
    newItems: StockItemResponse[]
  ): Promise<StockItemResponse[]> {
    if (!Array.isArray(newItems) || newItems.length === 0) {
      return [];
    }

    const existing = await this.getStock();
    const combined = [...existing, ...newItems];

    await writeStockToExcel(combined);
    return newItems;
  }

  /**
   * Mark a single stock item as SOLD.
   * ⚡ Updates only the matched row.
   */
  async markAsSold(serialNo: string): Promise<void> {
    if (!serialNo) {
      throw new Error("serialNo is required");
    }

    const updated = await markStockAsSoldInExcel(serialNo);
    if (!updated) {
      throw new Error(`Stock not found for serialNo: ${serialNo}`);
    }
  }

  /* ---------------- INVOICES ---------------- */

  /**
   * Invoices are stored in memory only (for now).
   */
  getInvoices(): InvoiceResponse[] {
    return invoices;
  }

  /**
   * Add invoice and mark stock items as sold.
   */
  async addInvoice(invoice: InvoiceResponse): Promise<InvoiceResponse> {
    if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
      throw new Error("Invoice items missing");
    }

    for (const item of invoice.items) {
      if (!item.serialNo) {
        throw new Error("Invoice item serialNo missing");
      }
      await this.markAsSold(item.serialNo);
    }

    invoices.push(invoice);
    return invoice;
  }
}

/* ---------------- IN-MEMORY ONLY ---------------- */
const invoices: InvoiceResponse[] = [];

/* ---------------- EXPORT ---------------- */
export const storage = new Storage();
