export function getConfig() { return window.QDMB_CONFIG || {}; }
export function isConfigured(config = getConfig()) {
  return Boolean(config.SUPABASE_URL && config.SUPABASE_KEY && config.ADMIN_EMAIL && !String(config.SUPABASE_URL).startsWith('YOUR_') && !String(config.SUPABASE_KEY).startsWith('YOUR_') && config.ADMIN_EMAIL !== 'admin@example.com');
}
export function createDbClient() {
  const config = getConfig(); if (!isConfigured(config)) throw new Error('Supabase chưa được cấu hình. Hãy cập nhật config.js.'); if (!window.supabase?.createClient) throw new Error('Không tải được thư viện Supabase.'); return window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
}
export function initials(name = '') { const parts = String(name).trim().split(/\s+/).filter(Boolean); if (!parts.length) return 'TV'; return parts.slice(-2).map((part) => part[0]).join('').toUpperCase(); }
export function setText(id, text) { const node = document.getElementById(id); if (node) node.textContent = text; }
