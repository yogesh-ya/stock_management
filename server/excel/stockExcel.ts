import type { StockItemResponse } from "@shared/schema";
import { initSheet, doc } from "../google/sheets";

const SHEET_NAME = "Stock";

/* ---------------- ENSURE SHEET ---------------- */

async function getStockSheet() {
  await initSheet();

  let sheet = doc.sheetsByTitle[SHEET_NAME];

  if (!sheet) {
    sheet = await doc.addSheet({
      title: SHEET_NAME,
      headerValues: [
        "serialNo",
        "date",
        "brand",
        "model",
        "purchasePrice",
        "salePrice",
        "gstPercent",
        "hsn",
        "status", // SOLD or blank
      ],
    });
  }

  return sheet;
}

/* ---------------- READ ---------------- */

export async function readStockFromExcel(): Promise<StockItemResponse[]> {
  const sheet = await getStockSheet();
  const rows = await sheet.getRows();

  return rows.map(row => {
    const status = String(row.status ?? "").trim().toUpperCase();

    return {
      serialNo: String(row.serialNo ?? ""),
      date: String(row.date ?? ""),
      brand: String(row.brand ?? ""),
      model: String(row.model ?? ""),
      purchasePrice: Number(row.purchasePrice ?? 0),
      salePrice: Number(row.salePrice ?? 0),
      gstPercent: Number(row.gstPercent ?? 0),
      hsn: String(row.hsn ?? ""),
      sold: status === "SOLD", // ✅ ONLY SOLD = true
    };
  });
}

/* ---------------- WRITE (FULL REPLACE) ---------------- */

export async function writeStockToExcel(items: StockItemResponse[]) {
  const sheet = await getStockSheet();

  // clear existing rows
  const existing = await sheet.getRows();
  for (const r of existing) {
    await r.delete();
  }

  // add fresh rows
  await sheet.addRows(
    items.map(item => ({
      serialNo: item.serialNo,
      date: item.date,
      brand: item.brand,
      model: item.model,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice,
      gstPercent: item.gstPercent,
      hsn: item.hsn,
      status: item.sold ? "SOLD" : "", // ✅ exactly as requested
    }))
  );
}
