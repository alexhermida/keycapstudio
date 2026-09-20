import { lazy, Suspense, useRef, useState } from 'react';
import { ColorField } from './components/ColorField';
import { HelpDialog } from './components/HelpDialog';
import { LanguageSelector } from './components/LanguageSelector';
import { useKeycap } from './hooks/useKeycap';
import { KEYCAP, OEM_CUSTOMIZATION } from './geometry/config';
import { DEFAULT_VARIANT_ID, getVariant, KEY_VARIANTS } from './geometry/variants';
import type { Artwork } from './geometry/types';
import { EXAMPLES } from './examples';
import { errorMessage, useI18n } from './i18n';
import githubMark from './assets/brand/github.svg';
import coffeeMark from './assets/brand/buymeacoffee.svg';

const Preview = lazy(() => import('./components/Preview'));
const INITIAL: Artwork = {
  aspectRatio: 63 / 90,
  sourceColor: '#79a95b',
  paths: [
    {
      fillRule: 'NonZero',
      contours: [
        [
          [55, 5],
          [19, 57],
          [44, 57],
          [36, 95],
          [82, 40],
          [55, 40],
        ].map(([x, y]) => [(x - 50.5) / 90, -(y - 50) / 90]),
      ],
    },
  ],
};
function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 16V4m-4 4 4-4 4 4M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

