/**
 * Supabase 클라이언트 + 이미지 업로드 유틸
 *
 * Supabase 대시보드에서 필요한 설정:
 * 1. Storage → 'photos' 버킷 생성 (public 접근 허용)
 * 2. Policies → 누구나 upload/read 가능하게 설정
 * 3. 자동 삭제: Lifecycle rules에서 24시간 후 삭제 설정
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const BUCKET = 'photos';

// 빌드 시 환경변수가 없을 수 있으므로 lazy init
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.',
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

/** 이미지 Blob을 Supabase Storage에 업로드하고 public URL을 반환 */
export async function uploadPhoto(blob: Blob): Promise<string> {
  const supabase = getSupabase();
  const filename = `${nanoid(8)}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      cacheControl: '86400',
    });

  if (error) {
    throw new Error(`업로드 실패: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
