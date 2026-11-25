import {
  buildRfq,
  estimatePayload,
  estimateUnloading,
  type PayloadInputs,
} from '../lib/procurement';
function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function initProcurementTools() {
  document.querySelectorAll<HTMLElement>('[data-buyer-tool]').forEach((root) => {
    const tr = root.dataset.locale === 'tr';
    const number = new Intl.NumberFormat(tr ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 2 });
    const kind = root.dataset.buyerTool;
    if (kind === 'payload' || kind === 'unloading') {
      const form = root.querySelector<HTMLFormElement>('[data-calculator]')!;
      const result = root.querySelector<HTMLElement>('[data-result]')!;
      form.addEventListener('submit', (e) => e.preventDefault());
      const update = () => {
        const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
        inputs.forEach((input) => input.removeAttribute('aria-invalid'));
        if (inputs.some((input) => input.value.trim() === '')) {
          result.textContent = tr
            ? 'Hesaplamak için tüm değerleri girin.'
            : 'Enter all values to calculate.';
          return;
        }
        const values = Object.fromEntries(inputs.map((input) => [input.name, input.valueAsNumber]));
        const invalid = inputs.filter(
          (input) => !input.validity.valid || !Number.isFinite(input.valueAsNumber),
        );
        invalid.forEach((input) => input.setAttribute('aria-invalid', 'true'));
        if (invalid.length) {
          result.textContent = tr
            ? 'Değerleri kontrol edin; sıfır, negatif veya geçersiz değerler hesaplanamaz.'
            : 'Check the values; zero, negative or invalid values cannot be calculated.';
          return;
        }
        if (kind === 'payload') {
          const value = estimatePayload(values as unknown as PayloadInputs);
          if (!value) {
            result.textContent = tr
              ? 'Katar sınırı, çekici ve römork çalışma darası toplamından büyük olmalıdır.'
              : 'The combination limit must exceed the combined tractor and trailer operating tare.';
            return;
          }
          result.replaceChildren();
          const label = document.createElement('span');
          label.textContent = tr ? 'Ön değerlendirme tavanı' : 'Screening ceiling';
          const total = document.createElement('strong');
          total.textContent = number.format(value.ceiling) + ' t';
          const details = document.createElement('p');
          details.textContent =
            (tr ? 'Hacme göre: ' : 'By volume: ') +
            number.format(value.volumeMass) +
            ' t · ' +
            (tr ? 'Brüt ağırlığa göre: ' : 'By gross weight: ') +
            number.format(value.weightMass) +
            ' t';
          const limit = document.createElement('p');
          limit.textContent = tr
            ? 'Küçük tahmin gösterilir. Aks ve diğer sınırlar sonucu daha da düşürebilir.'
            : 'The smaller estimate is shown. Axle and other limits may reduce it further.';
          result.append(label, total, details, limit);
        } else {
          const minutes = estimateUnloading(values.payload, values.rate, values.handling);
          result.textContent =
            minutes === undefined
              ? tr
                ? 'Girilen değerleri kontrol edin.'
                : 'Check the input values.'
              : (tr ? 'Varsayımsal toplam süre: ' : 'Assumed total time: ') +
                number.format(minutes) +
                ' min';
        }
      };
      form.addEventListener('input', update);
      root.querySelector('[data-example]')?.addEventListener('click', () => {
        const values =
          kind === 'payload'
            ? { volume: 35, density: 1.2, fill: 90, tractor: 8, trailer: 6.5, gross: 40 }
            : { payload: 25.5, rate: 30, handling: 10 };
        Object.entries(values).forEach(([key, value]) => {
          (form.elements.namedItem(key) as HTMLInputElement).value = String(value);
        });
        update();
      });
    }
    if (kind === 'components') {
      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-part]'));
      buttons.forEach((button) =>
        button.addEventListener('click', () => {
          buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
          root
            .querySelectorAll<HTMLElement>('[data-part-description]')
            .forEach((p) => (p.hidden = p.dataset.partDescription !== button.dataset.part));
          root
            .querySelectorAll('[data-map-part]')
            .forEach((p) =>
              p.classList.toggle(
                'part-active',
                p.getAttribute('data-map-part') === button.dataset.part,
              ),
            );
        }),
      );
    }
    if (kind === 'comparison') {
      const selects = Array.from(root.querySelectorAll<HTMLSelectElement>('[data-coverage]'));
      const summary = root.querySelector<HTMLElement>('[data-coverage-summary]')!;
      const describe = () =>
        ['A', 'B']
          .map((option) => {
            const group = selects.filter((s) => s.dataset.coverage === option);
            return (
              (tr ? 'Seçenek ' : 'Option ') +
              option +
              ': ' +
              group.filter((s) => s.value === 'confirmed').length +
              '/' +
              group.length +
              (tr ? ' kapsam kalemi açıkça dahil.' : ' scope items explicitly included.')
            );
          })
          .join(' ');
      const update = () => (summary.textContent = describe());
      selects.forEach((s) => s.addEventListener('change', update));
      update();
      root.querySelector('[data-download-comparison]')?.addEventListener('click', () => {
        const rows = Array.from(root.querySelectorAll('tbody tr')).map((row) =>
          Array.from(row.querySelectorAll('th,td'))
            .map(
              (cell) =>
                cell.querySelector('select')?.selectedOptions[0].textContent ||
                cell.textContent?.trim(),
            )
            .join(' | '),
        );
        download(
          [
            tr
              ? 'TEKLİF KAPSAMI — SEÇENEK A | SEÇENEK B'
              : 'QUOTATION COVERAGE — OPTION A | OPTION B',
            ...rows,
            describe(),
            tr
              ? 'Kalite veya uygunluk puanı değildir.'
              : 'This is not a quality or compliance score.',
          ].join('\n'),
          'technicsan-quotation-worksheet.txt',
        );
      });
    }
    if (kind === 'rfq') {
      const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-rfq-field]'));
      const preview = root.querySelector<HTMLElement>('[data-rfq-preview]')!;
      const brief = () =>
        buildRfq(Object.fromEntries(inputs.map((i) => [i.dataset.rfqField!, i.value])), tr);
      const update = () => (preview.textContent = brief());
      inputs.forEach((i) => i.addEventListener('input', update));
      update();
      root
        .querySelector('[data-download-rfq]')
        ?.addEventListener('click', () => download(brief(), 'technicsan-cement-bulker-rfq.txt'));
      root.querySelector('[data-use-brief]')?.addEventListener('click', () => {
        const message = root.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
        if (!message) return;
        // Existing free-text enquiry edits must survive until the visitor explicitly replaces them.
        if (message.value.trim() && message.value !== message.dataset.generatedBrief) {
          root.querySelector<HTMLElement>('[data-rfq-status]')!.textContent = tr
            ? 'Satış mesajınızda değişiklik var. Özeti indirip mesajla birleştirin veya mesaj alanını temizleyerek yeniden aktarın.'
            : 'Your sales message has edits. Download the brief and combine it with your message, or clear the message before transferring again.';
          message.focus();
          return;
        }
        message.value = brief();
        message.dataset.generatedBrief = message.value;
        message.dispatchEvent(new Event('input', { bubbles: true }));
        root.querySelector<HTMLElement>('[data-rfq-status]')!.textContent = tr
          ? 'Özet mesaja aktarıldı. İletişim bilgilerinizi tamamlayın ve göndermeden önce inceleyin.'
          : 'Brief added to the message. Complete your contact details and review before sending.';
        message.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'center',
        });
        message.focus({ preventScroll: true });
      });
    }
  });
}
