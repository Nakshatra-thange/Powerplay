import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTop5Customers, getCustomers } from '../api/customers';
import PageHeader from '../components/PageHeader';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function CustomersPage() {
  const [top5, setTop5]           = useState([]);
  const [all, setAll]             = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getTop5Customers(), getCustomers()])
      .then(([t, a]) => { setTop5(t); setAll(a); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = all.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader subtitle="Analytics" title="Customers" />

      {/* Top 5 */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        color: 'var(--text-muted)', letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: '16px',
      }}>
        Top 5 · by total invoiced
      </div>

      <div style={{ marginBottom: '48px' }}>
        {loading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>loading...</div>
        ) : top5.map((c, i) => (
          <div key={c._id}
            onClick={() => navigate(`/customers/${c._id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '16px 0', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'padding-left 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.paddingLeft = '8px'}
            onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '28px',
              fontWeight: 300, color: 'var(--border)',
              width: '48px', textAlign: 'right', flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>{c.customerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.company}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 500 }}>{fmt(c.totalInvoiced)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.invoiceCount} invoices</div>
            </div>
            <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>→</div>
          </div>
        ))}
      </div>

      {/* All customers */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          All Customers · {all.length}
        </div>
        <input
          type="text"
          placeholder="Search name or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '220px', fontSize: '13px' }}
        />
      </div>

      <div style={{ border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
              {['Customer', 'Company', ''].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  fontWeight: 500, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No customers found.</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c._id}
                onClick={() => navigate(`/customers/${c._id}`)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-panel)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-panel)'}
              >
                <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '11px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>{c.company}</td>
                <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  View profile →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}