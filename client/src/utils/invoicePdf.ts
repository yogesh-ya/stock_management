import type { InvoiceResponse } from "@shared/schema";

export function generateInvoiceHTML(invoice: InvoiceResponse) {
  const company = {
    name: 'PERFECT BATTERIES & INVERTER',
    address: '571, TILAK NAGAR MAIN ROAD, NEAR UCO BANK',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452018',
    gstin: '23BRVPR3282C1ZJ',
    pan: 'BRVPR3282C',
    mobile: '9301643112',
    email: 'roopsinghsengar123@gmail.com',
    bankName: 'Bank of India, SAKET NAGAR',
    accountNo: '880220110000529',
    ifscCode: 'BKID0008802',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; padding: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #000; padding: 6px; }
    th { background: #f0f0f0; }
    .right { text-align: right; }
  </style>
</head>
<body>

<h2>${company.name}</h2>
<p>${company.address}</p>
<p><strong>GSTIN:</strong> ${company.gstin}</p>

<hr/>

<p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
<p><strong>Date:</strong> ${invoice.invoiceDate}</p>
<p><strong>Customer:</strong> ${invoice.customerName}</p>

<table>
<thead>
<tr>
  <th>#</th>
  <th>Item</th>
  <th>HSN</th>
  <th>Qty</th>
  <th>Rate</th>
  <th>Amount</th>
</tr>
</thead>
<tbody>
${invoice.items.map((i, idx) => `
<tr>
  <td>${idx + 1}</td>
  <td>${i.itemName}<br/>SN: ${i.serialNo}</td>
  <td>${i.hsn}</td>
  <td class="right">${i.qty}</td>
  <td class="right">₹${i.rate}</td>
  <td class="right">₹${i.amount}</td>
</tr>
`).join("")}
<tr>
  <td colspan="5" class="right"><strong>CGST</strong></td>
  <td class="right">₹${invoice.cgstAmount}</td>
</tr>
<tr>
  <td colspan="5" class="right"><strong>SGST</strong></td>
  <td class="right">₹${invoice.sgstAmount}</td>
</tr>
<tr>
  <td colspan="5" class="right"><strong>TOTAL</strong></td>
  <td class="right"><strong>₹${invoice.totalAmount}</strong></td>
</tr>
</tbody>
</table>

</body>
</html>
`;
}
