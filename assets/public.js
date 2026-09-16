import { formatDateVN, formatDateTimeVN, formatStatusTransition, matchesMemberSearch, memberStatusClass, memberStatusLabel } from './utils.js';
import { createDbClient, getConfig, initials, isConfigured, setText } from './shared.js';

const config = getConfig();
const grid = document.getElementById('memberGrid');
const searchInput = document.getElementById('searchInput');
const statusBox = document.getElementById('statusBox');
const emptyState = document.getElementById('emptyState');
const recentActivity = document.getElementById('recentActivity');
const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
let members = [];
let activities = [];
let db = null;

setText('guildName', config.GUILD_NAME || 'QUÂN ĐOÀN');
setText('pageTitle', config.PAGE_TITLE || 'BÁO CÁO TUYỂN THÀNH VIÊN MỚI');
document.title = `${config.GUILD_NAME || 'Quân đoàn'} · Thành viên mới`;

function showStatus(message, type = 'error') { statusBox.textContent = message; statusBox.className = `status-box ${type}`; statusBox.hidden = false; }
function clearStatus() { statusBox.hidden = true; }

function openImage(url, alt) {
  if (!url) return;
  imageModalImg.src = url;
  imageModalImg.alt = alt || 'Ảnh profile phóng to';
  if (!imageModal.open) imageModal.showModal();
}
function closeImage() { if (imageModal.open) imageModal.close(); imageModalImg.removeAttribute('src'); }
imageModal.addEventListener('click', (event) => { if (event.target === imageModal) closeImage(); });
document.querySelector('[data-close-image]').addEventListener('click', closeImage);

actionEscape();
function actionEscape() { imageModal.addEventListener('cancel', () => imageModalImg.removeAttribute('src')); }

function avatarButton(member) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'avatar-button';
  if (member.profile_url) {
    const img = document.createElement('img'); img.src = member.profile_url; img.alt = `Ảnh profile ${member.name}`; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; button.appendChild(img);
    button.addEventListener('click', () => openImage(member.profile_url, `Ảnh profile ${member.name}`));
  } else { button.textContent = initials(member.name); button.disabled = true; }
  return button;
}

function createMemberCard(member) {
  const card = document.createElement('article'); card.className = 'member-card';
  const avatar = avatarButton(member);
  const body = document.createElement('div'); body.className = 'member-body';
  const titleLine = document.createElement('div'); titleLine.className = 'member-title-line';
  const name = document.createElement('h3'); name.textContent = member.name;
  titleLine.appendChild(name);
  const details = document.createElement('p'); details.textContent = `ID ${member.id_code} · Vào ${formatDateVN(member.joined_at)}`;
  body.append(titleLine, details);
  const actions = document.createElement('div'); actions.className = 'member-actions';
  const badge = document.createElement('span'); badge.className = `status-badge ${memberStatusClass(member.status)}`; badge.textContent = memberStatusLabel(member.status);
  const facebook = document.createElement('a'); facebook.className = 'facebook-link'; facebook.href = member.facebook_url; facebook.target = '_blank'; facebook.rel = 'noopener noreferrer'; facebook.textContent = 'Facebook ↗';
  actions.append(badge, facebook); card.append(avatar, body, actions); return card;
}

function renderSummary() {
  const counts = { dat: 0, khong_dat: 0, thoat: 0 };
  for (const member of members) if (Object.hasOwn(counts, member.status)) counts[member.status] += 1;
  setText('memberCount', String(members.length)); setText('summaryTotal', String(members.length)); setText('summaryPassed', String(counts.dat)); setText('summaryFailed', String(counts.khong_dat)); setText('summaryLeft', String(counts.thoat));
}

function renderMembers() {
  const filtered = members.filter((member) => matchesMemberSearch(member, searchInput.value));
  grid.replaceChildren(); renderSummary(); emptyState.hidden = filtered.length !== 0; grid.hidden = filtered.length === 0;
  filtered.forEach((member) => grid.appendChild(createMemberCard(member)));
}

function renderActivities() {
  recentActivity.replaceChildren();
  if (!activities.length) { const empty = document.createElement('div'); empty.className = 'activity-empty'; empty.textContent = 'Chưa có cập nhật trạng thái.'; recentActivity.appendChild(empty); return; }
  activities.forEach((item) => {
    const row = document.createElement('div'); row.className = 'activity-item';
    const name = document.createElement('strong'); name.className = 'activity-name'; name.textContent = item.member_name;
    const transition = document.createElement('div'); transition.className = 'activity-transition'; transition.textContent = `${item.id_code ? `ID ${item.id_code} · ` : ''}${formatStatusTransition(item.old_status, item.new_status)}`;
    const time = document.createElement('div'); time.className = 'activity-time'; time.textContent = formatDateTimeVN(item.changed_at);
    row.append(name, transition, time); recentActivity.appendChild(row);
  });
}

async function loadMembers() {
  const { data, error } = await db.from('members').select('id,id_code,name,facebook_url,profile_url,joined_at,status,created_at').order('joined_at', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error; members = data || []; renderMembers();
}
async function loadActivities() {
  const { data, error } = await db.from('member_status_logs').select('id,member_id,member_name,id_code,old_status,new_status,changed_at').order('changed_at', { ascending: false }).limit(10);
  if (error) throw error; activities = data || []; renderActivities();
}
async function refreshAll() {
  clearStatus();
  try { await Promise.all([loadMembers(), loadActivities()]); } catch (error) { showStatus(`Không tải được dữ liệu: ${error.message}`); }
}
function subscribeRealtime() {
  db.channel('public-guild-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadMembers().catch((error) => showStatus(error.message)))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'member_status_logs' }, () => loadActivities().catch((error) => showStatus(error.message)))
    .subscribe();
}

searchInput.addEventListener('input', renderMembers);
if (!isConfigured(config)) { grid.replaceChildren(); showStatus('Trang chưa được kết nối Supabase.'); }
else { try { db = createDbClient(); await refreshAll(); subscribeRealtime(); } catch (error) { grid.replaceChildren(); showStatus(error.message || 'Không thể khởi tạo hệ thống.'); } }
