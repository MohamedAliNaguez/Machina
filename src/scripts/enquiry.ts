import { validateEnquiry } from '../lib/enquiry-validation';
import { parseInternationalPhone } from '../lib/phone';
function requestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export function initEnquiryForm() {
  const form = document.querySelector<HTMLFormElement>('[data-enquiry-form]');
  if (!form) return;
  const tr = form.dataset.locale === 'tr';
  const emailDelivery = form.dataset.delivery === 'formspree';
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const initialLabel = label.textContent!;
  let key = requestId();
  let previousPayload = '';
  let busy = false;
  const params = new URLSearchParams(location.search);
  const guides: { guideId: string; family: string; title: string }[] = JSON.parse(
    form.dataset.guideOptions || '[]',
  );
  const guide = guides.find(
    (g) => g.guideId === (params.get('guide') || form.dataset.defaultGuide),
  );
  const context = form.querySelector<HTMLElement>('[data-guide-context]');
  if (guide && context) {
    context.hidden = false;
    context.textContent = (tr ? 'İlgili rehber: ' : 'Related guide: ') + guide.title;
  }

  const selected = params.get('product') || params.get('machine');
  const select = form.elements.namedItem('machineId') as HTMLSelectElement;
  if (selected && [...select.options].some((o) => o.value === selected)) select.value = selected;
  const textarea = form.elements.namedItem('message') as HTMLTextAreaElement;
  const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
  const phoneCountry = form.elements.namedItem('phoneCountry') as HTMLSelectElement;
  phoneInput.addEventListener('change', () => {
    if (!/^(\+|00)/.test(phoneInput.value.trim())) return;
    const phone = parseInternationalPhone(phoneInput.value, phoneCountry.value);
    if (phone?.country) {
      phoneCountry.value = phone.country;
      phoneInput.value = phone.nationalNumber;
    }
  });
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
    if (form.dataset.staticHosting === 'true' && !emailDelivery) return;
    if (busy) return;
    const data = Object.fromEntries(new FormData(form));
    if (data.website) return;
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
    if (previousPayload && previousPayload !== payloadSignature) key = requestId();
    previousPayload = payloadSignature;
    busy = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    label.textContent = tr ? 'Gönderiliyor…' : 'Sending…';
    status.textContent = '';
    status.className = 'form-status';
    try {
      const option = select.selectedOptions[0];
      const productName = select.value ? option.textContent?.trim() || select.value : '';
      const payload = emailDelivery
        ? {
            ...validation.value,
            ...(validation.value.email ? { email: validation.value.email } : { email: undefined }),
            product: productName || (tr ? 'Genel bilgi talebi' : 'General enquiry'),
            _subject: `TECHNICSAN · ${productName || (tr ? 'Satış talebi' : 'Sales enquiry')}`,
            page: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
            reference: key,
            ...(guide ? { guide: guide.guideId, product_family: guide.family } : {}),
          }
        : data;
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(emailDelivery ? {} : { 'Idempotency-Key': key }),
        },
        body: JSON.stringify(payload),
        credentials: emailDelivery ? 'omit' : 'same-origin',
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || (emailDelivery && result.ok !== true))
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
          detail: {
            language: data.language,
            machineId: data.machineId || null,
            preview: !!result.preview,
            guideId: guide?.guideId,
            family: guide?.family,
          },
        }),
      );
      form.reset();
      if (form.dataset.sitekey)
        (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
      previousPayload = '';
      key = requestId();
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
