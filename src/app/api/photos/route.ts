/**
 * 사진 업로드 API (서버 전용)
 * 합성 이미지를 private 버킷에 올리고, 프레임 통계를 남긴 뒤
 * 7일 유효한 signed URL을 돌려줍니다.
 * service_role 키는 이 파일(서버)에서만 사용됩니다.
 */
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

const BUCKET = 'photos';
// QR 링크 수명. 24시간은 너무 빡빡했다 — 하객이 화면을 사진으로 찍어뒀다가
// 다음날 스캔하면 이미 만료다. 파일 자체는 버킷에 계속 남고, 이 값은
// 링크가 열리는 기간일 뿐이다. 버킷은 여전히 비공개.
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7일

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: 'Supabase 환경변수가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }
  const supabase = createClient(url, key);

  const form = await req.formData();
  const file = form.get('file');
  const frame = form.get('frame');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }

  const path = `${nanoid(8)}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: 'image/jpeg' });
  if (uploadError) {
    return NextResponse.json(
      { error: `업로드 실패: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // 프레임 통계는 부가 기능 — 실패해도 QR 발급은 계속한다
  const { error: insertError } = await supabase.from('photos').insert({
    storage_path: path,
    frame_type: typeof frame === 'string' ? frame : null,
  });
  if (insertError) console.error('통계 저장 실패:', insertError.message);

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError) {
    return NextResponse.json(
      { error: `링크 생성 실패: ${signError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}
