import { validateEnquiry } from '../lib/enquiry-validation';
export function initEnquiryForm() {
  const form = document.querySelector<HTMLFormElement>('[data-enquiry-form]');
  if (!form) return;
  const tr = form.dataset.locale === 'tr';
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const initialLabel = label.textContent!;
  let key = crypto.randomUUID();
  let previousPayload = '';
  let busy = false;
  const selected = new URLSearchParams(location.search).get('machine');
  const select = form.elements.namedItem('machineId') as HTMLSelectElement;
  if (selected && [...select.options].some((o) => o.value === selected)) select.value = selected;
  const textarea = form.elements.namedItem('message') as HTMLTextAreaElement;
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(130, textarea.scrollHeight)}px`;
  });
  if (form.dataset.sitekey) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      const turnstile = (
        window as unknown as { turnstile: { render: (selector: string, options: object) => void } }
      ).turnstile;
      turnstile.render('#turnstile-widget', {
        sitekey: form.dataset.sitekey,
        language: tr ? 'tr' : 'en',
      });
    };
    script.onerror = () => {
      status.textContent = tr
        ? 'Güvenlik kontrolü yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.'
        : 'The security check could not load. Check your connection and reload.';
      status.className = 'form-status error';
      if (form.dataset.sitekey) {
        const widget = (window as unknown as { turnstile?: { reset: () => void } }).turnstile;
        widget?.reset();
      }
    };
    document.head.append(script);
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.dataset.staticHosting === 'true') return;
    if (busy) return;
    const data = Object.fromEntries(new FormData(form));
    const validation = validateEnquiry(data);
    for (const name of ['name', 'email', 'phone', 'message']) {
      const field = form.elements.namedItem(name) as HTMLInputElement;
      field.removeAttribute('aria-invalid');
      form.querySelector(`#${name}-error`)!.textContent = '';
    }
    if (!validation.ok) {
      for (const [name, code] of Object.entries(validation.errors)) {
        const field = form.elements.namedItem(name) as HTMLInputElement | null;
        const error = form.querySelector(`#${name}-error`);
        if (field && error) {
          field.setAttribute('aria-invalid', 'true');
          error.textContent = tr
            ? {
                required: 'Bu alanı doldurun.',
                contact: 'Geçerli bir e-posta veya telefon girin.',
                invalid: 'Bilgiyi kontrol edin.',
                length: '10–4.000 karakter girin.',
              }[code] || 'Bilgiyi kontrol edin.'
            : {
                required: 'Please complete this field.',
                contact: 'Enter a valid email address or phone number.',
                invalid: 'Check this value.',
                length: 'Enter 10–4,000 characters.',
              }[code] || 'Check this value.';
        }
      }
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      status.textContent = tr
        ? 'Lütfen işaretli alanları kontrol edin.'
        : 'Please check the highlighted fields.';
      status.className = 'form-status error';
      return;
    }
    const payloadSignature = JSON.stringify(validation.value);
    if (previousPayload && previousPayload !== payloadSignature) key = crypto.randomUUID();
    previousPayload = payloadSignature;
    busy = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    label.textContent = tr ? 'Gönderiliyor…' : 'Sending…';
    status.textContent = '';
    status.className = 'form-status';
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? 'rate'
            : response.status === 503
              ? 'unavailable'
              : result.error === 'challenge'
                ? 'challenge'
                : 'failed',
        );
      status.textContent = result.preview
        ? tr
          ? 'Örnek talebiniz yerel önizlemeye kaydedildi. Satış e-postası gönderilmedi.'
          : 'Your sample enquiry was saved to the local preview. No sales email was sent.'
        : tr
          ? 'Talebiniz kaydedildi. Satış ekibi sizinle iletişime geçecektir.'
          : 'Your enquiry has been received. Sales will contact you.';
      status.className = 'form-status success';
      window.dispatchEvent(
        new CustomEvent('enquiry:accepted', {
          detail: { language: data.language, machineId: data.machineId || null },
        }),
      );
      form.reset();
      if (form.dataset.sitekey)
        (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
      previousPayload = '';
      key = crypto.randomUUID();
    } catch (error) {
      if (form.dataset.sitekey)
        (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
      const code = error instanceof Error ? error.message : 'failed';
      status.textContent =
        code === 'rate'
          ? tr
            ? 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.'
            : 'Too many attempts. Please try again in a few minutes.'
          : code === 'challenge'
            ? tr
              ? 'Güvenlik kontrolünü tamamlayıp tekrar deneyin.'
              : 'Complete the security check and try again.'
            : code === 'unavailable'
              ? tr
                ? 'Talep hizmetine şu anda ulaşılamıyor. Bilgileriniz formda korunuyor; yeniden deneyin.'
                : 'The enquiry service is unavailable. Your information is preserved; please retry.'
              : tr
                ? 'Gönderim doğrulanamadı. Bilgileriniz korunuyor; tekrar deneyebilirsiniz.'
                : 'Submission could not be confirmed. Your information is preserved; you can retry.';
      status.className = 'form-status error';
    } finally {
      busy = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      label.textContent = initialLabel;
    }
  });
}
