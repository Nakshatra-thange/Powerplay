import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, deleteInvoice } from '../api/invoices';
import { getCustomers } from '../api/customers';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Btn from '../components/Btn';

const STATUSES = ['', 'Sent', 'Unpaid', 'Overdue', 'Paid', 'Void', 'Draft'];
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [customers, setCustomers] = useState([]);

  const [filters, setFilters] = useState({
    status: '', customer: '',
    issueDateFrom: '', issueDateTo: '',
    dueDateFrom: '', dueDateTo: '',
  });
  const [sort, setSort] = useState({ sortBy: 'issueDate', order: 'desc' });
  const LIMIT = 20;

  const fetchInvoices = useCallback(async () => {
    try {
      const params = { page, limit: LIMIT, ...sort };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getInvoices(params);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filters, sort]);

  useEffect(() => {
    const id = window.setTimeout(fetchInvoices, 0);
    return () => window.clearTimeout(id);
  }, [fetchInvoices]);
  useEffect(() => { getCustomers().then(setCustomers).catch(() => {}); }, []);

  const handleSort = (field) => {
    setSort(s => ({
      sortBy: field,
      order: s.sortBy === field && s.order === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const handleFilter = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    await deleteInvoice(id);
    fetchInvoices();
  };

  const SortArrow = ({ field }) => {
    if (sort.sortBy !== field) return <span style={{ color: 'var(--border)', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: 'var(--accent)', marginLeft: 4 }}>{sort.order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      <PageHeader
        subtitle="Records"
        title={`Invoices · ${total}`}
        action={<Btn onClick={() => navigate('/invoices/new')}>+ New Invoice</Btn>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        <select name="status" value={filters.status} onChange={handleFilter}
          style={{ minWidth: 120 }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>

        <select name="customer" value={filters.customer} onChange={handleFilter}
          style={{ minWidth: 160 }}>
          <option value="">All Customers</option>
          {customers.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ISSUE</span>
          <input type="date" name="issueDateFrom" value={filters.issueDateFrom} onChange={handleFilter} />
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <input type="date" name="issueDateTo" value={filters.issueDateTo} onChange={handleFilter} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DUE</span>
          <input type="date" name="dueDateFrom" value={filters.dueDateFrom} onChange={handleFilter} />
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <input type="date" name="dueDateTo" value={filters.dueDateTo} onChange={handleFilter} />
        </div>

        <Btn variant="secondary" onClick={() => { setFilters({ status:'',customer:'',issueDateFrom:'',issueDateTo:'',dueDateFrom:'',dueDateTo:'' }); setPage(1); }}>
          Clear
        </Btn>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
              {[
                { label: 'Invoice ID', field: null },
                { label: 'Customer', field: null },
                { label: 'Status', field: null },
                { label: 'Issue Date', field: 'issueDate' },
                { label: 'Due Date', field: 'dueDate' },
                { label: 'Amount', field: 'amount' },
                { label: 'Total', field: null },
                { label: '', field: null },
              ].map(({ label, field }) => (
                <th key={label}
                  onClick={() => field && handleSort(field)}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    cursor: field ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}>
                  {label}{field && <SortArrow field={field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found.</td></tr>
            ) : data.map((inv, i) => (
              <tr key={inv._id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-panel)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-panel)'}
              >
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {inv.invoiceId}
                </td>
                <td style={{ padding: '10px 14px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 500 }}>{inv.customer}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inv.company}</div>
                </td>
                <td style={{ padding: '10px 14px' }}><StatusBadge status={inv.status} /></td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{fmtDate(inv.issueDate)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{fmtDate(inv.dueDate)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{fmt(inv.amount)}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500 }}>{fmt(inv.total)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate(`/invoices/${inv._id}/edit`)}
                      style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 6px', fontFamily: 'var(--font-sans)' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(inv._id)}
                      style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', padding: '2px 6px', fontFamily: 'var(--font-sans)' }}>
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Page {page} of {totalPages} · {total} records
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Btn>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Btn>
        </div>
      </div>
    </div>
  );
}
