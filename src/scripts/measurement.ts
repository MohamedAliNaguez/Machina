import { measurementPayload, type Interaction } from '../lib/measurement';

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};
const storageKey = 'technicsan-analytics-v1';
export function initMeasurement() {
  const root = document.querySelector<HTMLElement>('[data-measurement]');
  if (!root || root.dataset.initialized) return;
  if (root.dataset.canonicalOrigin && root.dataset.canonicalOrigin !== location.origin) return;
  root.dataset.initialized = 'true';
  const id = root.dataset.id || '';
  if (!/^G-[A-Z0-9]+$/.test(id)) return;
  const w = window as unknown as AnalyticsWindow;
  const products: Record<string, string> = JSON.parse(root.dataset.products || '{}');
  const notice = root.querySelector<HTMLElement>('[data-consent-notice]')!;
  const settings = root.querySelector<HTMLButtonElement>('[data-consent-settings]')!;
  let consent = false;
  let loaded = false;
  const send = (event: Interaction, family = root.dataset.family) => {
    if (!consent) return;
    // Only explicit, bounded fields cross this boundary. Never spread form/event data.
    const payload = measurementPayload(
      root.dataset.language || 'en',
      root.dataset.path || '/',
      family,
    );
    w.gtag?.('event', event, {
      ...payload,
      page_location: location.origin + payload.page_path,
      page_referrer: document.referrer ? new URL(document.referrer).origin : '',
      page_title: 'TECHNICSAN',
    });
  };
  const remember = (value: string) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch {}
  };
  const choose = (allow: boolean) => {
    consent = allow;
    remember(allow ? 'granted' : 'denied');
    notice.hidden = true;
    settings.hidden = false;
    w[`ga-disable-${id}`] = !allow;
    if (!allow) {
      w.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) return;
        for (const domain of ['', location.hostname, '.' + location.hostname])
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? '; Domain=' + domain : ''}`;
      });
      return;
    }
    if (!loaded) {
      loaded = true;
      w.dataLayer = w.dataLayer || [];
      w.gtag = function (..._args: unknown[]) {
        w.dataLayer!.push(arguments);
      };
      w.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      w.gtag('js', new Date());
      w.gtag('consent', 'update', { analytics_storage: 'granted' });
      w.gtag('config', id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: location.origin + (root.dataset.path || '/'),
        page_referrer: '',
        page_title: 'TECHNICSAN',
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.append(script);
    } else w.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    send('page_view');
  };
  root.querySelector('[data-consent-accept]')?.addEventListener('click', () => choose(true));
  root.querySelector('[data-consent-decline]')?.addEventListener('click', () => choose(false));
  settings.addEventListener('click', () => {
    notice.hidden = false;
    settings.hidden = true;
  });
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(storageKey);
  } catch {}
  if (saved === 'granted') choose(true);
  else if (saved === 'denied') choose(false);
  else notice.hidden = false;
  window.addEventListener('enquiry:accepted', (event) => {
    const detail = (event as CustomEvent<{ machineId?: string; preview?: boolean }>).detail;
    if (detail?.preview) return;
    send('enquiry_success', detail?.machineId ? products[detail.machineId] : undefined);
  });
  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element)?.closest?.('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    const eventName = href.startsWith('tel:')
      ? 'phone_click'
      : href.startsWith('mailto:')
        ? 'email_click'
        : /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)
          ? 'whatsapp_click'
          : anchor.hasAttribute('data-brochure')
            ? 'brochure_click'
            : undefined;
    if (eventName) send(eventName);
  });
}
