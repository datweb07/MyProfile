# MyProfile — Next.js 15

Portfolio sử dụng Next.js 15 App Router, TypeScript, `next-intl` và Supabase SSR.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. App Router sẽ chuyển sang route tĩnh `/en`; bản
tiếng Việt ở `/vi`. Blog công khai ở `/blog`, CMS ở `/admin/posts`.

## Environment

Tạo `.env.local` từ `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your-web3forms-access-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ORCID_URL=https://orcid.org/your-orcid-id
```

Không commit `.env.local`. Anon key có thể xuất hiện ở browser, nhưng Supabase
phải bật RLS và policy/RPC phù hợp cho `page_stats`, `increment_likes` và các
RPC Secret Diary.

## Thiết lập Blog trên Supabase

Backend của blog nằm hoàn toàn trong Next.js (Server Components + Server
Actions). Supabase chỉ cung cấp PostgreSQL, Auth và Storage; không có backend
Express/Nest/API riêng.

1. Vào Supabase Dashboard → SQL Editor → New query.
2. Chạy toàn bộ file
   `supabase/migrations/202609210001_blog.sql`, sau đó chạy
   `supabase/migrations/202609210002_blog_engagement.sql`. Hai migration tạo `posts`, bảng
   allowlist `blog_admins`, view/like/comment RPC, RLS policies và public bucket `blog-images`.
3. Vào Authentication → Users → Add user và tạo tài khoản email/password admin.
4. Quay lại SQL Editor và chạy, với email thật của bạn:

```sql
insert into public.blog_admins (user_id)
select id from auth.users where email = 'your-email@example.com'
on conflict (user_id) do nothing;
```

5. Nên tắt public sign-up trong Authentication → Providers → Email vì CMS chỉ
   dành cho một người. RLS vẫn kiểm tra allowlist UUID ngay cả khi sign-up chưa
   được tắt.
6. Đăng nhập tại `/admin/login`, tạo bài và kiểm tra `/blog`.

Anon key không thể và không nên có quyền chạy DDL, vì vậy migration phải được
chạy bằng SQL Editor hoặc Supabase CLI có quyền owner. Không thêm service-role
key vào biến `NEXT_PUBLIC_*`.

## Kiểm tra trước khi commit

```bash
npm run typecheck
npm run build
npm audit
git status
```

## Deploy Vercel

1. Push repository lên GitHub.
2. Import repository trong Vercel; framework preset chọn Next.js.
3. Giữ Build Command và Output Directory ở chế độ mặc định của Next.js.
4. Thêm cả năm biến ở trên vào Production, Preview và Development. Đặt
   `NEXT_PUBLIC_SITE_URL` thành domain production thật.
5. Trong Supabase Authentication → URL Configuration, đặt Site URL thành domain
   production và thêm URL preview/local cần thiết vào Redirect URLs.
6. Deploy.
7. Nếu dùng contact form Web3Forms, thêm domain production vào danh sách domain
   được phép trong Web3Forms.

Không cần tạo Vercel project trước khi commit. Không cần tạo Supabase project
mới nếu database/RPC hiện tại vẫn đang hoạt động.
