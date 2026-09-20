import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const LOCALES = ['en', 'gl', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

const en = {
  customizeDimensions: 'Customize measurements',
  customized: 'Customized',
  baseWidth: 'Base width',
  baseDepth: 'Base depth',
  frontHeight: 'Front edge height',
  rearHeight: 'Rear edge height',
  overallDimensions: 'Overall size (width × depth × height)',
  dimensionsHelp:
    'Heights are measured at the center of each top edge, from the base. Front faces you; rear faces the screen. The corners sit higher because of the concave top. Limits are experimental. The switch socket stays unchanged.',
  invalidMeasurements: 'Measurements are outside the supported range.',
  iconTooLarge: 'The icon extends beyond the usable top. Reduce its size.',
  printEvidence:
    'The previous template had sample-level fit feedback. These adjustable profiles need a new fit and travel check; no universal print settings have been validated.',
  language: 'Language',
  help: 'Help',
  close: 'Close',
  projectLinks: 'Project links',
  home: 'Keycap Studio home',
  madeHere: 'Made here. Stays here.',
  earlyAccess: 'EARLY ACCESS · V0.1',
  coffee: 'Buy Me a Coffee',
  eyebrow: 'A SMALL KEY. YOUR OWN MARK.',
  title: 'Make it yours.',
  headingCopy: 'One icon. Two colors.\nA keycap ready for your next print.',
  settings: 'Keycap settings',
  oemProfile: 'OEM profile',
  mxCompatible: 'MX-compatible · row and width below',
  active: 'ACTIVE',
  chooseKey: 'Choose your key',
  oemRow: 'OEM row',
  row: 'Row',
  keyWidth: 'Key width',
  checkedFit: 'One printed sample passed the K2 lighting-key fit checks.',
  experimental: 'Experimental size or shape: fit and print quality vary by choice.',
  shapeHeight: 'Shape and height',
  reset: 'Reset',
  cornerRadius: 'Corner radius',
  squarer: 'Squarer',
  rounder: 'Rounder',
  heightAdjustment: 'Height adjustment',
  oemRowHeight: 'OEM row height',
  oemDerivedHeight: 'OEM derived height',
  oemDerived: 'OEM derived',
  strokeError: 'Convert strokes to filled paths in your SVG editor, then upload again.',
  heightHelp:
    '0.25 mm steps. Relative to the selected OEM row. Modified measurements are experimental.',
  icon: 'Your icon',
  uploadSvg: 'Upload SVG',
  dropSvg: 'Drop your SVG here',
  browseSvg: 'or click to browse · up to 150 KB',
  example: 'Try an example',
  filledPaths: 'Filled paths only. Convert outlines to paths before uploading.',
  legendSize: 'Legend size',
  legendHelp: 'Centered, with proportions preserved.',
  twoTone: 'Make it two-tone',
  body: 'Body',
  legend: 'Legend',
  bodyColor: 'Body color',
  legendColor: 'Legend color',
  filamentHelp: 'Choose matching filaments in your slicer.',
  preview: '3D preview',
  yourKeycap: 'YOUR KEYCAP',
  needsAttention: 'Needs attention',
  generating: 'Generating model…',
  ready: 'Model ready',
  loadingPreview: 'Loading preview…',
  fix: 'Let’s fix that',
  retry: 'Try again',
  orbitZoom: 'Drag to orbit · scroll to zoom',
  partsTitle: 'One keycap. Two parts.',
  partsDetail: 'Body + Legend · 0.5 mm flush inlay',
  preparing: 'Preparing…',
  download: 'Download 3MF',
  firstPrint:
    'First print? This profile is experimental. Check stem fit and key travel before regular use.',
  privacyShort: 'Processed in your browser. Designs are not saved.',
  printingHelp: 'Printing help',
  footer: 'Small object. Personal touch.',
  localMade: 'OEM keycaps, made locally.',
  perspective: '3D view',
  top: 'Top',
  underside: 'Underside',
  previewCamera: 'Preview camera',
  canvasLabel: 'Interactive keycap model. Use the view buttons to inspect the top or underside.',
  previewPaused: '3D preview paused. Reload to restore it.',
  previewUnavailable:
    '3D preview is unavailable in this browser. You can still download the model.',
  privacy: 'Privacy',
  printing: 'Printing',
  privacyText:
    'Your SVG and keycap settings are processed in your browser. The app keeps them only in memory for this session: it does not send them to a server or save them to reopen later. Reloading starts a new design. The 3MF is saved to your device only when you download it.',
  privacyDetail:
    'There are no accounts, analytics, saved designs, or stored language preferences. Your browser may cache website resources; that is different from saving your design.',
  printImport:
    'Import the 3MF as one assembly. Assign filaments to Body and Legend and keep both parts together. The file contains no printer profile or G-code.',
  printOrientation:
    'The exported orientation is for modeling. As a starting point, use your slicer’s Lay on Face command on a broad side, then inspect bed contact. Reapply placement for each new geometry and add supports where the cavity, roof, or socket needs them.',
  printInspect:
    'Inspect layer previews: keep the socket open and check thin legend strokes, seams, and material assignments. Adaptive-width walls improved one comparison but did not remove all tactile relief.',
  printCheck:
    'Print one sample and let it cool. Check gentle insertion, retention, removal, full travel and return, and clearance from nearby keys and the case. Other variants and modified measurements remain experimental.',
  downloaded: 'Downloaded. Open the 3MF in your slicer and assign a filament to each part.',
  downloadFailed: 'Download failed. Please try again.',
  fileTooLarge: 'Choose an SVG file smaller than 150 KB.',
  fileRead: 'Could not read this file.',
  genericError: 'This file could not be used. Try a simpler SVG.',
  engineStart: 'The geometry engine could not start. Reload the page or try another browser.',
  engineTimeout: 'This icon took too long to generate. Simplify its paths and try again.',
  engineUnavailable: 'This browser could not start the geometry engine.',
} as const;

const gl = {
  ...en,
  customizeDimensions: 'Personalizar medidas',
  customized: 'Personalizado',
  baseWidth: 'Ancho da base',
  baseDepth: 'Profundidade da base',
  frontHeight: 'Altura do bordo dianteiro',
  rearHeight: 'Altura do bordo traseiro',
  overallDimensions: 'Tamaño total (ancho × profundidade × alto)',
  dimensionsHelp:
    'As alturas mídense no centro de cada bordo superior, desde a base. Diante mira cara a ti; detrás, cara á pantalla. As esquinas son máis altas pola concavidade. Os límites son experimentais. O aloxamento do switch conserva as súas medidas.',
  invalidMeasurements: 'As medidas están fóra do intervalo admitido.',
  iconTooLarge: 'A icona excede a superficie útil. Reduce o seu tamaño.',
  printEvidence:
    'A plantilla anterior tivo probas de encaixe con mostras. Estes perfís axustables necesitan unha nova comprobación de encaixe e percorrido; non hai axustes de impresión universais validados.',
  language: 'Idioma',
  help: 'Axuda',
  close: 'Pechar',
  projectLinks: 'Ligazóns do proxecto',
  home: 'Inicio de Keycap Studio',
  madeHere: 'Feito aquí. Queda aquí.',
  earlyAccess: 'ACCESO ANTICIPADO · V0.1',
  coffee: 'Convídame a un café',
  eyebrow: 'UNHA TECLA PEQUENA. A TÚA MARCA.',
  title: 'Faina túa.',
  headingCopy: 'Unha icona. Dúas cores.\nUnha tecla lista para a túa próxima impresión.',
  settings: 'Axustes da tecla',
  oemProfile: 'Perfil OEM',
  mxCompatible: 'Compatible con MX · fila e largura abaixo',
  active: 'ACTIVO',
  chooseKey: 'Escolle a túa tecla',
  oemRow: 'Fila OEM',
  row: 'Fila',
  keyWidth: 'Largura da tecla',
  checkedFit: 'Unha mostra impresa superou as comprobacións de encaixe da tecla de iluminación K2.',
  experimental:
    'Tamaño ou forma experimentais: o encaixe e a calidade de impresión varían segundo a opción.',
  shapeHeight: 'Forma e altura',
  reset: 'Restablecer',
  cornerRadius: 'Raio da esquina',
  squarer: 'Máis cadrada',
  rounder: 'Máis redonda',
  heightAdjustment: 'Axuste de altura',
  oemRowHeight: 'Altura de fila OEM',
  oemDerivedHeight: 'Altura derivada de OEM',
  oemDerived: 'Derivada de OEM',
  strokeError:
    'Converte os trazos en trazados con recheo no teu editor SVG e volve subir o ficheiro.',
  heightHelp:
    'Pasos de 0,25 mm. Relativo á fila OEM escollida. As medidas modificadas son experimentais.',
  icon: 'A túa icona',
  uploadSvg: 'Subir SVG',
  dropSvg: 'Solta aquí o teu SVG',
  browseSvg: 'ou preme para escoller · ata 150 KB',
  example: 'Proba un exemplo',
  filledPaths: 'Só trazados con recheo. Converte os contornos en trazados antes de subir.',
  legendSize: 'Tamaño da lenda',
  legendHelp: 'Centrada, mantendo as proporcións.',
  twoTone: 'Dúas cores',
  body: 'Corpo',
  legend: 'Lenda',
  bodyColor: 'Cor do corpo',
  legendColor: 'Cor da lenda',
  filamentHelp: 'Escolle filamentos correspondentes no laminador.',
  preview: 'Vista previa 3D',
  yourKeycap: 'A TÚA TECLA',
  needsAttention: 'Require atención',
  generating: 'Xerando o modelo…',
  ready: 'Modelo preparado',
  loadingPreview: 'Cargando a vista…',
  fix: 'Imos amañalo',
  retry: 'Téntao de novo',
  orbitZoom: 'Arrastra para xirar · roda para ampliar',
  partsTitle: 'Unha tecla. Dúas pezas.',
  partsDetail: 'Corpo + Lenda · incrustación lisa de 0,5 mm',
  preparing: 'Preparando…',
  download: 'Descargar 3MF',
  firstPrint:
    'Primeira impresión? Este perfil é experimental. Comproba o encaixe e o percorrido antes de usala con frecuencia.',
  privacyShort: 'Procesado no teu navegador. Os deseños non se gardan.',
  printingHelp: 'Axuda de impresión',
  footer: 'Obxecto pequeno. Toque persoal.',
  localMade: 'Teclas OEM feitas localmente.',
  perspective: 'Vista 3D',
  top: 'Superior',
  underside: 'Parte inferior',
  previewCamera: 'Cámara da vista',
  canvasLabel:
    'Modelo interactivo da tecla. Usa os botóns para inspeccionar a parte superior ou inferior.',
  previewPaused: 'A vista 3D está pausada. Recarga para restaurala.',
  previewUnavailable:
    'A vista 3D non está dispoñible neste navegador. Aínda podes descargar o modelo.',
  privacy: 'Privacidade',
  printing: 'Impresión',
  privacyText:
    'O teu SVG e os axustes da tecla procésanse no teu navegador. A aplicación só os mantén na memoria desta sesión: non os envía a un servidor nin os garda para abrilos despois. Ao recargar comezas un deseño novo. O 3MF só se garda no teu dispositivo cando o descargas.',
  privacyDetail:
    'Non hai contas, analítica, deseños gardados nin preferencias de idioma almacenadas. O navegador pode gardar na caché recursos da web; iso é distinto de gardar o teu deseño.',
  printImport:
    'Importa o 3MF como unha soa montaxe. Asigna filamentos a Corpo e Lenda e mantén ambas pezas xuntas. O ficheiro non inclúe perfil de impresora nin G-code.',
  printOrientation:
    'A orientación exportada é de modelado. Como punto de partida, usa a función Lay on Face do laminador nun lado amplo e comproba o contacto coa cama. Repite a colocación para cada xeometría e engade soportes onde os necesiten a cavidade, o teito ou o encaixe.',
  printInspect:
    'Inspecciona as capas: mantén aberto o encaixe e comproba trazos finos da lenda, costuras e materiais. As paredes de anchura adaptativa melloraron unha comparación, pero non eliminaron todo o relevo táctil.',
  printCheck:
    'Imprime unha mostra e déixaa arrefriar. Comproba inserción suave, retención, retirada, percorrido completo e folgura coas teclas e carcasa próximas. As demais variantes e medidas modificadas seguen sendo experimentais.',
  downloaded: 'Descargado. Abre o 3MF no laminador e asigna un filamento a cada peza.',
  downloadFailed: 'A descarga fallou. Téntao de novo.',
  fileTooLarge: 'Escolle un ficheiro SVG menor de 150 KB.',
  fileRead: 'Non se puido ler este ficheiro.',
  genericError: 'Non se puido usar este ficheiro. Proba cun SVG máis simple.',
  engineStart:
    'Non se puido iniciar o motor de xeometría. Recarga a páxina ou proba outro navegador.',
  engineTimeout: 'Esta icona tardou demasiado en xerarse. Simplifica os trazados e téntao de novo.',
  engineUnavailable: 'Este navegador non puido iniciar o motor de xeometría.',
} satisfies Record<keyof typeof en, string>;

const es = {
  ...en,
  customizeDimensions: 'Personalizar medidas',
  customized: 'Personalizado',
  baseWidth: 'Ancho de base',
  baseDepth: 'Profundidad de base',
  frontHeight: 'Altura del borde delantero',
  rearHeight: 'Altura del borde trasero',
  overallDimensions: 'Tamaño total (ancho × profundidad × alto)',
  dimensionsHelp:
    'Las alturas se miden en el centro de cada borde superior, desde la base. Delante mira hacia ti; detrás, hacia la pantalla. Las esquinas son más altas por la concavidad. Los límites son experimentales. El alojamiento del switch conserva sus medidas.',
  invalidMeasurements: 'Las medidas están fuera del intervalo admitido.',
  iconTooLarge: 'El icono excede la superficie útil. Reduce su tamaño.',
  printEvidence:
    'La plantilla anterior tuvo pruebas de encaje con muestras. Estos perfiles ajustables necesitan una nueva comprobación de encaje y recorrido; no hay ajustes de impresión universales validados.',
  language: 'Idioma',
  help: 'Ayuda',
  close: 'Cerrar',
  projectLinks: 'Enlaces del proyecto',
  home: 'Inicio de Keycap Studio',
  madeHere: 'Hecho aquí. Se queda aquí.',
  earlyAccess: 'ACCESO ANTICIPADO · V0.1',
  coffee: 'Invítame a un café',
  eyebrow: 'UNA TECLA PEQUEÑA. TU MARCA.',
  title: 'Hazla tuya.',
  headingCopy: 'Un icono. Dos colores.\nUna tecla lista para tu próxima impresión.',
  settings: 'Ajustes de la tecla',
  oemProfile: 'Perfil OEM',
  mxCompatible: 'Compatible con MX · fila y anchura abajo',
  active: 'ACTIVO',
  chooseKey: 'Elige tu tecla',
  oemRow: 'Fila OEM',
  row: 'Fila',
  keyWidth: 'Anchura de la tecla',
  checkedFit:
    'Una muestra impresa superó las comprobaciones de ajuste de la tecla de iluminación K2.',
  experimental:
    'Tamaño o forma experimental: el ajuste y la calidad de impresión varían según la opción.',
  shapeHeight: 'Forma y altura',
  reset: 'Restablecer',
  cornerRadius: 'Radio de la esquina',
  squarer: 'Más cuadrada',
  rounder: 'Más redonda',
  heightAdjustment: 'Ajuste de altura',
  oemRowHeight: 'Altura de fila OEM',
  oemDerivedHeight: 'Altura derivada de OEM',
  oemDerived: 'Derivada de OEM',
  strokeError:
    'Convierte los trazos en trazados rellenos en tu editor SVG y vuelve a subir el archivo.',
  heightHelp:
    'Pasos de 0,25 mm. Relativo a la fila OEM elegida. Las medidas modificadas son experimentales.',
  icon: 'Tu icono',
  uploadSvg: 'Subir SVG',
  dropSvg: 'Suelta tu SVG aquí',
  browseSvg: 'o pulsa para buscar · hasta 150 KB',
  example: 'Prueba un ejemplo',
  filledPaths: 'Solo trazados rellenos. Convierte los contornos en trazados antes de subir.',
  legendSize: 'Tamaño de la leyenda',
  legendHelp: 'Centrada y con proporciones conservadas.',
  twoTone: 'Dos colores',
  body: 'Cuerpo',
  legend: 'Leyenda',
  bodyColor: 'Color del cuerpo',
  legendColor: 'Color de la leyenda',
  filamentHelp: 'Elige filamentos correspondientes en el laminador.',
  preview: 'Vista previa 3D',
  yourKeycap: 'TU TECLA',
  needsAttention: 'Requiere atención',
  generating: 'Generando modelo…',
  ready: 'Modelo preparado',
  loadingPreview: 'Cargando vista…',
  fix: 'Vamos a arreglarlo',
  retry: 'Reintentar',
  orbitZoom: 'Arrastra para orbitar · rueda para ampliar',
  partsTitle: 'Una tecla. Dos piezas.',
  partsDetail: 'Cuerpo + Leyenda · incrustación lisa de 0,5 mm',
  preparing: 'Preparando…',
  download: 'Descargar 3MF',
  firstPrint:
    '¿Primera impresión? Este perfil es experimental. Comprueba el ajuste y el recorrido antes de usarla habitualmente.',
  privacyShort: 'Procesado en tu navegador. Los diseños no se guardan.',
  printingHelp: 'Ayuda de impresión',
  footer: 'Objeto pequeño. Toque personal.',
  localMade: 'Teclas OEM hechas localmente.',
  perspective: 'Vista 3D',
  top: 'Superior',
  underside: 'Parte inferior',
  previewCamera: 'Cámara de vista',
  canvasLabel:
    'Modelo interactivo de tecla. Usa los botones para inspeccionar la parte superior o inferior.',
  previewPaused: 'La vista 3D está pausada. Recarga para restaurarla.',
  previewUnavailable:
    'La vista 3D no está disponible en este navegador. Aún puedes descargar el modelo.',
  privacy: 'Privacidad',
  printing: 'Impresión',
  privacyText:
    'Tu SVG y la configuración de la tecla se procesan en tu navegador. La aplicación los mantiene solo en memoria durante esta sesión: no los envía a un servidor ni los guarda para recuperarlos después. Al recargar la página empezarás un diseño nuevo. El archivo 3MF solo se guarda en tu dispositivo cuando lo descargas.',
  privacyDetail:
    'No hay cuentas, analítica, diseños guardados ni preferencias de idioma almacenadas. El navegador puede guardar recursos web en caché; eso es distinto de guardar tu diseño.',
  printImport:
    'Importa el 3MF como un solo ensamblaje. Asigna filamentos a Cuerpo y Leyenda y mantén ambas piezas juntas. El archivo no incluye perfil de impresora ni G-code.',
  printOrientation:
    'La orientación exportada es de modelado. Como punto de partida, usa la función Lay on Face del laminador sobre un lado amplio y comprueba el contacto con la cama. Repite la colocación para cada geometría y añade soportes donde los necesiten la cavidad, el techo o el encaje.',
  printInspect:
    'Inspecciona las capas: mantén abierto el encaje y revisa trazos finos de la leyenda, costuras y materiales. Las paredes de anchura adaptativa mejoraron una comparación, pero no eliminaron todo el relieve táctil.',
  printCheck:
    'Imprime una muestra y déjala enfriar. Comprueba inserción suave, retención, retirada, recorrido completo y holgura con teclas y carcasa cercanas. Las demás variantes y medidas modificadas siguen siendo experimentales.',
  downloaded: 'Descargado. Abre el 3MF en el laminador y asigna un filamento a cada pieza.',
  downloadFailed: 'La descarga ha fallado. Inténtalo de nuevo.',
  fileTooLarge: 'Elige un archivo SVG menor de 150 KB.',
  fileRead: 'No se ha podido leer este archivo.',
  genericError: 'No se ha podido usar este archivo. Prueba con un SVG más sencillo.',
  engineStart:
    'No se ha podido iniciar el motor de geometría. Recarga la página o prueba otro navegador.',
  engineTimeout:
    'Esta icona tardó demasiado en generarse. Simplifica los trazados e inténtalo de nuevo.',
  engineUnavailable: 'Este navegador no ha podido iniciar el motor de geometría.',
} satisfies Record<keyof typeof en, string>;

export const messages = { en, gl, es };
export type MessageKey = keyof typeof en;
const Context = createContext<
  | {
      locale: Locale;
      setLocale: (locale: Locale) => void;
      t: (key: MessageKey) => string;
      number: (value: number, digits?: number) => string;
    }
  | undefined
>(undefined);

export function detectLocale(languages: readonly string[] = navigator.languages): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0];
    if (LOCALES.includes(base as Locale)) return base as Locale;
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => detectLocale());
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: MessageKey) => messages[locale][key],
      number: (number: number, digits = 1) =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }).format(number),
    }),
    [locale],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n() {
  const context = useContext(Context);
  if (!context) throw new Error('I18nProvider is required.');
  return context;
}
export function errorMessage(message: string | undefined, t: (key: MessageKey) => string) {
  if (!message) return undefined;
  if (message === 'Invalid keycap measurements.') return t('invalidMeasurements');
  if (message.includes('usable key top')) return t('iconTooLarge');
  if (message.includes('stroke')) return t('strokeError');
  if (message.includes('too large')) return t('fileTooLarge');
  return message.startsWith('The geometry engine')
    ? t('engineStart')
    : message.startsWith('This icon took')
      ? t('engineTimeout')
      : message;
}
