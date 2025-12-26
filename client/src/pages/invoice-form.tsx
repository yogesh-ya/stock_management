import { useState, useEffect } from 'react';
import { API_ROUTES } from '@shared/routes';
import type { StockItemResponse, InvoiceItemLine, InvoiceResponse } from '@shared/schema';

export default function InvoiceForm() {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerPlace, setCustomerPlace] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItemLine[]>([]);
  const [availableStock, setAvailableStock] = useState<StockItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [savedInvoice, setSavedInvoice] = useState<InvoiceResponse | null>(null);
  const [selectedSerial, setSelectedSerial] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "NOT_PAID">("NOT_PAID");
  const [customSalePrice, setCustomSalePrice] = useState<string>('');
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [serialSearch, setSerialSearch] = useState('');



  const models = Array.from(
    new Set(availableStock.map(s => s.model))
  ).filter(model =>
    model.toLowerCase().includes(modelSearch.toLowerCase())
  );


  const filteredStock = selectedModel
    ? availableStock.filter(s =>
      s.model === selectedModel &&
      !s.sold &&
      s.serialNo.toLowerCase().includes(serialSearch.toLowerCase())
    )
    : [];


  useEffect(() => {
    setSelectedSerial('');
    setCustomSalePrice('');
    setSerialSearch('');
  }, [selectedModel]);


  /* ================= STYLES ================= */

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a, #020617)',
    padding: '30px',
    color: '#e5e7eb',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#020617',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    marginBottom: '30px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#020617',
    color: '#e5e7eb',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px',
    display: 'block',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(37,99,235,0.35)',
  };

  /* ================= UI ================= */
  // Company details
  const company = {
    name: 'MAHAVEER ENTERPRISES',
    address: '496-B/2, Tilak nagar, Main road',
    city: 'Indore',
    state: '23-Madhya Pradesh',
    pincode: '452018',
    gstin: '23NIJPS0545G1Z0',
    pan: 'BRVPR3282C',
    mobile: '6263057840',
    email: 'ayush3sengar@gmail.com',
    bankName: 'UCO Bank, Tilak nagar',
    accountNo: '05250210004845',
    ifscCode: 'UCBA0000525',
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch(API_ROUTES.STOCK_LIST);
      const data = await res.json();
      setAvailableStock(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stock:', error);
      setMessage('Error fetching stock');
    }
  };

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!selectedSerial) {
      setMessage('Please select an item');
      return;
    }

    const stock = availableStock.find(s => s.serialNo === selectedSerial);
    if (!stock) {
      setMessage('Item not found');
      return;
    }

    if (items.find(i => i.serialNo === selectedSerial)) {
      setMessage('Item already added to invoice');
      return;
    }

    const finalSalePrice = Number(customSalePrice);

    if (!finalSalePrice || finalSalePrice <= 0) {
      setMessage('Enter valid sale price');
      return;
    }

    // ✅ DEFAULT GST = 18%
    const gstPercent = gstPercentage;

    if (isNaN(gstPercent) || gstPercent <= 0) {
      setMessage('Please enter valid GST %');
      return;
    }


    // 🔥 Reverse GST (final price → taxable value)
    const taxableAmount = finalSalePrice / (1 + gstPercent / 100);

    const newItem: InvoiceItemLine = {
      serialNo: stock.serialNo,
      itemName: `${stock.brand} ${stock.model}`,
      brand: stock.brand,
      model: stock.model,
      hsn: stock.hsn || '85072000',
      qty: 1,
      rate: Number(finalSalePrice.toFixed(2)), // GST included
      discount: 0,
      gstPercent,
      amount: Number(taxableAmount.toFixed(2)), // GST excluded
    };

    setItems([...items, newItem]);
    setMessage('');
    setSelectedSerial('');
    setCustomSalePrice('');
    setGstPercentage(18);
  };


  const handleRemoveItem = (serialNo: string) => {
    setItems(items.filter(i => i.serialNo !== serialNo));
  };

  const calculateTotals = () => {
    const taxableAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const totalGst = items.reduce((sum, item) => {
      return sum + (item.rate - item.amount);
    }, 0);

    const cgstAmount = totalGst / 2;
    const sgstAmount = totalGst / 2;

    const totalAmount = items.reduce((sum, item) => sum + item.rate, 0);

    return {
      taxableAmount: Number(taxableAmount.toFixed(2)),
      cgstAmount: Number(cgstAmount.toFixed(2)),
      sgstAmount: Number(sgstAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNo.trim()) {
      setMessage('Invoice number is required');
      return;
    }
    if (!customerName.trim()) {
      setMessage('Customer name is required');
      return;
    }
    if (items.length === 0) {
      setMessage('Add at least one item to the invoice');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(API_ROUTES.INVOICES_ADD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo: invoiceNo.trim(),
          customerName: customerName.trim(),
          customerGstin: customerGstin.trim(),
          customerPlace: customerPlace.trim(),
          customerMobile: customerMobile.trim(),
          invoiceDate,
          paymentStatus,
          items,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Failed to create invoice');
        setLoading(false);
        return;
      }

      await res.json(); // ignore backend response

      const totals = calculateTotals();

      setSavedInvoice({
        invoiceNo,
        customerName,
        customerGstin,
        customerPlace,
        customerMobile,
        invoiceDate,
        items,
        taxableAmount: totals.taxableAmount,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        totalAmount: totals.totalAmount,
      });

      setMessage('Invoice created successfully!');
      setInvoiceNo('');
      setCustomerName('');
      setCustomerGstin('');
      setCustomerPlace('');
      setCustomerMobile('');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setItems([]);
      await fetchStock();
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {

    if (!savedInvoice) return;
    
    const gstPercent =
    savedInvoice.items.length > 0
      ? savedInvoice.items[0].gstPercent
      : 18;

  const halfGst = gstPercent / 2;

    
    const totalWords = numberToWords(Math.round(savedInvoice.totalAmount));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 900px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .company-info h2 { margin: 0 0 5px 0; font-size: 18px; }
          .company-info p { margin: 3px 0; font-size: 12px; }
          .invoice-details { text-align: right; }
          .invoice-details div { margin: 3px 0; font-size: 12px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; border-bottom: 1px solid #000; padding: 5px 0; }
          .bill-section { display: flex; gap: 40px; margin: 15px 0; }
          .bill-col { flex: 1; font-size: 12px; }
          .bill-col p { margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; background-color: #f0f0f0; }
          .tax-section { margin: 15px 0; }
          .tax-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .tax-table td { border: 1px solid #000; padding: 8px; }
          .footer { display: flex; justify-content: space-between; margin-top: 30px; font-size: 11px; }
          .bank-info, .terms, .sign { flex: 1; }
          .terms ul { margin: 5px 0; padding-left: 20px; }
          .terms li { margin: 3px 0; }
          .sign { text-align: center; }
          .amount-in-words { font-weight: bold; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <h2>TAX INVOICE</h2>
              <p>ORIGINAL</p>
              <p style="margin-top: 10px; font-weight: bold;">${company.name}</p>
              <p>${company.address}</p>
              <p>${company.city}, ${company.state} ${company.pincode}</p>
              <p><strong>GSTIN:</strong> ${company.gstin}</p>
              <p><strong>PAN:</strong> ${company.pan}</p>
              <p><strong>Mobile:</strong> ${company.mobile}</p>
              <p><strong>Email:</strong> ${company.email}</p>
            </div>
            <div class="invoice-details">
              <div><strong>Invoice No.:</strong> ${savedInvoice.invoiceNo}</div>
              <div><strong>Invoice Date:</strong> ${savedInvoice.invoiceDate}</div>
            </div>
          </div>

          <div class="bill-section">
            <div class="bill-col">
              <div class="section-title">BILL TO</div>
              <p><strong>${savedInvoice.customerName}</strong></p>
              <p>Place of Supply: ${savedInvoice.customerPlace || 'N/A'}</p>
              <p>Mobile: ${savedInvoice.customerMobile || 'N/A'}</p>
              <p>GSTIN: ${savedInvoice.customerGstin || 'N/A'}</p>
            </div>
            <div class="bill-col">
              <div class="section-title">SHIP TO</div>
              <p><strong>${savedInvoice.customerName}</strong></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">S.NO.</th>
                <th>ITEMS</th>
                <th style="width: 12%;">HSN</th>
                <th style="width: 8%;">QTY.</th>
                <th style="width: 12%;">RATE</th>
                <th style="width: 12%;">DISC.</th>
                <th style="width: 12%;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${savedInvoice.items.map((item, idx) => `
                <tr>
                  <td class="text-right">${idx + 1}</td>
                  <td>${item.itemName}<br><span style="font-size: 10px;">Serial no.: ${item.serialNo}</span></td>
                  <td class="text-right">${item.hsn}</td>
                  <td class="text-right">${item.qty} PCS</td>
                  <td class="text-right">₹${item.rate.toFixed(2)}</td>
                  <td class="text-right">₹${item.discount.toFixed(2)}</td>
                  <td class="text-right">₹${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6" class="text-right">CGST @${halfGst}%</td>
                <td class="text-right">₹${savedInvoice.cgstAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="6" class="text-right">SGST @${halfGst}%</td>
                <td class="text-right">₹${savedInvoice.sgstAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="6" class="text-right">TOTAL</td>
                <td class="text-right">₹${savedInvoice.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="tax-section">
            <table class="tax-table">
              <tr>
                <td><strong>HSN/SAC</strong></td>
                <td><strong>Taxable Value</strong></td>
                <td><strong>CGST Rate</strong></td>
                <td><strong>CGST Amount</strong></td>
                <td><strong>SGST Rate</strong></td>
                <td><strong>SGST Amount</strong></td>
                <td><strong>Total Tax</strong></td>
              </tr>
              ${savedInvoice.items.map(item => `
                <tr>
                  <td>${item.hsn}</td>
                  <td>₹${item.amount.toFixed(2)}</td>
                  <td>${halfGst}%</td>
                  <td>₹${(item.amount * halfGst / 100).toFixed(2)}</td>
                  <td>${halfGst}%</td>
                  <td>₹${(item.amount * halfGst / 100).toFixed(2)}</td>
                  <td>₹${(item.amount * gstPercent / 100).toFixed(2)}</td>

                </tr>
              `).join('')}
            </table>
          </div>

          <div class="amount-in-words">Total Amount (in words): ${totalWords} Rupees</div>

          <div class="footer">
            <div class="bank-info">
              <strong>Bank Details</strong>
              <p>Name: ${company.name}</p>
              <p>Account No: ${company.accountNo}</p>
              <p>IFSC Code: ${company.ifscCode}</p>
              <p>Bank: ${company.bankName}</p>
            </div>
            <div class="terms">
              <strong>Terms and Conditions</strong>
              <ul>
                <li>Goods once sold will not be taken back or exchanged</li>
                <li>Subject to INDORE jurisdiction</li>
                <li>Guarantee as per company rules</li>
                <li>In case of damage or without guarantee card no replacement</li>
              </ul>
            </div>
            <div class="sign">
              <p style="margin-top: 40px; border-top: 1px solid #000; padding-top: 10px;">Authorised Signatory For</p>
              <p>${company.name}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=900,width=1000');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const gstPercent = items.length > 0 ? items[0].gstPercent : gstPercentage || 18;
    const halfGst = gstPercent / 2;
  return (
    <div style={pageStyle}>
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>Create Invoice</h1>

        {savedInvoice && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
            <h3>Invoice Created: {savedInvoice.invoiceNo}</h3>
            <button onClick={handleGeneratePDF} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
              Generate & Print PDF
            </button>
          </div>
        )}

        <div style={cardStyle}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Invoice No: <span style={{ color: 'red' }}>*</span></label>
                <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date: <span style={{ color: 'red' }}>*</span></label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Customer Name: <span style={{ color: 'red' }}>*</span></label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>GSTIN:</label>
                <input type="text" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Place of Supply:</label>
                <input type="text" value={customerPlace} onChange={(e) => setCustomerPlace(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Mobile:</label>
                <input type="text" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Payment Status:</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as "PAID" | "NOT_PAID")}
                  style={inputStyle}
                >
                  <option value="NOT_PAID">NOT_PAID</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>GST%</label>
                <input
                  type="number"
                  placeholder="GST %"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(Number(e.target.value))}
                  style={inputStyle}
                />

              </div>

            </div>

            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid #444',
                borderRadius: '6px',
                backgroundColor: '#111',
              }}
            >
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Add Items</h3>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search model..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  style={inputStyle}
                />

                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- Choose Model --</option>
                  {models.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search serial..."
                  value={serialSearch}
                  disabled={!selectedModel}
                  onChange={(e) => setSerialSearch(e.target.value)}
                  style={inputStyle}
                />


                {/* Stock selector */}
                <select
                  value={selectedSerial}
                  disabled={!selectedModel}
                  onChange={(e) => {
                    const serial = e.target.value;
                    setSelectedSerial(serial);

                    const stock = filteredStock.find(s => s.serialNo === serial);
                    setCustomSalePrice(stock ? String(stock.salePrice) : '');
                  }}
                  style={inputStyle}
                >
                  <option value="">-- Choose Item --</option>

                  {filteredStock
                    .filter(s => !items.find(i => i.serialNo === s.serialNo))
                    .map(item => (
                      <option key={item.serialNo} value={item.serialNo}>
                        {item.serialNo} - {item.brand} {item.model} (₹{item.salePrice})
                      </option>
                    ))}
                </select>



                {/* Sale price override */}
                <input
                  type="number"
                  placeholder="Sale Price"
                  value={customSalePrice}
                  onChange={(e) => setCustomSalePrice(e.target.value)}
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={handleAddItem}
                  style={buttonStyle}
                >
                  Add
                </button>
              </div>
            </div>


            {items.length > 0 && (
              <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
                <h3>Invoice Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={inputStyle}>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Serial No</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Item</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Qty</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rate</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discount</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Amount</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.serialNo}>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.serialNo}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.itemName}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.qty}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{item.rate.toFixed(2)}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{item.discount.toFixed(2)}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{item.amount.toFixed(2)}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}><button type="button" onClick={() => handleRemoveItem(item.serialNo)} style={{ color: 'red', cursor: 'pointer' }}>Remove</button></td>
                      </tr>
                    ))}
                    <tr style={inputStyle}>
                      <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Taxable Amount:</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{totals.taxableAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr style={inputStyle}>
                      <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>CGST ({halfGst}%):</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{totals.cgstAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr style={inputStyle}>
                      <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>SGST ({halfGst}%):</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{totals.sgstAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr style={{ backgroundColor: '#000', color: 'white', fontWeight: 'bold' }}>
                      <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>GRAND TOTAL:</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{totals.totalAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <button type="submit" disabled={loading || items.length === 0} style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(37,99,235,0.35)', cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </form>
        </div>

        {message && <div style={{ padding: '10px', marginTop: '10px', backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda', color: message.includes('Error') ? '#721c24' : '#155724', borderRadius: '5px' }}>{message}</div>}
      </div>
    </div>
  );
}

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  if (num === 0) return 'Zero';

  let words = '';
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      words = convertChunk(chunk, ones, teens, tens) + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + words;
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return words.trim();
}

function convertChunk(num: number, ones: string[], teens: string[], tens: string[]): string {
  let words = '';
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    words += ones[hundreds] + ' Hundred ';
  }

  if (remainder >= 20) {
    words += tens[Math.floor(remainder / 10)];
    if (remainder % 10 > 0) {
      words += ' ' + ones[remainder % 10];
    }
  } else if (remainder >= 10) {
    words += teens[remainder - 10];
  } else if (remainder > 0) {
    words += ones[remainder];
  }

  return words.trim();
}