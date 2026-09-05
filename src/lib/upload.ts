/**
 * 합성 이미지를 업로드 API(/api/photos)로 보내고
 * 7일 유효한 다운로드 URL을 반환합니다.
 * Supabase 접근은 서버 route에서만 — 클라이언트에는 키가 없습니다.
 */
export async function uploadPhoto(blob: Blob, frame: string): Promise<string> {
  const form = new FormData();
  form.append('file', blob, 'photo.jpg');
  form.append('frame', frame);

  const res = await fetch('/api/photos', { method: 'POST', body: form });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.url) {
    throw new Error(body?.error ?? '업로드에 실패했습니다.');
  }
  return body.url;
}
