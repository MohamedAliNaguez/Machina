export type GuideTool = 'payload' | 'components' | 'unloading' | 'comparison' | 'rfq';
export interface PayloadInputs {
  volume: number;
  density: number;
  fill: number;
  tractor: number;
  trailer: number;
  gross: number;
}
export function estimatePayload(v: PayloadInputs) {
  if (
    !Object.values(v).every(Number.isFinite) ||
    v.volume <= 0 ||
    v.density <= 0 ||
    v.fill <= 0 ||
    v.fill > 100 ||
    v.tractor <= 0 ||
    v.trailer <= 0 ||
    v.gross <= v.tractor + v.trailer
  )
    return undefined;
  const volumeMass = (v.volume * v.density * v.fill) / 100;
  const weightMass = v.gross - v.tractor - v.trailer;
  if (!Number.isFinite(volumeMass)) return undefined;
  return {
    volumeMass,
    weightMass,
    ceiling: Math.min(volumeMass, weightMass),
    limiting: volumeMass < weightMass ? 'volume' : volumeMass > weightMass ? 'weight' : 'equal',
  };
}
export function estimateUnloading(payload: number, rate: number, handling: number) {
  if (
    ![payload, rate, handling].every(Number.isFinite) ||
    payload <= 0 ||
    rate <= 0 ||
    handling < 0
  )
    return undefined;
  const minutes = (payload / rate) * 60 + handling;
  return Number.isFinite(minutes) ? minutes : undefined;
}
export const rfqFields = [
  'material',
  'destination',
  'quantity',
  'payload',
  'tractor',
  'site',
  'power',
  'documents',
] as const;
export function buildRfq(values: Partial<Record<(typeof rfqFields)[number], string>>, tr: boolean) {
  const titles = tr
    ? [
        'Malzeme ve yoğunluk',
        'Hedef ülke / teslim yeri',
        'Adet ve zamanlama',
        'Hedef yük / hacim',
        'Çekici bilgileri',
        'Dolum ve boşaltma sahası',
        'Güç beslemesi',
        'Belgeler ve açık sorular',
      ]
    : [
        'Material and bulk density',
        'Destination / delivery place',
        'Quantity and timing',
        'Target payload / volume',
        'Tractor details',
        'Loading and receiving site',
        'Power supply',
        'Documents and open questions',
      ];
  return [
    tr ? 'ÇİMENTO SİLOBASI — TEKLİF TALEBİ' : 'CEMENT BULKER — REQUEST FOR QUOTATION',
    ...rfqFields.map(
      (key, i) =>
        `${titles[i]}: ${values[key]?.trim().slice(0, 300) || (tr ? 'Teyit edilecek' : 'To confirm')}`,
    ),
    tr
      ? 'Lütfen önerilen konfigürasyonu, dahil ekipmanı, istisnaları ve teslim sorumluluklarını belirtin.'
      : 'Please identify the proposed configuration, included equipment, exclusions and delivery responsibilities.',
  ].join('\n\n');
}
