/**
 * QR 코드 뷰 — 발급된 다운로드 URL을 QR로 그립니다.
 *
 * 업로드는 결과 화면이 useQrUpload로 처리합니다. 이 컴포넌트는 URL이
 * 준비된 뒤에만 그려지므로 로딩·에러 상태를 알 필요가 없습니다.
 */
'use client';

import { QRCodeSVG } from 'qrcode.react';

export function QRCodeView({ url }: { url: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-[clamp(8px,calc(var(--u)*1.8),12px)]">
      {/*
        QRCodeSVG는 viewBox가 있는 SVG라 w-full로 컨테이너에 맞춰 늘어난다.
        size는 고정 픽셀이라 좁은 화면에서 컬럼 밖으로 삐져나오므로
        내재 크기로만 두고 실제 크기는 CSS가 정한다.
      */}
      <div className="w-full max-w-[180px] rounded-[min(calc(var(--u)*2.2),16px)] bg-bg p-[min(calc(var(--u)*1.8),14px)]">
        <QRCodeSVG value={url} size={180} level="M" className="h-auto w-full" />
      </div>
      <p className="text-center font-body text-[clamp(11px,calc(var(--u)*1.8),13px)] leading-[1.5] text-muted">
        QR을 스캔하면 사진이 저장됩니다
        <br />
        (링크는 24시간 동안 유효합니다)
      </p>
    </div>
  );
}
