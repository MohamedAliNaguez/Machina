import { l } from './i18n';
import type { Locale, Settings } from './types';

export interface ContactProduct {
  name: string;
  url: string;
}

export function directContactLinks(settings: Settings, locale: Locale, product?: ContactProduct) {
  const message = product
    ? l(
        locale,
        `Merhaba, ${product.name} ürünü hakkında bilgi almak istiyorum.\n${product.url}`,
        `Hello, I would like information about ${product.name}.\n${product.url}`,
      )
    : undefined;
  const emailQuery = product
    ? `?subject=${encodeURIComponent(`TECHNICSAN · ${product.name}`)}&body=${encodeURIComponent(message!)}`
    : '';

  return [
    ...(settings.phone
      ? [
          {
            channel: 'phone',
            label: l(locale, 'Telefon', 'Phone'),
            value: settings.phone,
            href: `tel:${settings.phone.replace(/[^+\d]/g, '')}`,
          },
        ]
      : []),
    ...(settings.email
      ? [
          {
            channel: 'email',
            label: l(locale, 'E-posta', 'Email'),
            value: settings.email,
            href: `mailto:${settings.email}${emailQuery}`,
          },
        ]
      : []),
    ...(settings.whatsapp
      ? [
          {
            channel: 'whatsapp',
            label: 'WhatsApp',
            value: l(locale, 'WhatsApp ile görüşün', 'Chat on WhatsApp'),
            href:
              `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` +
              (message ? `?text=${encodeURIComponent(message)}` : ''),
          },
        ]
      : []),
  ];
}
