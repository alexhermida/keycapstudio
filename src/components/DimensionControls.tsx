import { DIMENSION_LIMITS, type OemDimensions } from '../geometry/config';
import { useI18n } from '../i18n';
import { useState } from 'react';

function MeasurementInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string>();
  return (
    <input
      aria-label={`${label} (mm)`}
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft ?? value}
      onFocus={() => setDraft(String(value))}
      onBlur={() => setDraft(undefined)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        const next = event.target.valueAsNumber;
        if (Number.isFinite(next) && next >= min && next <= max) onChange(next);
      }}
    />
  );
}

const labels = {
  width: 'baseWidth',
  depth: 'baseDepth',
  frontHeight: 'frontHeight',
  rearHeight: 'rearHeight',
  radius: 'cornerRadius',
} as const;

export function DimensionControls({
  dimensions,
  defaults,
  customized,
  onChange,
}: {
  dimensions: OemDimensions;
  defaults: OemDimensions;
  customized: boolean;
  onChange: (dimensions: OemDimensions) => void;
}) {
  const { t, number } = useI18n();
  return (
    <section className="control-section">
      <details className="dimension-controls">
        <summary>
          {t('customizeDimensions')}
          {customized ? ` · ${t('customized')}` : ''}
        </summary>
        <p className="field-help">{t('dimensionsHelp')}</p>
        {(Object.keys(labels) as (keyof OemDimensions)[]).map((key) => {
          const limits = DIMENSION_LIMITS[key];
          const min = key === 'width' ? defaults.width - 0.5 : limits.min;
          const max = key === 'width' ? defaults.width + 0.5 : limits.max;
          return (
            <div key={key}>
              <div className="measure-control">
                <label htmlFor={`dimension-${key}`}>{t(labels[key])}</label>
                <output htmlFor={`dimension-${key}`}>{number(dimensions[key], 2)} mm</output>
              </div>
              <input
                id={`dimension-${key}`}
                type="range"
                min={min}
                max={max}
                step={limits.step}
                value={dimensions[key]}
                onChange={(event) => onChange({ ...dimensions, [key]: Number(event.target.value) })}
              />
              <MeasurementInput
                label={t(labels[key])}
                min={min}
                max={max}
                step={limits.step}
                value={dimensions[key]}
                onChange={(value) => onChange({ ...dimensions, [key]: value })}
              />
            </div>
          );
        })}
        <button
          className="reset-measures"
          type="button"
          disabled={!customized}
          onClick={() => onChange(defaults)}
        >
          {t('reset')}
        </button>
      </details>
    </section>
  );
}
