import type { StockItemResponse, InvoiceResponse } from "@shared/schema";
import { readStockFromExcel, writeStockToExcel } from "./excel/stockExcel";

let stockItems: StockItemResponse[] = [];
let invoices: InvoiceResponse[] = [];

class Storage {
  constructor() {
    readStockFromExcel().then(items => {
      stockItems = items;
      console.log(`Loaded ${items.length} stock items from Excel`);
    });
  }

  /* ---------------- STOCK ---------------- */

  getStock(): StockItemResponse[] {
    return stockItems;
  }

  addStockItem(item: StockItemResponse): StockItemResponse {
    stockItems.push(item);
    writeStockToExcel(stockItems);
    return item;
  }

  addMultipleStockItems(items: StockItemResponse[]): StockItemResponse[] {
    stockItems.push(...items);
    writeStockToExcel(stockItems);
    return items;
  }

  markAsSold(serialNo: string): void {
    const item = stockItems.find(s => s.serialNo === serialNo);
    if (!item) {
      throw new Error(`Stock not found for serialNo: ${serialNo}`);
    }

    item.sold = true;
    writeStockToExcel(stockItems);
  }

  /* ---------------- INVOICES ---------------- */

  getInvoices(): InvoiceResponse[] {
    return invoices;
  }

  addInvoice(invoice: InvoiceResponse): InvoiceResponse {
    if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
      throw new Error("Invoice items missing");
    }

    // mark stock as sold
    invoice.items.forEach(item => {
      if (!item.serialNo) {
        throw new Error("Invoice item serialNo missing");
      }
      this.markAsSold(item.serialNo);
    });

    invoices.push(invoice);

    return invoice;
  }
}

export const storage = new Storage();