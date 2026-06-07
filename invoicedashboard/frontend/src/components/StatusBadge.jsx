const STATUS_STYLES = {
    Paid:    { bg: '#E8F0E8', color: '#3A6B3A' },
    Overdue: { bg: '#F0E8E5', color: '#C4614A' },
    Sent:    { bg: '#E8EBF0', color: '#3A4F6B' },
    Unpaid:  { bg: '#F0EDE8', color: '#6B5A3A' },
    Void:    { bg: '#ECEAE4', color: '#6B6860' },
    Draft:   { bg: '#ECEAE4', color: '#6B6860' },
  };
  
  export default function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.Draft;
    return (
      <span style={{
        display: 'inline-block',
        padding: '3px 8px',
        background: s.bg,
        color: s.color,
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {status}
      </span>
    );
  }