export default function App() {
  const { t, number } = useI18n();
  const [artwork, setArtwork] = useState<Artwork>(INITIAL);
  const [name, setName] = useState('Spark · example');
  const [size, setSize] = useState<number>(KEYCAP.defaultLegendSize);
  const [variantId, setVariantId] = useState(DEFAULT_VARIANT_ID);
  const [radiusMm, setRadiusMm] = useState<number>(OEM_CUSTOMIZATION.radiusDefault);
  const [heightDeltaMm, setHeightDeltaMm] = useState<number>(OEM_CUSTOMIZATION.heightDefault);
  const [bodyColor, setBodyColor] = useState('#eeeae1');
  const [legendColor, setLegendColor] = useState('#527b48');
  const [inputError, setInputError] = useState('');
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<'downloaded' | 'downloadFailed'>();
  const [help, setHelp] = useState<{ open: boolean; section: 'privacy' | 'printing' }>({
    open: false,
    section: 'privacy',
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const readVersion = useRef(0);
  const { model, pending, error, retry } = useKeycap(
    artwork,
    size,
    variantId,
    radiusMm,
    heightDeltaMm,
  );
  const variant = getVariant(variantId);
  const rows = [...new Set(KEY_VARIANTS.map((candidate) => candidate.row))];
  const widths = KEY_VARIANTS.filter((candidate) => candidate.row === variant.row);
  const problem = errorMessage(inputError || error, t);
  const busy = pending || reading;
  const customized = radiusMm !== 1 || heightDeltaMm !== 0;
  const showHelp = (section: 'privacy' | 'printing') => setHelp({ open: true, section });
  const clearNotice = () => setNotice(undefined);
  async function load(source: string | File, label: string) {
    const version = ++readVersion.current;
    setReading(true);
    setInputError('');
    clearNotice();
    try {
      if (
        source instanceof File &&
        (!source.name.toLowerCase().endsWith('.svg') || source.size > 150_000)
      )
        throw new Error('SVG is too large.');
      const sourceText = typeof source === 'string' ? source : await source.text();
      const { parseArtwork } = await import('./svg/parse');
      const parsed = parseArtwork(sourceText);
      if (version !== readVersion.current) return;
      setArtwork(parsed);
      setName(label);
      if (parsed.sourceColor) setLegendColor(parsed.sourceColor);
    } catch (caught) {
      if (version === readVersion.current)
        setInputError(caught instanceof Error ? caught.message : t('fileRead'));
    } finally {
      if (version === readVersion.current) setReading(false);
    }
  }
  async function download() {
    if (!model || busy || problem) return;
    setDownloading(true);
    clearNotice();
    try {
      const { exportThreeMf } = await import('./export/threeMf');
      const bytes = exportThreeMf(model, bodyColor, legendColor);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'model/3mf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'custom-keycap.3mf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setNotice('downloaded');
    } catch {
      setNotice('downloadFailed');
    } finally {
      setDownloading(false);
    }
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="./" aria-label={t('home')}>
          <span className="brand-key" aria-hidden="true">
            k.
          </span>
          <span>
            keycap<span className="brand-light">studio</span>
          </span>
        </a>
        <span className="header-note">
          <span className="privacy-dot" /> {t('madeHere')}
        </span>
        <span className="version-tag">{t('earlyAccess')}</span>
        <nav className="header-links" aria-label={t('projectLinks')}>
          <button
            className="header-link header-link-help"
            type="button"
            onClick={() => showHelp('privacy')}
          >
            {t('help')}
          </button>
          <LanguageSelector />
          <a
            className="header-link header-link-github"
            href="https://github.com/alexhermida/keycapstudio"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className="brand-icon brand-icon-github" src={githubMark} alt="" />
            GitHub
          </a>
          <a
            className="header-link header-link-coffee"
            href="https://buymeacoffee.com/dvd16"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('coffee')}
          >
            <img className="brand-icon" src={coffeeMark} alt="" />
            {t('coffee')}
          </a>
        </nav>
      </header>
      <main>
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1>{t('title')}</h1>
          </div>
          <p>
            {t('headingCopy')
              .split('\n')
              .map((line, index) => (
                <span key={line}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
          </p>
        </div>
        <div className="workspace">
          <aside className="editor" aria-label={t('settings')}>
            <div className="preset">
              <span className="preset-icon" aria-hidden="true">
                ⌘
              </span>
              <div>
                <strong>{t('oemProfile')}</strong>
                <span>{t('mxCompatible')}</span>
              </div>
              <span className="preset-badge">{t('active')}</span>
            </div>
            <section className="control-section">
              <div className="section-title">
                <span className="step">01</span>
                <h2>{t('chooseKey')}</h2>
              </div>
              <div className="key-fields">
                <label>
                  {t('oemRow')}
                  <select
                    aria-label={t('oemRow')}
                    value={variant.row}
                    onChange={(event) => {
                      const row = Number(event.target.value);
                      const next =
                        KEY_VARIANTS.find(
                          (candidate) => candidate.row === row && candidate.width === variant.width,
                        ) ?? KEY_VARIANTS.find((candidate) => candidate.row === row);
                      if (next) setVariantId(next.id);
                      clearNotice();
                    }}
                  >
                    {rows.map((row) => (
                      <option key={row} value={row}>
                        {t('row')} {row}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('keyWidth')}
                  <select
                    aria-label={t('keyWidth')}
                    value={variantId}
                    onChange={(event) => {
                      setVariantId(event.target.value);
                      clearNotice();
                    }}
                  >
                    {widths.map((choice) => (
                      <option key={choice.id} value={choice.id}>
                        {choice.width}u
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="field-help">
                {variant.physicalStatus === 'sample-checked' && !customized
                  ? t('checkedFit')
                  : t('experimental')}
              </p>
            </section>
            <section className="control-section">
              <div className="section-title">
                <span className="step">02</span>
                <h2>{t('shapeHeight')}</h2>
                <button
                  className="reset-measures"
                  type="button"
                  disabled={!customized}
                  onClick={() => {
                    setRadiusMm(1);
                    setHeightDeltaMm(0);
                    clearNotice();
                  }}
                >
                  {t('reset')}
                </button>
              </div>
              <div className="measure-control">
                <label htmlFor="corner-radius">{t('cornerRadius')}</label>
                <output htmlFor="corner-radius">{number(radiusMm, 2)} mm</output>
              </div>
              <input
                id="corner-radius"
                aria-label={t('cornerRadius')}
                type="range"
                min={OEM_CUSTOMIZATION.radiusMin}
                max={OEM_CUSTOMIZATION.radiusMax}
                step={OEM_CUSTOMIZATION.step}
                value={radiusMm}
                onChange={(event) => {
                  setRadiusMm(Number(event.target.value));
                  clearNotice();
                }}
              />
              <div className="range-labels">
                <span>{t('squarer')} · 0.50</span>
                <span>{t('rounder')} · 1.50 mm</span>
              </div>
              <div className="measure-control">
                <label htmlFor="height-delta">{t('heightAdjustment')}</label>
                <output htmlFor="height-delta">
                  {heightDeltaMm > 0 ? '+' : ''}
                  {number(heightDeltaMm, 2)} mm
                </output>
              </div>
              <input
                id="height-delta"
                aria-label={t('heightAdjustment')}
                type="range"
                min={OEM_CUSTOMIZATION.heightMin}
                max={OEM_CUSTOMIZATION.heightMax}
                step={OEM_CUSTOMIZATION.step}
                value={heightDeltaMm}
                onChange={(event) => {
                  setHeightDeltaMm(Number(event.target.value));
                  clearNotice();
                }}
              />
              <div className="range-labels">
                <span>−0.50 mm</span>
                <span>+0.50 mm</span>
              </div>
              <p className="field-help">
                {heightDeltaMm === 0 ? t('oemRowHeight') : t('oemDerivedHeight')} ·{' '}
                {t('heightHelp')}
              </p>
            </section>
            <section className="control-section">
              <div className="section-title">
                <span className="step">03</span>
                <h2>{t('icon')}</h2>
              </div>
              <input
                ref={fileInput}
                className="file-input"
                type="file"
                accept=".svg,image/svg+xml"
                aria-label={t('uploadSvg')}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void load(file, file.name);
                  event.target.value = '';
                }}
              />
              <button
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onClick={() => fileInput.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  const file = event.dataTransfer.files[0];
                  if (file) void load(file, file.name);
                }}
              >
                <UploadIcon />
                <strong>{t('dropSvg')}</strong>
                <span>{t('browseSvg')}</span>
              </button>
              <div className="file-status">
                <span className="file-symbol" aria-hidden="true">
                  ◈
                </span>
                <span title={name}>{name}</span>
                <span className="file-check" aria-hidden="true">
                  ✓
                </span>
              </div>
              <div className="examples">
                <span>{t('example')}</span>
                <button onClick={() => void load(EXAMPLES.spark, 'Spark · example')}>Spark</button>
                <button onClick={() => void load(EXAMPLES.orbit, 'Orbit · example')}>Orbit</button>
              </div>
              <p className="field-help">{t('filledPaths')}</p>
            </section>
            <section className="control-section">
              <div className="section-title">
                <span className="step">04</span>
                <h2>{t('legendSize')}</h2>
                <output htmlFor="legend-size">
                  {number(size)} <small>mm</small>
                </output>
              </div>
              <input
                id="legend-size"
                aria-label={t('legendSize')}
                type="range"
                min={KEYCAP.minLegendSize}
                max={KEYCAP.maxLegendSize}
                step="0.1"
                value={size}
                onChange={(event) => {
                  setSize(Number(event.target.value));
                  clearNotice();
                }}
              />
              <div className="range-labels">
                <span>3 mm</span>
                <span>11 mm</span>
              </div>
              <p className="field-help">{t('legendHelp')}</p>
            </section>
            <section className="control-section colors-section">
              <div className="section-title">
                <span className="step">05</span>
                <h2>{t('twoTone')}</h2>
              </div>
              <div className="color-fields">
                <ColorField
                  label={t('body')}
                  accessibleLabel={t('bodyColor')}
                  value={bodyColor}
                  onChange={setBodyColor}
                />
                <ColorField
                  label={t('legend')}
                  accessibleLabel={t('legendColor')}
                  value={legendColor}
                  onChange={setLegendColor}
                />
              </div>
              <p className="field-help">{t('filamentHelp')}</p>
            </section>
          </aside>
          <section className="preview-panel" aria-label={t('preview')}>
            <div className="preview-topline">
              <span className="preview-label">{t('yourKeycap')}</span>
              <span className="model-state" role="status">
                <span className={`state-dot ${busy ? 'working' : ''}`} />
                {problem ? t('needsAttention') : busy ? t('generating') : t('ready')}
              </span>
            </div>
            <div className={`preview-stage ${busy || problem ? 'preview-muted' : ''}`}>
              <Suspense fallback={<div className="preview-fallback">{t('loadingPreview')}</div>}>
                <Preview model={model} bodyColor={bodyColor} legendColor={legendColor} />
              </Suspense>
              <div className="stage-shadow" />
            </div>
            {problem && (
              <div className="problem" role="alert">
                <strong>{t('fix')}</strong>
                <p>{problem}</p>
                {error && <button onClick={retry}>{t('retry')}</button>}
              </div>
            )}
            <div className="preview-footnote">
              <span>{t('orbitZoom')}</span>
              <span>
                {heightDeltaMm === 0 ? 'OEM' : t('oemDerived')} {t('row').toLowerCase()}{' '}
                {variant.row} · {variant.width}u
              </span>
            </div>
            <div className="export-bar">
              <div className="export-details">
                <strong>{t('partsTitle')}</strong>
                <span>{t('partsDetail')}</span>
                <button className="print-link" type="button" onClick={() => showHelp('printing')}>
                  {t('printingHelp')}
                </button>
              </div>
              <button
                className="download-button"
                disabled={!model || busy || !!problem || downloading}
                onClick={() => void download()}
              >
                {downloading ? t('preparing') : t('download')}
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </section>
        </div>
        <div className="below-workspace">
          <p>
            <span aria-hidden="true">↳</span>
            {t('firstPrint')}
          </p>
          <p>
            <button className="privacy-link" type="button" onClick={() => showHelp('privacy')}>
              {t('privacyShort')}
            </button>
          </p>
        </div>
        {notice && (
          <p className="download-notice" role="status">
            {t(notice)}
          </p>
        )}
      </main>
      <footer>
        <span>KEYCAP STUDIO</span>
        <span>{t('footer')}</span>
        <span>{t('localMade')}</span>
      </footer>
      <HelpDialog
        open={help.open}
        section={help.section}
        onClose={() => setHelp((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
