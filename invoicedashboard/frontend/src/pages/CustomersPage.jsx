import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTop5Customers } from '../api/customers';
import PageHeader from '../components/PageHeader';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getTop5Customers().then(setCustomers).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader subtitle="Analytics" title="Top 5 Customers" />

      {/* Decorative dot grid header */}
      <div className="dot-grid" style={{ height: '60px', marginBottom: '32px', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          RANKED BY TOTAL INVOICED
        </span>
      </div>

      {loading ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {customers.map((c, i) => (
            <div key={c._id}
              onClick={() => navigate(`/customers/${c._id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '20px 0',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'padding-left 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = '8px'}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
            >
              {/* Rank */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '32px',
                fontWeight: 300,
                color: 'var(--border)',
                width: '56px',
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Name + company */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.01em' }}>{c.customerName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.company}</div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 500 }}>
                  {fmt(c.totalInvoiced)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {c.invoiceCount} invoices
                </div>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '16px', flexShrink: 0 }}>→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}