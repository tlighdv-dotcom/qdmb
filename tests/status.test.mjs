import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMemberStatus, memberStatusLabel, memberStatusClass } from '../assets/utils.js';

test('normalizeMemberStatus accepts the three supported guild statuses', () => {
  assert.equal(normalizeMemberStatus('dat'), 'dat');
  assert.equal(normalizeMemberStatus('khong_dat'), 'khong_dat');
  assert.equal(normalizeMemberStatus('thoat'), 'thoat');
});

test('normalizeMemberStatus falls back to dat for unknown or empty values', () => {
  assert.equal(normalizeMemberStatus(''), 'dat');
  assert.equal(normalizeMemberStatus('pending'), 'dat');
});

test('memberStatusLabel returns Vietnamese labels', () => {
  assert.equal(memberStatusLabel('dat'), 'Đạt');
  assert.equal(memberStatusLabel('khong_dat'), 'Không đạt');
  assert.equal(memberStatusLabel('thoat'), 'Thoát');
});

test('memberStatusClass returns stable css modifier names', () => {
  assert.equal(memberStatusClass('dat'), 'status-dat');
  assert.equal(memberStatusClass('khong_dat'), 'status-khong-dat');
  assert.equal(memberStatusClass('thoat'), 'status-thoat');
});

test('formatStatusTransition renders old and new Vietnamese status labels', async () => {
  const { formatStatusTransition } = await import('../assets/utils.js');
  assert.equal(formatStatusTransition('dat', 'khong_dat'), 'Đạt → Không đạt');
});

test('formatDateTimeVN renders UTC activity time in Vietnam timezone', async () => {
  const { formatDateTimeVN } = await import('../assets/utils.js');
  assert.equal(formatDateTimeVN('2026-09-16T09:42:00Z'), '16/09/2026, 16:42');
});
