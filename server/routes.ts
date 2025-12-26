import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { API_ROUTES } from "@shared/routes";
import type { StockItemResponse } from "@shared/schema";
import { appendInvoiceToExcel } from "./excel/invoice.excel";


let invoices: any[] = [];


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET /api/stock - list all items
  app.get(API_ROUTES.STOCK_LIST, (req, res) => {
    const items = storage.getStock();
    res.json(items);
  });

  // POST /api/stock - add single stock item
  app.post(API_ROUTES.STOCK_ADD, (req, res) => {
    try {
      const { serialNo, date, brand, model, purchasePrice, salePrice, gstPercent, status, hsn, paymentStatus } = req.body;
      
      if (!serialNo || !brand || !model || salePrice === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = storage.getStock().find(s => s.serialNo === serialNo);
      if (existing) {
        return res.status(400).json({ error: "Serial number already exists" });
      }

      const item: StockItemResponse = {
        serialNo,
        date: date || new Date().toISOString().split('T')[0],
        brand,
        model,
        purchasePrice: Number(purchasePrice) || 0,
        salePrice: Number(salePrice),
        gstPercent: Number(gstPercent) || 18,
        status: status || "Available",
        hsn: hsn || "",
        sold: false,
      };

      const saved = storage.addStockItem(item);
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ error: "Failed to add stock item" });
    }
  });

  // POST /api/stock/bulk - add multiple items from Excel
  app.post("/api/stock/bulk", (req, res) => {
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid items data" });
      }

      const validItems = items.map((item: any) => ({
        serialNo: String(item.serialNo || ""),
        date: String(item.date || new Date().toISOString().split('T')[0]),
        brand: String(item.brand || ""),
        model: String(item.model || ""),
        purchasePrice: Number(item.purchasePrice) || 0,
        salePrice: Number(item.salePrice) || 0,
        gstPercent: Number(item.gstPercent) || 18,
        status: String(item.status || "Available"),
        hsn: String(item.hsn || ""),
        sold: false,
      })).filter(item => item.serialNo && item.salePrice > 0);

      if (validItems.length === 0) {
        return res.status(400).json({ error: "No valid items to add" });
      }

      const added = storage.addMultipleStockItems(validItems);
      res.status(201).json(added);
    } catch (error) {
      res.status(500).json({ error: "Failed to add stock items" });
    }
  });

  // GET /api/invoices - list all invoices
  app.get(API_ROUTES.INVOICES_LIST, (req, res) => {
    const invoices = storage.getInvoices();
    res.json(invoices);
  });

  // POST /api/invoices - add invoice
app.post("/api/invoices", async (req, res) => {
  try {
    const invoice = storage.addInvoice(req.body);
    // 🔥 SAVE TO EXCEL HERE
    await appendInvoiceToExcel(invoice);

    res.json(invoice);
  } catch (e) {
    console.error("Invoice creation error:", e);
    res.status(500).json({
      error: "Failed to create invoice",
      details: String(e),
    });
  }
});

  return httpServer;
}
