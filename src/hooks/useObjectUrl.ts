/**
 * Blob → Object URL 변환 훅. 언마운트/교체 시 URL을 해제합니다.
 */
'use client';

import { useEffect, useMemo } from 'react';

export function useObjectUrl(blob: Blob | null): string | null {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
