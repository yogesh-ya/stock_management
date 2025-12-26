import { theme } from './theme';

export const pageStyle = {
  minHeight: '100vh',
  padding: '30px',
  background: `linear-gradient(135deg, ${theme.colors.bg}, #0f172a)`,
  color: theme.colors.text,
  fontFamily: 'Inter, system-ui, sans-serif',
};

export const cardStyle = {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.radius.lg,
  padding: '24px',
  boxShadow: theme.shadow.card,
  marginBottom: '24px',
};

export const labelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: theme.colors.muted,
  marginBottom: '6px',
  display: 'block',
};

export const inputStyle = {
  width: '100%',
  padding: theme.input.padding,
  fontSize: theme.input.fontSize,
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border}`,
  backgroundColor: theme.colors.bg,
  color: theme.colors.text,
  outline: 'none',
};

export const primaryButton = {
  padding: '12px 22px',
  background: theme.colors.primary,
  border: 'none',
  borderRadius: theme.radius.md,
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};
