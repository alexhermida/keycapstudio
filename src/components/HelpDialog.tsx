import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
export function HelpDialog({
  open,
  section,
  onClose,
}: {
  open: boolean;
  section: 'privacy' | 'printing';
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const printing = useRef<HTMLElement>(null);
  const { t } = useI18n();
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
      queueMicrotask(() => (section === 'printing' ? printing.current : close.current)?.focus());
    } else if (!open && node.open) node.close();
  }, [open, section]);
  return (
    <dialog ref={dialog} className="help-dialog" aria-labelledby="help-title" onClose={onClose}>
      <header>
        <h2 id="help-title">{t('help')}</h2>
        <button ref={close} type="button" onClick={() => dialog.current?.close()}>
          {t('close')}
        </button>
      </header>
      <section>
        <h3>{t('privacy')}</h3>
        <p>{t('privacyText')}</p>
        <p>{t('privacyDetail')}</p>
      </section>
      <section ref={printing}>
        <h3>{t('printing')}</h3>
        <ol>
          <li>{t('printImport')}</li>
          <li>{t('printOrientation')}</li>
          <li>{t('printInspect')}</li>
          <li>{t('printCheck')}</li>
        </ol>
        <p>{t('printEvidence')}</p>
      </section>
    </dialog>
  );
}
