import { planSilo, type SiloInputs } from '../lib/silo-planner';
export function initSiloPlanners() {
  document.querySelectorAll<HTMLElement>('[data-silo-planner]').forEach((root) => {
    const tr = root.dataset.locale === 'tr';
    const format = new Intl.NumberFormat(tr ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 2 });
    const volumeFormat = new Intl.NumberFormat(tr ? 'tr-TR' : 'en-GB', {
      maximumFractionDigits: 1,
    });
    const form = root.querySelector<HTMLFormElement>('[data-silo-form]')!;
    const result = root.querySelector<HTMLElement>('[data-silo-result]')!;
    const fields = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    const update = () => {
      fields.forEach((input) => input.removeAttribute('aria-invalid'));
      if (fields.some((input) => !input.value.trim())) {
        result.textContent = tr
          ? 'Hesaplamak için tüm değerleri girin.'
          : 'Enter all values to calculate.';
        return;
      }
      const invalid = fields.filter(
        (input) => !input.validity.valid || !Number.isFinite(input.valueAsNumber),
      );
      invalid.forEach((input) => input.setAttribute('aria-invalid', 'true'));
      const values = Object.fromEntries(
        fields.map((input) => [input.name, input.valueAsNumber]),
      ) as unknown as SiloInputs;
      const plan = invalid.length ? undefined : planSilo(values);
      if (!plan) {
        result.textContent = tr
          ? 'Girdileri kontrol edin. Dolum oranı %0 ile %100 arasında olmalı ve kullanılamayan malzeme payından sonra pozitif stok kalmalıdır.'
          : 'Check the inputs. Filling fraction must be above 0% and at most 100%; proposed volume must leave positive inventory after the unavailable-material allowance.';
        return;
      }
      result.replaceChildren();
      const label = document.createElement('span');
      label.textContent = tr
        ? 'Ön değerlendirme nominal hacim ihtiyacı'
        : 'Preliminary nominal volume required';
      const headline = document.createElement('strong');
      headline.textContent = volumeFormat.format(plan.requiredVolume) + ' m³';
      result.append(label, headline);
      const metrics = [
        [
          tr ? 'Günlük çimento tüketimi' : 'Daily cement consumption',
          format.format(plan.daily) + ' t/operating day',
        ],
        [tr ? 'Güvenlik stoku' : 'Safety stock', format.format(plan.safety) + ' t'],
        [
          tr ? 'Ön sipariş noktası' : 'Preliminary reorder point',
          format.format(plan.reorder) + ' t',
        ],
        [
          tr ? 'Temkinli çalışma stok hedefi' : 'Conservative working inventory target',
          format.format(plan.target) + ' t',
        ],
        [
          tr ? 'Önerilen siloda kullanılabilir stok' : 'Usable inventory in proposed silo',
          format.format(plan.usable) + ' t',
        ],
        [
          tr ? 'Tahmini üretim özerkliği' : 'Estimated production autonomy',
          format.format(plan.autonomy) + (tr ? ' işletme günü' : ' operating days'),
        ],
        [
          tr ? 'Ortalama tanker teslimat ihtiyacı' : 'Average tanker delivery requirement',
          format.format(plan.deliveries) + (tr ? ' / işletme günü' : ' / operating day'),
        ],
      ];
      const dl = document.createElement('dl');
      dl.className = 'silo-plan-metrics';
      metrics.forEach(([name, value]) => {
        const group = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = name;
        const dd = document.createElement('dd');
        dd.textContent = value;
        group.append(dt, dd);
        dl.append(group);
      });
      result.append(dl);
      const assessment = document.createElement('p');
      assessment.dataset.siloAssessment = '';
      assessment.textContent =
        plan.margin < 0
          ? (tr
              ? 'Önerilen hacim, bu varsayımlardaki çalışma stok hedefinin '
              : 'The proposed volume falls short of this scenario’s working inventory target by ') +
            format.format(-plan.margin) +
            (tr ? ' t altındadır.' : ' t.')
          : (tr
              ? 'Önerilen hacim, bu varsayımlardaki çalışma stok hedefinden '
              : 'The proposed volume provides ') +
            format.format(plan.margin) +
            (tr ? ' t fazladır.' : ' t above this scenario’s working inventory target.');
      const note = document.createElement('p');
      note.textContent = tr
        ? 'Bu sonuç bir teslimatı güvenle kabul edebileceğinizi doğrulamaz. Gerçek boş kapasiteyi ve onaylı saha prosedürlerini ayrıca kontrol edin.'
        : 'This result does not confirm that a delivery can safely be accepted. Verify actual receiving capacity and approved site procedures separately.';
      result.append(assessment, note);
    };
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('input', update);
    // Native reset runs its default action after the event handlers; update in
    // the following task so the result reflects the cleared fields.
    form.addEventListener('reset', () => setTimeout(update, 0));
    root.querySelector('[data-silo-example]')?.addEventListener('click', () => {
      const example: SiloInputs = {
        production: 100,
        dosage: 320,
        lead: 1,
        reserve: 0.5,
        delivery: 28,
        density: 1.2,
        fill: 90,
        unavailable: 4,
        volume: 80,
      };
      fields.forEach((field) => (field.value = String(example[field.name as keyof SiloInputs])));
      update();
    });
  });
}
