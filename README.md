# Wedding Photo Booth PWA

결혼식 현장에서 사용하는 인생네컷 포토부스 웹앱입니다.
아이패드에 설치하여 풀스크린으로 사용합니다.

## 설치 및 실행

```bash
# Node.js 24 (LTS) + pnpm 필요 — .nvmrc 기준
nvm use

# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 정보를 입력하세요
# (커플 이름·날짜는 환경변수가 아니라 src/lib/couple.ts에 있습니다)

# 개발 서버
pnpm dev

# 프로덕션 빌드
pnpm build && pnpm start
```

## 환경변수

업로드는 전부 서버(`/api/photos`)에서 처리하므로 브라우저로 나가는 키가 없습니다.
그래서 `NEXT_PUBLIC_` 접두사가 붙은 변수는 목 카메라 스위치 하나뿐입니다.

| 변수 | 설명 | 어디에 |
|------|------|--------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | 로컬 + Vercel |
| `SUPABASE_SECRET_KEY` | service_role 키 — **서버 전용, 절대 공개 금지** | 로컬 + Vercel |
| `BOOTH_KEY` | 사이트 잠금 비밀번호. 비워두면 잠기지 않음 | Vercel만 |
| `NEXT_PUBLIC_MOCK_CAMERA` | `true`면 카메라 대신 목업 영상 | 로컬만 |

`BOOTH_KEY`를 로컬에 넣으면 개발 중에도 잠깁니다.
`NEXT_PUBLIC_MOCK_CAMERA`를 Vercel에 넣으면 행사장에서 목업 영상이 뜹니다.

커플 이름과 날짜는 화면에 그대로 찍히는 값이라 환경변수가 아니라
`src/lib/couple.ts` 상수로 둡니다. 바꾸려면 파일을 고치고 다시 배포하세요.

## Supabase 설정 가이드

### 1. Storage 버킷 생성
1. Supabase 대시보드 → Storage → New bucket
2. 이름: `photos`, Public bucket: **OFF** (비공개)

버킷을 비공개로 두고, 촬영이 끝나면 서버가 7일짜리 signed URL을
만들어 QR에 담습니다. 링크를 모르면 아무도 사진을 볼 수 없습니다.

### 2. 정책 설정
따로 없습니다. 서버가 service_role 키로 접근하므로 RLS를 우회합니다.
`anon` 역할에는 어떤 권한도 주지 마세요 — 주는 순간 버킷이 열립니다.

### 3. 통계 테이블 생성 (선택)
프레임별 사용 횟수를 남깁니다. 없어도 촬영·QR은 정상 동작합니다.

```sql
create table photos (
  id          bigint generated always as identity primary key,
  storage_path text not null,
  frame_type   text,
  created_at   timestamptz not null default now()
);
alter table photos enable row level security; -- 정책 없음 = 서버만 접근
```

### 4. 사진 보관

**자동 삭제는 설정되어 있지 않습니다.** 사진은 직접 지우기 전까지 버킷에
영구히 남습니다 — 의도된 동작입니다(촬영본은 모두 보존).

signed URL의 7일 만료는 *링크*가 열리는 기간일 뿐, 파일 수명이 아닙니다.

행사가 끝나고 정리하실 때만 아래처럼 지우세요. **되돌릴 수 없으니**
먼저 `scripts/download-photos.mjs`로 내려받아 두시길 권합니다.

```sql
-- 주의: 영구 삭제. 반드시 백업 후 실행할 것.
-- delete from storage.objects
-- where bucket_id = 'photos' and created_at < '2026-11-08';
```

## iPad PWA 설치

1. Safari에서 앱 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 풀스크린으로 자동 실행됨

## 색상 테마 변경

`src/styles/tokens.css`의 CSS 변수만 수정하면 됩니다:

```css
:root {
  --color-bg: #f2f5ea;     /* 배경색 */
  --color-fg: #20301f;     /* 글자색 */
  --color-accent: #5a8f4e; /* 포인트 */
  --color-muted: #8a9b7e;  /* 보조 텍스트 */
  --color-border: #dde3d1; /* 보더 */
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

`src/lib/frames.ts`에 객체 하나만 추가 (배치는 2×2 고정 레이아웃 공용, 색 구성만 정의):

```ts
{
  id: 'pink',
  label: '핑크',
  background: '#ffe4e9',
  textColor: '#8b4557',
  footerText: footer,
}
```

## 기술 스택

- Node.js 24 (LTS) + pnpm
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS (CSS 변수 기반 토큰)
- Zustand (상태 관리)
- Supabase Storage (비공개 버킷 + signed URL)
- qrcode.react (QR 생성)
- Serwist (PWA 서비스 워커 — `src/app/sw.ts`)
