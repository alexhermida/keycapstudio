import { useState } from 'react';
import { STEM_FIT, validateStemFitDeltaMm } from '../geometry/config';
import { useI18n } from '../i18n';

export function StemFitControls({
  value,
  onChange,
  onPrintTest,
  preparingTest,
}: {
  value: number;
  onChange: (value: number) => void;
  onPrintTest: () => void;
  preparingTest: boolean;
}) {
  const { t, number } = useI18n();
  const [draft, setDraft] = useState<string>();
  const change = (next: number) => {
    try {
      const rounded = Number(next.toFixed(2));
      validateStemFitDeltaMm(rounded);
      onChange(rounded);
    } catch {
      // A partial numeric draft stays visible until the field loses focus.
    }
  };
  return (
    <section className="control-section">
      <details className="stem-fit-controls">
        <summary>{t('stemFit')}</summary>
        <p className="field-help">{t('stemFitExplanation')}</p>
        <div className="stem-fit-row">
          <button
            type="button"
            aria-label={t('stemFitMinus')}
            disabled={value <= STEM_FIT.minMm}
            onClick={() => change(value - STEM_FIT.stepMm)}
          >
            −
          </button>
          <label>
            {t('stemFitMm')}
            <input
              type="number"
              min={STEM_FIT.minMm}
              max={STEM_FIT.maxMm}
              step={STEM_FIT.stepMm}
              value={draft ?? value.toFixed(2)}
              onFocus={() => setDraft(value.toFixed(2))}
              onBlur={() => setDraft(undefined)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
              onChange={(event) => {
                setDraft(event.target.value);
                change(event.target.valueAsNumber);
              }}
            />
          </label>
          <button
            type="button"
            aria-label={t('stemFitPlus')}
            disabled={value >= STEM_FIT.maxMm}
            onClick={() => change(value + STEM_FIT.stepMm)}
          >
            +
          </button>
        </div>
        <p className="stem-fit-status" role="status">
          {value < 0 ? t('tighter') : value > 0 ? t('looser') : t('reference')} · {number(value, 2)}{' '}
          mm
        </p>
        {value !== 0 && <p className="stem-fit-warning">{t('stemFitWarning')}</p>}
        <div className="stem-fit-actions">
          <button type="button" disabled={value === 0} onClick={() => onChange(0)}>
            {t('stemFitReset')}
          </button>
          <button type="button" disabled={preparingTest} onClick={onPrintTest}>
            {preparingTest ? t('preparingTest') : t('printStemFitTest')}
          </button>
        </div>
      </details>
    </section>
  );
}
