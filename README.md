# Wedding Photo Booth PWA

결혼식 현장에서 사용하는 인생네컷 포토부스 웹앱입니다.
아이패드에 설치하여 풀스크린으로 사용합니다.

## 설치 및 실행

```bash
# Node.js 18+ 필요
nvm use 22

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 정보와 커플 정보를 입력하세요

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build && npm start
```

## 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJ...` |
| `NEXT_PUBLIC_COUPLE_NAMES` | 커플 이름 (타이틀 표시) | `민수 ♥ 지연` |
| `NEXT_PUBLIC_WEDDING_DATE` | 결혼식 날짜 | `2026.05.20` |

## Supabase 설정 가이드

### 1. Storage 버킷 생성
1. Supabase 대시보드 → Storage → New bucket
2. 이름: `photos`, Public bucket: **ON**

### 2. Storage 정책 설정
1. `photos` 버킷 → Policies → New policy
2. **Upload**: Allow INSERT for all users (`anon` role)
3. **Read**: Allow SELECT for all users (`anon` role)

### 3. 자동 삭제 (선택)
Supabase는 현재 기본 lifecycle rules를 제공하지 않으므로,
Edge Function이나 cron job으로 24시간 이전 파일을 주기적으로 삭제하세요.

```sql
-- 예시: 24시간 이전 파일 삭제 (SQL Editor에서 실행)
DELETE FROM storage.objects
WHERE bucket_id = 'photos'
AND created_at < NOW() - INTERVAL '24 hours';
```

## iPad PWA 설치

1. Safari에서 앱 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 풀스크린으로 자동 실행됨

## 색상 테마 변경

`src/styles/tokens.css`의 CSS 변수만 수정하면 됩니다:

```css
:root {
  --color-bg: #fafaf7;    /* 배경색 */
  --color-fg: #1a1a1a;    /* 글자색 */
  --color-muted: #a8a8a3; /* 보조 텍스트 */
  --color-border: #e8e6e0;/* 보더 */
  /* ... */
}
```

## 새 필터 추가

`src/lib/filters.ts`에 객체 하나만 추가:

```ts
{
  id: 'vintage',
  label: '빈티지',
  css: 'sepia(0.5) contrast(1.1) brightness(0.95)',
  postProcess: (ctx, w, h) => {
    applyGrain(ctx, w, h, 0.08);
    applyVignette(ctx, w, h, 0.5);
  },
}
```

## 새 프레임 추가

`src/lib/frames.ts`에 객체 하나만 추가:

```ts
{
  id: 'pink',
  label: '핑크',
  padding: { top: 60, right: 60, bottom: 140, left: 60 },
  gap: 24,
  background: '#ffe4e9',
  textColor: '#8b4557',
  footerText: footer,
}
```

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (CSS 변수 기반 토큰)
- Zustand (상태 관리)
- Supabase Storage (이미지 업로드)
- qrcode.react (QR 생성)
- next-pwa (PWA)
