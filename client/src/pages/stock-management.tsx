import { useState, useEffect } from 'react';
import { API_ROUTES } from '@shared/routes';
import type { StockItemResponse } from '@shared/schema';

export default function StockManagement() {
  const [items, setItems] = useState<StockItemResponse[]>([]);
  const [serialNo, setSerialNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [gstPercent, setGstPercent] = useState('18');
  const [hsn, setHsn] = useState('');
  const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch(API_ROUTES.STOCK_LIST);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setMessage('Error fetching stock');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!serialNo || !brand || !model || !salePrice) {
      setMessage('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_ROUTES.STOCK_ADD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNo,
          date,
          brand,
          model,
          purchasePrice: Number(purchasePrice),
          salePrice: Number(salePrice),
          gstPercent: Number(gstPercent),
          hsn,
          status,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Failed to add item');
        return;
      }

      setMessage('Item added successfully');
      setSerialNo('');
      setDate(new Date().toISOString().split('T')[0]);
      setBrand('');
      setModel('');
      setPurchasePrice('');
      setSalePrice('');
      setGstPercent('18');
      setHsn('');
      setStatus('Available');
      await fetchStock();
    } catch {
      setMessage('Error adding item');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>
        Add New Stock Item
      </h1>

      <div style={cardStyle}>

        <form onSubmit={handleAddItem}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Brand *</label>
              <input value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Model *</label>
              <input value={model} onChange={e => setModel(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Serial No *</label>
              <input value={serialNo} onChange={e => setSerialNo(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>HSN Code</label>
              <input value={hsn} onChange={e => setHsn(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Purchase Price</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Sale Price *</label>
              <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>GST %</label>
              <input type="number" value={gstPercent} onChange={e => setGstPercent(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                <option>Available</option>
                <option>Sold</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Adding…' : 'Add Item'}
            </button>
          </div>

          {message && (
            <p style={{ marginTop: '12px', color: message.includes('Error') ? '#f87171' : '#4ade80' }}>
              {message}
            </p>
          )}
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: '16px' }}>Current Stock ({items.length})</h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#020617', color: '#94a3b8' }}>
                {['Date', 'Brand', 'Model', 'Serial', 'HSN', 'Purchase', 'Sale', 'GST', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px', borderBottom: '1px solid #334155' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.serialNo} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px' }}>{item.date}</td>
                  <td style={{ padding: '10px' }}>{item.brand}</td>
                  <td style={{ padding: '10px' }}>{item.model}</td>
                  <td style={{ padding: '10px' }}>{item.serialNo}</td>
                  <td style={{ padding: '10px' }}>{item.hsn}</td>
                  <td style={{ padding: '10px' }}>₹{item.purchasePrice}</td>
                  <td style={{ padding: '10px' }}>₹{item.salePrice}</td>
                  <td style={{ padding: '10px' }}>{item.gstPercent}%</td>
                  <td style={{ padding: '10px', color: item.sold ? '#f87171' : '#4ade80', fontWeight: 600 }}>
                    {item.sold ? 'SOLD' : 'available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
