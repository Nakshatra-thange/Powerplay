export default function PageHeader({ title, subtitle, action }) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            {subtitle}
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            {title}
          </h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }