export function formatIDR(n: number) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export function nightsBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

export function fmtDate(iso: string) {
  if (!iso) return '-';
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dateRange(isoA: string, isoB: string): string[] {
  const out: string[] = [];
  const a = new Date(isoA + 'T00:00:00');
  const b = new Date(isoB + 'T00:00:00');
  for (let d = new Date(a); d < b; d.setDate(d.getDate() + 1)) out.push(d.toISOString().slice(0, 10));
  return out;
}

export function overlap(a1: string, a2: string, b1: string, b2: string) {
  return new Date(a1) < new Date(b2) && new Date(b1) < new Date(a2);
}

export function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

export function bookingCode() {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += s[Math.floor(Math.random() * s.length)];
  return 'NS-' + c;
}

export function calcPromo(promo: { type: string; value: number; maxDiscount: number; minSpend: number }, subtotal: number) {
  if (subtotal < promo.minSpend) return 0;
  const raw = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.min(raw, promo.maxDiscount, subtotal);
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
