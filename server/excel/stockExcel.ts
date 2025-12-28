import type { StockItemResponse } from "@shared/schema";
import { initSheet, doc } from "../google/sheets";

const SHEET_NAME = "Stock";

// 🔑 Single source of truth for headers
const STOCK_HEADERS = [
  "serialNo",
  "date",
  "brand",
  "model",
  "purchasePrice",
  "salePrice",
  "gstPercent",
  "hsn",
  "status",
] as const;

/* ---------------- ENSURE SHEET ---------------- */

async function getStockSheet() {
  await initSheet();

  let sheet = doc.sheetsByTitle[SHEET_NAME];

  if (!sheet) {
    sheet = await doc.addSheet({
      title: SHEET_NAME,
      headerValues: [...STOCK_HEADERS],
    });
    return sheet;
  }

  /**
   * IMPORTANT:
   * Do NOT call setHeaderRow blindly every time.
   * It is expensive and can cause subtle state issues.
   *
   * loadHeaderRow is enough once headers exist.
   */
  await sheet.loadHeaderRow(1);

  return sheet;
}

/* ---------------- READ ---------------- */

export async function readStockFromExcel(): Promise<StockItemResponse[]> {
  const sheet = await getStockSheet();
  const rows = await sheet.getRows();

  const result: StockItemResponse[] = [];

  for (const row of rows) {
    const serialNo = String(row.get("serialNo") ?? "").trim();
    if (!serialNo) continue;

    const status = String(row.get("status") ?? "").trim().toUpperCase();

    result.push({
      serialNo,
      date: String(row.get("date") ?? "").trim(),
      brand: String(row.get("brand") ?? "").trim(),
      model: String(row.get("model") ?? "").trim(),
      purchasePrice: Number(row.get("purchasePrice") ?? 0),
      salePrice: Number(row.get("salePrice") ?? 0),
      gstPercent: Number(row.get("gstPercent") ?? 0),
      hsn: String(row.get("hsn") ?? "").trim(),
      sold: status === "SOLD",
    });
  }

  return result;
}

/* ---------------- WRITE (FULL REPLACE — RARE) ---------------- */
/**
 * ⚠️ Use ONLY for:
 * - bulk imports
 * - resets
 * - migrations
 */
export async function writeStockToExcel(items: StockItemResponse[]) {
  const sheet = await getStockSheet();

  // Clear existing rows (bulk operation)
  const rows = await sheet.getRows();
  if (rows.length) {
    await Promise.all(rows.map(r => r.delete()));
  }

  const validItems = items.filter(
    i => i.serialNo && i.serialNo.trim().length > 0
  );

  if (validItems.length === 0) return;

  await sheet.addRows(
    validItems.map(item => ({
      serialNo: item.serialNo,
      date: item.date,
      brand: item.brand,
      model: item.model,
      purchasePrice: item.purchasePrice,
      salePrice: item.salePrice,
      gstPercent: item.gstPercent,
      hsn: item.hsn,
      status: item.sold ? "SOLD" : "",
    }))
  );
}

/* ---------------- WRITE (FAST APPEND) ---------------- */

export async function appendStockToExcel(item: StockItemResponse) {
  const sheet = await getStockSheet();

  await sheet.addRow({
    serialNo: item.serialNo,
    date: item.date,
    brand: item.brand,
    model: item.model,
    purchasePrice: item.purchasePrice,
    salePrice: item.salePrice,
    gstPercent: item.gstPercent,
    hsn: item.hsn,
    status: item.sold ? "SOLD" : "",
  });
}

/* ---------------- UPDATE (FAST SINGLE ROW) ---------------- */

export async function markStockAsSoldInExcel(
  serialNo: string
): Promise<boolean> {
  const sheet = await getStockSheet();
  const rows = await sheet.getRows();

  const row = rows.find(
    r => String(r.get("serialNo")).trim() === serialNo
  );

  if (!row) return false;

  row.set("status", "SOLD");
  await row.save();
  return true;
}
