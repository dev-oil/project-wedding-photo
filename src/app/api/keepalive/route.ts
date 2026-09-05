/**
 * Supabase 프로젝트 깨우기 (Vercel Cron이 하루 한 번 호출)
 *
 * Free 플랜은 7일간 요청이 없으면 프로젝트를 일시정지시킨다. 정지되면
 * 업로드가 전부 실패하고 복구는 대시보드에서 수동으로 눌러야 한다 —
 * 식장에서 겪으면 안 되는 상황이라 미리 막는다.
 *
 * Supabase 내장 pg_cron으로는 해결되지 않는다. 프로젝트가 정지되면 그 안의
 * 스케줄러도 같이 멈춰서 자기가 자기를 깨울 수 없다. 반드시 바깥에서 쏴야 한다.
 *
 * 가벼운 SELECT 하나면 활동으로 인정된다. 데이터를 바꾸지 않는다.
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 캐시된 응답이 돌아오면 Supabase에 요청이 안 가서 의미가 없다
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // 이 라우트는 부스 잠금(proxy)에서 빠져 있다 — Vercel Cron에는 쿠키가 없기
  // 때문. 대신 CRON_SECRET을 걸어두면 Vercel이 붙여 보내는 헤더로만 통과한다.
  // 설정하지 않으면 열린 채로 동작한다(노출되는 건 사진 장수뿐).
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: 'Supabase 환경변수가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const supabase = createClient(url, key);

  // head:true — 행을 실제로 가져오지 않고 개수만 센다
  const { count, error } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true });

  if (error) {
    // 여기서 실패하면 프로젝트가 정지됐거나 키가 잘못된 것 —
    // 조용히 넘어가면 안 된다. 로그에 남겨 Vercel에서 확인할 수 있게 한다.
    console.error('keepalive 실패:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, photos: count, at: new Date().toISOString() });
}
