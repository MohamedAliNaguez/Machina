export interface SiloInputs {
  production: number;
  dosage: number;
  lead: number;
  reserve: number;
  delivery: number;
  density: number;
  fill: number;
  unavailable: number;
  volume: number;
}
/** Volume/inventory screening, never a permitted loading or filling limit. */
export function planSilo(v: SiloInputs) {
  if (
    !Object.values(v).every(Number.isFinite) ||
    v.production <= 0 ||
    v.dosage <= 0 ||
    v.lead < 0 ||
    v.reserve < 0 ||
    v.delivery <= 0 ||
    v.density <= 0 ||
    v.fill <= 0 ||
    v.fill > 100 ||
    v.unavailable < 0 ||
    v.volume <= 0
  )
    return undefined;
  const daily = (v.production * v.dosage) / 1000;
  const safety = daily * v.reserve;
  const reorder = daily * v.lead + safety;
  const target = reorder + v.delivery;
  const massByVolume = (v.volume * v.density * v.fill) / 100;
  const usable = massByVolume - v.unavailable;
  const requiredVolume = (target + v.unavailable) / ((v.density * v.fill) / 100);
  const autonomy = usable / daily;
  const deliveries = daily / v.delivery;
  const margin = usable - target;
  const values = {
    daily,
    safety,
    reorder,
    target,
    massByVolume,
    usable,
    requiredVolume,
    autonomy,
    deliveries,
    margin,
  };
  if (daily <= 0 || usable <= 0 || !Object.values(values).every(Number.isFinite)) return undefined;
  return values;
}
