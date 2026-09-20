interface Props {
  label: string;
  accessibleLabel: string;
  value: string;
  onChange: (value: string) => void;
}
export function ColorField({ label, accessibleLabel, value, onChange }: Props) {
  return (
    <label className="color-field">
      <span className="color-dot" style={{ background: value }}>
        <input
          aria-label={accessibleLabel}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
      <span>
        <strong>{label}</strong>
        <span className="color-code">{value.toUpperCase()}</span>
      </span>
      <span className="color-edit" aria-hidden="true">
        ↗
      </span>
    </label>
  );
}
