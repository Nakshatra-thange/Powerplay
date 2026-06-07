import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoice, createInvoice, updateInvoice } from '../api/invoices';
import { getCustomers } from '../api/customers';
import PageHeader from '../components/PageHeader';
import Btn from '../components/Btn';

const TAX_RATES = [0, 3, 5, 18, 28];
const STATUSES  = ['Draft', 'Sent', 'Unpaid', 'Overdue', 'Paid', 'Void'];

const EMPTY = {
  customerId: '', amount: '', taxRate: '18',
  status: 'Draft', issueDate: '', dueDate: '',
};

export default function InvoiceFormPage({ mode = 'create' }) {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const [form, setForm]         = useState(EMPTY);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  // Live computed values
  const amount  = parseFloat(form.amount) || 0;
  const taxRate = parseInt(form.taxRate) || 0;
  const tax     = parseFloat(((amount * taxRate) / 100).toFixed(2));
  const total   = parseFloat((amount + tax).toFixed(2));

  useEffect(() => { getCustomers().then(setCustomers); }, []);

  useEffect(() => {
    if (mode === 'edit' && id) {
      getInvoice(id).then(inv => {
        setForm({
          customerId: inv.customerId,
          amount:     inv.amount,
          taxRate:    inv.taxRate,
          status:     inv.status,
          issueDate:  inv.issueDate?.slice(0, 10) || '',
          dueDate:    inv.dueDate?.slice(0, 10) || '',
        });
      });
    }
  }, [mode, id]);

  const validate = () => {
    const e = {};
    if (!form.customerId) e.customerId = 'Required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) < 0) e.amount = 'Must be a non-negative number';
    if (!form.issueDate) e.issueDate = 'Required';
    if (!form.dueDate)   e.dueDate   = 'Required';
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      if (mode === 'create') {
        await createInvoice(form);
      } else {
        await updateInvoice(id, form);
      }
      navigate('/invoices');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, children, hint }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {errors[name] && <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{errors[name]}</span>}
      {hint && !errors[name] && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );

  return (
    <div>
      <PageHeader
        subtitle={mode === 'create' ? 'New Record' : 'Edit Record'}
        title={mode === 'create' ? 'Create Invoice' : 'Edit Invoice'}
      />

      <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <Field label="Customer" name="customerId">
          <select name="customerId" value={form.customerId} onChange={handleChange}>
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name} · {c.company}</option>
            ))}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Amount (₹)" name="amount">
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
          </Field>

          <Field label="Tax Rate" name="taxRate">
            <select name="taxRate" value={form.taxRate} onChange={handleChange}>
              {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </Field>
        </div>

        {/* Live calculation */}
        {amount > 0 && (
          <div style={{
            padding: '16px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            display: 'flex',
            gap: '32px',
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '4px' }}>TAX</div>
              <div>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '4px' }}>TOTAL</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        )}

        <Field label="Status" name="status">
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Issue Date" name="issueDate">
            <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} />
          </Field>
          <Field label="Due Date" name="dueDate">
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
          </Field>
        </div>

        {errors.submit && (
          <div style={{ padding: '12px', background: 'var(--accent-light)', border: '1px solid var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' }}>
            {errors.submit}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <Btn onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : mode === 'create' ? 'Create Invoice' : 'Save Changes'}
          </Btn>
          <Btn variant="secondary" onClick={() => navigate('/invoices')}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}