export function stripDiacritics(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}
export function normalizeFacebookUrl(value = '') {
  const input = String(value).trim(); if (!input) return '';
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(withProtocol); if (!['http:', 'https:'].includes(url.protocol)) return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!['facebook.com', 'm.facebook.com', 'fb.com'].includes(host)) return '';
    return url.toString().replace(/\/$/, '');
  } catch { return ''; }
}
export function formatDateVN(value) {
  if (!value) return '—'; const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value)); if (!match) return '—'; return `${match[3]}/${match[2]}/${match[1]}`;
}
export function validateMember(member = {}) {
  const errors = {}; const idCode = String(member.id_code ?? '').trim(); const name = String(member.name ?? '').trim(); const facebookUrl = normalizeFacebookUrl(member.facebook_url ?? ''); const joinedAt = String(member.joined_at ?? '').trim();
  if (!idCode) errors.id_code = 'Vui lòng nhập ID.'; if (!name) errors.name = 'Vui lòng nhập tên.'; if (!facebookUrl) errors.facebook_url = 'Link Facebook không hợp lệ.'; if (!/^\d{4}-\d{2}-\d{2}$/.test(joinedAt)) errors.joined_at = 'Vui lòng chọn ngày vào.';
  return { ok: Object.keys(errors).length === 0, errors, value: { id_code: idCode, name, facebook_url: facebookUrl, joined_at: joinedAt } };
}
export function matchesMemberSearch(member = {}, query = '') {
  const needle = stripDiacritics(String(query).trim().toLowerCase()); if (!needle) return true; const haystack = stripDiacritics(`${member.id_code ?? ''} ${member.name ?? ''}`.toLowerCase()); return haystack.includes(needle);
}
export function safeFileName(fileName = '') {
  const raw = String(fileName).trim(); const lastDot = raw.lastIndexOf('.'); const ext = lastDot > -1 ? raw.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : ''; const base = lastDot > -1 ? raw.slice(0, lastDot) : raw; const cleanedBase = stripDiacritics(base).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'profile'; return ext ? `${cleanedBase}.${ext}` : cleanedBase;
}
