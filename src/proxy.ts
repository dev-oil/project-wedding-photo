/**
 * 키오스크 잠금 (Next 16 proxy — 구 middleware)
 * BOOTH_KEY 환경변수가 설정된 환경에서만 동작합니다 (로컬 개발은 열림).
 * 잠긴 상태에선 비밀번호 입력 화면을 보여줍니다 — 설치형 PWA는 주소창이
 * 없어서 ?key= 를 직접 칠 수 없기 때문. 폼이 GET으로 ?key=값을 제출하면
 * 1년짜리 쿠키를 심고, 이후 모든 페이지·API 요청은 그 쿠키로 통과합니다.
 */
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'booth_key';

function lockPage(wrongKey: boolean): NextResponse {
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>잠김</title>
<style>
  body { margin: 0; display: flex; min-height: 100vh; align-items: center;
    justify-content: center; background: #f2f5ea; font-family: sans-serif; }
  form { display: flex; flex-direction: column; gap: 14px; width: 260px; text-align: center; }
  h1 { font-size: 18px; color: #1d4634; margin: 0; font-weight: 600; }
  input { padding: 14px; font-size: 18px; text-align: center; border-radius: 14px;
    border: 1.5px solid #1d4634; background: #fff; outline: none; }
  button { padding: 14px; font-size: 16px; font-weight: 600; border: none;
    border-radius: 14px; background: #1d4634; color: #f2f5ea; }
  p { color: #b0442c; font-size: 14px; margin: 0; min-height: 17px; }
</style>
</head>
<body>
<form method="GET" action="/">
  <h1>비밀번호를 입력하세요</h1>
  <input name="key" type="password" autofocus autocomplete="off">
  <p>${wrongKey ? '비밀번호가 틀렸습니다' : ''}</p>
  <button>열기</button>
</form>
</body>
</html>`;
  return new NextResponse(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export function proxy(req: NextRequest) {
  const key = process.env.BOOTH_KEY;
  if (!key) return NextResponse.next();

  // 폼(또는 주소창)의 ?key=... → 맞으면 쿠키 심고 쿼리 제거한 주소로 리다이렉트
  const supplied = req.nextUrl.searchParams.get('key');
  if (supplied === key) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('key');
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, key, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
    });
    return res;
  }

  if (req.cookies.get(COOKIE)?.value === key) return NextResponse.next();

  // API 요청엔 HTML 대신 JSON
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'locked' }, { status: 401 });
  }
  return lockPage(supplied !== null);
}

// 정적 리소스는 잠그지 않는다.
// PWA 설치 자산(manifest·아이콘·서비스워커)도 제외 — 잠금 화면이 401 HTML을
// 돌려주면 브라우저가 manifest를 못 읽어 '앱 설치'가 아예 뜨지 않는다.
export const config = {
  matcher: [
    '/((?!_next|favicon.ico|manifest.json|sw.js|workbox-|icon-|apple-touch-icon).*)',
  ],
};
