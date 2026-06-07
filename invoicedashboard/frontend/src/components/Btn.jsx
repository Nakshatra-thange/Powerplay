export default function Btn({ children, onClick, variant = 'primary', type = 'button', disabled }) {
    const styles = {
      primary: {
        background: 'var(--text-primary)',
        color: 'var(--bg)',
        border: '1px solid var(--text-primary)',
      },
      secondary: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
      },
      danger: {
        background: 'transparent',
        color: 'var(--accent)',
        border: '1px solid var(--accent)',
      },
    };
  
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{
          ...styles[variant],
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-sans)',
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {children}
      </button>
    );
  }