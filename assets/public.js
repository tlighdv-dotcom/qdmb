import { formatDateVN, matchesMemberSearch } from './utils.js';
import { createDbClient, getConfig, initials, isConfigured, setText } from './shared.js';
const config = getConfig(), grid = document.getElementById('memberGrid'), searchInput = document.getElementById('searchInput'), statusBox = document.getElementById('statusBox'), emptyState = document.getElementById('emptyState'); let members = [], db = null;
setText('guildName', config.GUILD_NAME || 'QUÂN ĐOÀN'); setText('pageTitle', config.PAGE_TITLE || 'BÁO CÁO TUYỂN THÀNH VIÊN MỚI'); document.title = `${config.GUILD_NAME || 'Quân đoàn'} · Thành viên mới`;
function showStatus(message, type = 'error') { statusBox.textContent = message; statusBox.className = `status-box ${type}`; statusBox.hidden = false; }
function clearStatus() { statusBox.hidden = true; }
function avatarNode(member) { if (member.profile_url) { const img = document.createElement('img'); img.src = member.profile_url; img.alt = `Ảnh profile ${member.name}`; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; return img; } const span = document.createElement('span'); span.textContent = initials(member.name); return span; }
function createMemberCard(member, index) {
  const card = document.createElement('article'); card.className = 'member-card glass'; card.style.setProperty('--delay', `${Math.min(index * 45, 360)}ms`);
  const top = document.createElement('div'); top.className = 'member-top'; const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.appendChild(avatarNode(member));
  const identity = document.createElement('div'); identity.className = 'member-identity'; const name = document.createElement('h2'); name.textContent = member.name; const id = document.createElement('p'); id.textContent = `ID: ${member.id_code}`; identity.append(name, id); top.append(avatar, identity);
  const meta = document.createElement('div'); meta.className = 'member-meta'; const dateLabel = document.createElement('span'); dateLabel.innerHTML = '<small>Ngày vào</small>'; const date = document.createElement('strong'); date.textContent = formatDateVN(member.joined_at); dateLabel.appendChild(date);
  const facebook = document.createElement('a'); facebook.className = 'facebook-btn'; facebook.href = member.facebook_url; facebook.target = '_blank'; facebook.rel = 'noopener noreferrer'; facebook.textContent = 'Facebook ↗'; meta.append(dateLabel, facebook); card.append(top, meta); return card;
}
function render() { const filtered = members.filter((member) => matchesMemberSearch(member, searchInput.value)); grid.replaceChildren(); setText('memberCount', String(members.length)); emptyState.hidden = filtered.length !== 0; grid.hidden = filtered.length === 0; filtered.forEach((member, index) => grid.appendChild(createMemberCard(member, index))); }
async function loadMembers() { clearStatus(); const { data, error } = await db.from('members').select('id,id_code,name,facebook_url,profile_url,joined_at,created_at').order('joined_at', { ascending: false }).order('created_at', { ascending: false }); if (error) { showStatus(`Không tải được danh sách: ${error.message}`); grid.replaceChildren(); return; } members = data || []; render(); }
function subscribeRealtime() { db.channel('public-members-live').on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadMembers()).subscribe(); }
searchInput.addEventListener('input', render);
if (!isConfigured(config)) { grid.replaceChildren(); showStatus('Trang chưa được kết nối Supabase. Admin cần cập nhật config.js trước khi sử dụng.'); }
else { try { db = createDbClient(); await loadMembers(); subscribeRealtime(); } catch (error) { grid.replaceChildren(); showStatus(error.message || 'Không thể khởi tạo hệ thống.'); } }
