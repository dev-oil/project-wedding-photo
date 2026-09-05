/**
 * 버킷의 사진을 전부 로컬로 내려받습니다.
 *
 *   node scripts/download-photos.mjs
 *
 * 비공개 버킷이라 대시보드에서는 파일을 하나씩 눌러야 보입니다.
 * 이 스크립트는 업로드 시각순으로 번호를 붙여 photos-download/에 저장하므로
 * 탐색기에서 순서대로 넘겨보면 됩니다.
 *
 * .env.local의 SUPABASE_URL과 SUPABASE_SECRET_KEY를 사용합니다.
 * (service_role 키라 절대 공유하지 마세요)
 */
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const BUCKET = 'photos';
const OUT_DIR = 'photos-download';
const PAGE_SIZE = 100;

/** .env.local을 직접 읽는다 — next 런타임 밖이라 자동 로드가 안 된다 */
async function loadEnv() {
  const raw = await readFile('.env.local', 'utf8').catch(() => '');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = await loadEnv();
const url = env.SUPABASE_URL || process.env.SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error(
    '.env.local에 SUPABASE_URL과 SUPABASE_SECRET_KEY가 필요합니다.\n' +
      'SECRET_KEY는 Supabase → Settings → API → Secret keys 에서 가져오세요.',
  );
  process.exit(1);
}

const supabase = createClient(url, key);

// 목록은 100개씩 끊어 가져온다
const files = [];
for (let page = 0; ; page++) {
  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    sortBy: { column: 'created_at', order: 'asc' },
  });
  if (error) {
    console.error('목록 조회 실패:', error.message);
    process.exit(1);
  }
  files.push(...data);
  if (data.length < PAGE_SIZE) break;
}

// 폴더 자리표시자 등 이미지가 아닌 항목은 건너뛴다
const photos = files.filter((f) => f.name.endsWith('.jpg'));
console.log(`${photos.length}장을 찾았습니다.`);

if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

let saved = 0;
let failed = 0;
const pad = String(photos.length).length;

for (const [i, file] of photos.entries()) {
  // 업로드 시각순 번호 + 원본 이름 → 탐색기에서 순서대로 넘겨볼 수 있다
  const stamp = (file.created_at ?? '').slice(0, 19).replace(/[:T]/g, '-');
  const out = `${OUT_DIR}/${String(i + 1).padStart(pad, '0')}_${stamp}_${file.name}`;

  const { data, error } = await supabase.storage.from(BUCKET).download(file.name);
  if (error) {
    console.error(`  실패 ${file.name}: ${error.message}`);
    failed++;
    continue;
  }

  await writeFile(out, Buffer.from(await data.arrayBuffer()));
  saved++;
  if (saved % 10 === 0) console.log(`  ${saved}/${photos.length}...`);
}

console.log(`\n완료: ${saved}장 저장${failed ? `, ${failed}장 실패` : ''} → ${OUT_DIR}/`);
