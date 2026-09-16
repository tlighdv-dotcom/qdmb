# QDMB — Báo cáo tuyển thành viên quân đoàn

Web tĩnh chạy trên GitHub Pages; dữ liệu, ảnh và đăng nhập admin dùng Supabase.

## Tính năng

- Trang công khai: xem danh sách thành viên, tìm theo ID/tên và tự cập nhật khi admin thay đổi dữ liệu.
- Trang admin: đăng nhập bằng email + mật khẩu, thêm/sửa/xóa thành viên và upload ảnh profile.
- Dữ liệu thành viên: ID, tên, Facebook, ảnh profile, ngày vào.
- Bảo mật: khách chỉ được đọc; quyền ghi yêu cầu tài khoản Supabase Auth có `app_metadata.role = admin`.

## Supabase hiện tại

Frontend đã được cấu hình sẵn với project Supabase của QDMB bằng publishable key. Không đưa service-role hoặc secret key vào source GitHub.

Schema chính nằm trong `supabase.sql` và gồm:

- bảng `public.members`
- Row Level Security
- Storage bucket `member-profiles`
- policy chỉ cho admin ghi dữ liệu / upload ảnh
- Supabase Realtime cho bảng `members`

## Tạo tài khoản quản trị

1. Trong Supabase Dashboard mở **Authentication → Users → Add user** và tạo một user email/password.
2. Trong **SQL Editor** chạy lệnh dưới đây, thay email bằng tài khoản vừa tạo:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'YOUR_ADMIN_EMAIL';
```

3. Đăng nhập tại `admin.html` bằng email và mật khẩu vừa tạo.

> Quyền admin thực tế được kiểm tra ở database bằng `app_metadata.role = admin`, không dựa vào email nằm trong source frontend.

## Bật GitHub Pages

Repo: `tlighdv-dotcom/qdmb`

Vào **Settings → Pages → Build and deployment → Deploy from a branch**:

- Branch: `main`
- Folder: `/ (root)`

Sau khi deploy:

- Public: `https://tlighdv-dotcom.github.io/qdmb/`
- Admin: `https://tlighdv-dotcom.github.io/qdmb/admin.html`

## Test

```bash
npm test
```

Không cần `npm install`: test dùng Node.js built-in; website tải Supabase JS v2 trực tiếp từ CDN.
