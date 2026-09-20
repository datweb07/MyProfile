# MyProfile — Next.js 15

Portfolio sử dụng Next.js 15 App Router, TypeScript, `next-intl` và Supabase SSR.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. App Router sẽ chuyển sang route tĩnh `/en`; bản
tiếng Việt ở `/vi`. Dự án không dùng Edge Middleware.

## Environment

Tạo `.env.local` từ `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your-web3forms-access-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Không commit `.env.local`. Anon key có thể xuất hiện ở browser, nhưng Supabase
phải bật RLS và policy/RPC phù hợp cho `page_stats`, `increment_likes` và các
RPC Secret Diary.

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
4. Thêm cả bốn biến ở trên vào Production, Preview và Development. Đặt
   `NEXT_PUBLIC_SITE_URL` thành domain production thật.
5. Deploy.
6. Nếu dùng contact form Web3Forms, thêm domain production vào danh sách domain
   được phép trong Web3Forms.

Không cần tạo Vercel project trước khi commit. Không cần tạo Supabase project
mới nếu database/RPC hiện tại vẫn đang hoạt động.
