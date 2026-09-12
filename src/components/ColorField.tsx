interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}
export function ColorField({ label, value, onChange }: Props) {
  return (
    <label className="color-field">
      <span className="color-dot" style={{ background: value }}>
        <input
          aria-label={`${label} color`}
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
