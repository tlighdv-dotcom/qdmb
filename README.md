# QDMB — Báo cáo tuyển thành viên quân đoàn

Web tĩnh chạy trên GitHub Pages; dữ liệu, ảnh và đăng nhập admin dùng Supabase.

## Tính năng

- Trang công khai: xem danh sách thành viên, tìm theo ID/tên và tự cập nhật khi admin thay đổi dữ liệu.
- Trang admin: đăng nhập bằng email + mật khẩu, thêm/sửa/xóa thành viên, upload ảnh profile, đổi trạng thái và quản lý bạn bè chơi chung.
- Trạng thái: `Đạt`, `Không đạt`, `Thoát`, có lịch sử 10 thay đổi gần nhất.
- Bạn bè chơi chung: liên kết trực tiếp giữa các thành viên đã có trong hệ thống, tính hai chiều, có thống kê số người có bạn và các nhóm chơi cùng.
- Bảo mật: khách chỉ được đọc; quyền ghi yêu cầu tài khoản Supabase Auth có `app_metadata.role = admin`.

## Supabase hiện tại

Frontend đã được cấu hình sẵn với project Supabase của QDMB bằng publishable key. Không đưa service-role hoặc secret key vào source GitHub.

Schema chính nằm trong `supabase.sql` và gồm:

- `public.members`
- `public.member_status_logs`
- `public.member_friends`
- Row Level Security
- Storage bucket `member-profiles`
- Supabase Realtime cho thành viên, trạng thái và quan hệ bạn bè

## Tạo tài khoản quản trị

1. Trong Supabase Dashboard mở **Authentication → Users → Add user** và tạo user email/password.
2. Trong **SQL Editor** gắn role admin cho tài khoản:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'YOUR_ADMIN_EMAIL';
```

3. Đăng nhập tại `admin.html`.

## GitHub Pages

Repo: `tlighdv-dotcom/qdmb`

- Branch: `main`
- Folder: `/ (root)`

Public: `https://tlighdv-dotcom.github.io/qdmb/`

Admin: `https://tlighdv-dotcom.github.io/qdmb/admin.html`

## Test

```bash
npm test
```

Không cần `npm install`: test dùng Node.js built-in; website tải Supabase JS v2 trực tiếp từ CDN.
