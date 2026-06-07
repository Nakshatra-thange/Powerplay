import { NavLink } from 'react-router-dom';

const links = [
  { to: '/invoices', label: 'Invoices', code: '01' },
  { to: '/customers', label: 'Customers', code: '02' },
  { to: '/invoices/new', label: 'New Invoice', code: '03' },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: '200px',
      minHeight: '100vh',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
        }}>
          Invoice<br />Dashboard
        </div>
        <div style={{
          width: '20px',
          height: '1px',
          background: 'var(--accent)',
          marginTop: '8px',
        }} />
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
        {links.map(({ to, label, code }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: isActive ? 'var(--bg)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {code}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Decorative dots */}
      <div style={{ marginTop: 'auto', padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 4px)',
          gap: '5px',
        }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} style={{
              width: '3px', height: '3px',
              borderRadius: '50%',
              background: 'var(--border)',
            }} />
          ))}
        </div>
      </div>
    </aside>
  );
}