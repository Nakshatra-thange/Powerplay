import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomerProfile } from '../api/customers';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const fmt     = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function MetricCard({ label, value }) {
  return (
    <div style={{
      padding: '20px',
      border: '1px solid var(--border)',
      background: 'var(--bg-panel)',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  useEffect(() => {
    getCustomerProfile(id).then(setProfile).finally(() => setLoading(false));
  }, [id, page]);

  if (loading) return <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', padding: '40px' }}>loading...</div>;
  if (!profile) return <div style={{ padding: '40px', color: 'var(--accent)' }}>Customer not found.</div>;

  const { customer, metrics, invoices } = profile;

  return (
    <div>
      <PageHeader
        subtitle={customer.company}
        title={customer.name}
      />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
        <MetricCard label="Total Invoiced"   value={fmt(metrics.totalInvoiced)} />
        <MetricCard label="Total Paid"       value={fmt(metrics.totalPaid)} />
        <MetricCard label="Outstanding"      value={fmt(metrics.totalOutstanding)} />
        <MetricCard label="Invoice Count"    value={metrics.invoiceCount} />
      </div>

      {/* Invoice history */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Invoice History · {invoices.total}
      </div>

      <div style={{ border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
              {['Invoice ID', 'Status', 'Issue Date', 'Due Date', 'Amount', 'Total'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.data.map((inv, i) => (
              <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-panel)' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{inv.invoiceId}</td>
                <td style={{ padding: '10px 14px' }}><StatusBadge status={inv.status} /></td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{fmtDate(inv.issueDate)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{fmtDate(inv.dueDate)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{fmt(inv.amount)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500 }}>{fmt(inv.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {invoices.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
            ← Prev
          </button>
          <button onClick={() => setPage(p => Math.min(invoices.totalPages, p + 1))} disabled={page === invoices.totalPages}
            style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}