import { lazy, Suspense, useRef, useState } from 'react';
import { ColorField } from './components/ColorField';
import { useKeycap } from './hooks/useKeycap';
import { KEYCAP, OEM_CUSTOMIZATION } from './geometry/config';
import { DEFAULT_VARIANT_ID, getVariant, KEY_VARIANTS } from './geometry/variants';
import type { Artwork } from './geometry/types';
import { EXAMPLES } from './examples';

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
  const [artwork, setArtwork] = useState(INITIAL);
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
  const [notice, setNotice] = useState('');
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
  const problem = inputError || error;
  const busy = pending || reading;
  const customized = radiusMm !== 1 || heightDeltaMm !== 0;

  async function load(source: string | File, label: string) {
    const version = ++readVersion.current;
    setReading(true);
    setInputError('');
    setNotice('');
    try {
      if (
        source instanceof File &&
        (!source.name.toLowerCase().endsWith('.svg') || source.size > 150_000)
      )
        throw new Error('Choose an SVG file smaller than 150 KB.');
      const text = typeof source === 'string' ? source : await source.text();
      const { parseArtwork } = await import('./svg/parse');
      const parsed = parseArtwork(text);
      if (version !== readVersion.current) return;
      setArtwork(parsed);
      setName(label);
      if (parsed.sourceColor) setLegendColor(parsed.sourceColor);
    } catch (e) {
      if (version === readVersion.current)
        setInputError(e instanceof Error ? e.message : 'Could not read this file.');
    } finally {
      if (version === readVersion.current) setReading(false);
    }
  }

  async function download() {
    if (!model || busy || problem) return;
    setDownloading(true);
    setNotice('');
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
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setNotice('Downloaded. Open the 3MF in your slicer and assign a filament to each part.');
    } catch {
      setNotice('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="./" aria-label="Keycap Studio home">
          <span className="brand-key" aria-hidden="true">
            k.
          </span>
          <span>
            keycap<span className="brand-light">studio</span>
          </span>
        </a>
        <span className="header-note">
          <span className="privacy-dot" /> Made here. Stays here.
        </span>
        <span className="version-tag">EARLY ACCESS · V0.1</span>
      </header>
      <main>
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">A SMALL KEY. YOUR OWN MARK.</p>
            <h1>Make it yours.</h1>
          </div>
          <p>
            One icon. Two colors.
            <br />A keycap ready for your next print.
          </p>
        </div>
        <div className="workspace">
          <aside className="editor" aria-label="Keycap settings">
            <div className="preset">
              <span className="preset-icon" aria-hidden="true">
                ⌘
              </span>
              <div>
                <strong>OEM profile</strong>
                <span>MX-compatible · row and width below</span>
              </div>
              <span className="preset-badge">ACTIVE</span>
            </div>
            <section className="control-section">
              <div className="section-title">
                <span className="step">01</span>
                <h2>Choose your key</h2>
              </div>
              <div className="key-fields">
                <label>
                  OEM row
                  <select
                    aria-label="OEM row"
                    value={variant.row}
                    onChange={(event) => {
                      const row = Number(event.target.value);
                      const next =
                        KEY_VARIANTS.find(
                          (candidate) => candidate.row === row && candidate.width === variant.width,
                        ) ?? KEY_VARIANTS.find((candidate) => candidate.row === row);
                      if (next) setVariantId(next.id);
                      setNotice('');
                    }}
                  >
                    {rows.map((row) => (
                      <option key={row} value={row}>
                        Row {row}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Key width
                  <select
                    aria-label="Key width"
                    value={variantId}
                    onChange={(event) => {
                      setVariantId(event.target.value);
                      setNotice('');
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
                  ? 'One printed sample passed the K2 lighting-key fit checks.'
                  : 'Experimental size or shape: fit and print quality vary by choice.'}
              </p>
            </section>
            <section className="control-section">
              <div className="section-title">
                <span className="step">02</span>
                <h2>Shape and height</h2>
                <button
                  className="reset-measures"
                  type="button"
                  disabled={!customized}
                  onClick={() => {
                    setRadiusMm(1);
                    setHeightDeltaMm(0);
                    setNotice('');
                  }}
                >
                  Reset
                </button>
              </div>
              <div className="measure-control">
                <label htmlFor="corner-radius">Corner radius</label>
                <output htmlFor="corner-radius">{radiusMm.toFixed(2)} mm</output>
              </div>
              <input
                id="corner-radius"
                type="range"
                min={OEM_CUSTOMIZATION.radiusMin}
                max={OEM_CUSTOMIZATION.radiusMax}
                step={OEM_CUSTOMIZATION.step}
                value={radiusMm}
                onChange={(event) => {
                  setRadiusMm(Number(event.target.value));
                  setNotice('');
                }}
              />
              <div className="range-labels">
                <span>Squarer · 0.50</span>
                <span>Rounder · 1.50 mm</span>
              </div>
              <div className="measure-control">
                <label htmlFor="height-delta">Height adjustment</label>
                <output htmlFor="height-delta">
                  {heightDeltaMm > 0 ? '+' : ''}
                  {heightDeltaMm.toFixed(2)} mm
                </output>
              </div>
              <input
                id="height-delta"
                type="range"
                min={OEM_CUSTOMIZATION.heightMin}
                max={OEM_CUSTOMIZATION.heightMax}
                step={OEM_CUSTOMIZATION.step}
                value={heightDeltaMm}
                onChange={(event) => {
                  setHeightDeltaMm(Number(event.target.value));
                  setNotice('');
                }}
              />
              <div className="range-labels">
                <span>−0.50 mm</span>
                <span>+0.50 mm</span>
              </div>
              <p className="field-help">
                {heightDeltaMm === 0 ? 'OEM row height' : 'OEM derived height'} · 0.25 mm steps.
                Relative to the selected OEM row. Modified measurements are experimental.
              </p>
            </section>
            <section className="control-section">
              <div className="section-title">
                <span className="step">03</span>
                <h2>Your icon</h2>
              </div>
              <input
                ref={fileInput}
                className="file-input"
                type="file"
                accept=".svg,image/svg+xml"
                aria-label="Upload SVG"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void load(file, file.name);
                  e.target.value = '';
                }}
              />
              <button
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) void load(file, file.name);
                }}
              >
                <UploadIcon />
                <strong>Drop your SVG here</strong>
                <span>or click to browse · up to 150 KB</span>
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
                <span>Try an example</span>
                <button onClick={() => void load(EXAMPLES.spark, 'Spark · example')}>Spark</button>
                <button onClick={() => void load(EXAMPLES.orbit, 'Orbit · example')}>Orbit</button>
              </div>
              <p className="field-help">
                Filled paths only. Convert outlines to paths before uploading.
              </p>
            </section>
            <section className="control-section">
              <div className="section-title">
                <span className="step">04</span>
                <h2>Legend size</h2>
                <output htmlFor="legend-size">
                  {size.toFixed(1)} <small>mm</small>
                </output>
              </div>
              <input
                id="legend-size"
                aria-label="Legend size"
                type="range"
                min={KEYCAP.minLegendSize}
                max={KEYCAP.maxLegendSize}
                step="0.1"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setNotice('');
                }}
              />
              <div className="range-labels">
                <span>3 mm</span>
                <span>11 mm</span>
              </div>
              <p className="field-help">Centered, with proportions preserved.</p>
            </section>
            <section className="control-section colors-section">
              <div className="section-title">
                <span className="step">05</span>
                <h2>Make it two-tone</h2>
              </div>
              <div className="color-fields">
                <ColorField label="Body" value={bodyColor} onChange={setBodyColor} />
                <ColorField label="Legend" value={legendColor} onChange={setLegendColor} />
              </div>
              <p className="field-help">Choose matching filaments in your slicer.</p>
            </section>
          </aside>
          <section className="preview-panel" aria-label="3D preview">
            <div className="preview-topline">
              <span className="preview-label">YOUR KEYCAP</span>
              <span className="model-state" role="status">
                <span className={`state-dot ${busy ? 'working' : ''}`} />
                {problem ? 'Needs attention' : busy ? 'Generating model…' : 'Model ready'}
              </span>
            </div>
            <div className={`preview-stage ${busy || problem ? 'preview-muted' : ''}`}>
              <Suspense fallback={<div className="preview-fallback">Loading preview…</div>}>
                <Preview model={model} bodyColor={bodyColor} legendColor={legendColor} />
              </Suspense>
              <div className="stage-shadow" />
            </div>
            {problem ? (
              <div className="problem" role="alert">
                <strong>Let’s fix that</strong>
                <p>{problem}</p>
                {error ? <button onClick={retry}>Try again</button> : null}
              </div>
            ) : null}
            <div className="preview-footnote">
              <span>Drag to orbit · scroll to zoom</span>
              <span>
                {heightDeltaMm === 0 ? 'OEM' : 'OEM derived'} row {variant.row} · {variant.width}u
              </span>
            </div>
            <div className="export-bar">
              <div className="export-details">
                <strong>One keycap. Two parts.</strong>
                <span>Body + Legend · 0.5 mm flush inlay</span>
              </div>
              <button
                className="download-button"
                disabled={!model || busy || !!problem || downloading}
                onClick={() => void download()}
              >
                {downloading ? 'Preparing…' : 'Download 3MF'}
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </section>
        </div>
        <div className="below-workspace">
          <p>
            <span aria-hidden="true">↳</span> First print? This profile is experimental. Check stem
            fit and key travel before regular use.
          </p>
          <p>No uploads to a server. No saved projects.</p>
        </div>
        {notice ? (
          <p className="download-notice" role="status">
            {notice}
          </p>
        ) : null}
        <details className="print-guide">
          <summary>Before you print</summary>
          <div>
            <p>
              Open the 3MF as a model in OrcaSlicer or Snapmaker Orca. Expand{' '}
              <strong>Custom Keycap</strong> and assign filaments to <strong>Body</strong> and{' '}
              <strong>Legend</strong>. Keep both parts assembled.
            </p>
            <p>
              The cap has a curved top and a hollow underside. Choose orientation and supports in
              the slicer; inspect the layer preview for thin details and supports inside the socket.
              Color previews do not guarantee filament color or printability.
            </p>
            <p>
              Print one calibration cap first. Let it cool, check that the socket seats without
              force, and confirm that the key moves fully and returns freely. Avoid forcing a tight
              socket.
            </p>
          </div>
        </details>
      </main>
      <footer>
        <span>KEYCAP STUDIO</span>
        <span>Small object. Personal touch.</span>
        <span>OEM keycaps, made locally.</span>
      </footer>
    </div>
  );
}
