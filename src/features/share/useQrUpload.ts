/**
 * 결과 이미지를 업로드하고 QR에 넣을 다운로드 URL을 받아옵니다.
 *
 * 상태를 결과 화면까지 끌어올리는 이유 —
 * 예전에는 QR 컴포넌트가 업로드를 혼자 들고 있어서, 사진은 먼저 뜨고 QR만
 * 늦게 나타났습니다. 그 사이 하객이 '처음으로'를 눌러버리면 fetch는 중단되지
 * 않아 사진은 버킷에 올라가는데 링크를 아는 사람은 아무도 없는 상태가 됩니다.
 * 이제 화면 전체가 이 상태를 보고, 준비가 끝나야 사진·QR·버튼을 함께 냅니다.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadPhoto } from '@/lib/upload';
import { useBoothStore } from '@/store/boothStore';

export type QrUploadState =
  | { status: 'uploading' }
  | { status: 'ready'; url: string }
  | { status: 'error'; message: string };

export function useQrUpload(blob: Blob | null): QrUploadState & { retry: () => void } {
  const selectedFrame = useBoothStore((s) => s.selectedFrame);
  const [state, setState] = useState<QrUploadState>({ status: 'uploading' });
  const started = useRef(false); // StrictMode 이중 실행에 의한 중복 업로드 방지

  const run = useCallback(async () => {
    if (!blob) return;
    setState({ status: 'uploading' });
    try {
      setState({ status: 'ready', url: await uploadPhoto(blob, selectedFrame) });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : '업로드에 실패했습니다.',
      });
    }
  }, [blob, selectedFrame]);

  useEffect(() => {
    if (started.current || !blob) return;
    started.current = true;
    run();
  }, [run, blob]);

  return { ...state, retry: run };
}
