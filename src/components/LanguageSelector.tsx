import { LOCALES, type Locale, useI18n } from '../i18n';
const names: Record<Locale, string> = { en: 'English', gl: 'Galego', es: 'Español' };
export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="language-selector">
      <span>{t('language')}</span>
      <select
        aria-label={t('language')}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {names[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
