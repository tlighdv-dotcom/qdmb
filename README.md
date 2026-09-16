# QDMB — Báo cáo tuyển thành viên quân đoàn

Web tĩnh chạy trên GitHub Pages, dữ liệu/ảnh/login admin dùng Supabase.

## Có gì

- Link công khai: xem danh sách thành viên, tìm theo ID/tên, tự cập nhật khi admin sửa.
- Link admin: đăng nhập bằng mật khẩu, thêm/sửa/xóa thành viên, upload ảnh profile.
- Dữ liệu: ID, tên, Facebook, ảnh profile, ngày vào.
- Bảo mật: khách chỉ đọc; thao tác ghi được kiểm soát bằng Supabase Auth + Row Level Security.

## 1. Tạo Supabase project

Tạo project Supabase Free, sau đó mở **SQL Editor**, copy toàn bộ `supabase.sql` và thay tất cả `admin@example.com` bằng email admin thật trước khi chạy.

## 2. Tạo tài khoản admin

Trong Supabase mở **Authentication → Users → Add user**, tạo user với đúng email ở bước 1 và mật khẩu bạn muốn dùng cho `admin.html`.

Bạn có thể tắt public sign-up trong Authentication settings vì website này không cần người dùng tự đăng ký.

## 3. Điền config.js

Vào **Project Settings / API** của Supabase và điền:

```js
window.QDMB_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://PROJECT.supabase.co',
  SUPABASE_KEY: 'YOUR_PUBLISHABLE_OR_ANON_KEY',
  ADMIN_EMAIL: 'email-admin@example.com',
  GUILD_NAME: 'CARTOON NETWORK',
  PAGE_TITLE: 'BÁO CÁO TUYỂN THÀNH VIÊN MỚI',
});
```

`SUPABASE_KEY` ở đây phải là key publishable/anon dùng được trong trình duyệt. Không đưa khóa bí mật cấp server vào source GitHub.

## 4. Bật GitHub Pages

Repo: `tlighdv-dotcom/qdmb`

Vào **Settings → Pages → Build and deployment → Deploy from a branch**:

- Branch: `main`
- Folder: `/ (root)`

Sau khi GitHub Pages deploy:

- Trang xem: `https://tlighdv-dotcom.github.io/qdmb/`
- Trang admin: `https://tlighdv-dotcom.github.io/qdmb/admin.html`

## Test local

```bash
npm test
```

Không cần `npm install` vì test dùng Node.js built-in và website load Supabase JS v2 trực tiếp từ CDN.
