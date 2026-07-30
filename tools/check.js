// データの突き合わせ。node tools/check.js で走ります。
// ビルド工程はないので、壊れていることに気づく仕掛けはこれだけです。

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// データファイルは const で始まるため、同じスクリプトの中で評価しないと
// 外から読めません。連結してから、末尾で外に出します。
const src = [
  read('garment.js'),
  read('data-colors.js'),
  read('data-styles.js'),
  'globalThis.__out = { SWATCHES, SWATCH_GROUPS, STYLES, PRINCIPLES, RECIPES, TERMS,' +
  ' TOPS, OUTERS, BOTTOMS, SHOES, garmentSVG };',
].join('\n;\n');

const ctx = { globalThis: null, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'data' });

const { SWATCHES, SWATCH_GROUPS, STYLES, PRINCIPLES, RECIPES, TERMS,
        TOPS, OUTERS, BOTTOMS, SHOES, garmentSVG } = ctx.__out;

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

const swatchIds = new Set(SWATCHES.map(s => s.id));
const styleIds  = new Set(STYLES.map(s => s.id));

ok(STYLES.length === 12, `STYLES は 12 件のはずが ${STYLES.length} 件`);
ok(swatchIds.size === SWATCHES.length, 'SWATCHES に id の重複');
ok(styleIds.size === STYLES.length, 'STYLES に id の重複');

// 色見本は index.html にも app.js にも出てくるので、値の妥当性を見ます。
for (const c of SWATCHES) {
  ok(/^#[0-9a-f]{6}$/i.test(c.hex), `${c.id}: hex が不正 (${c.hex})`);
  ok(c.lightness >= 0 && c.lightness <= 100, `${c.id}: lightness が範囲外`);
  ok(['neutral', 'warm', 'cool'].includes(c.hue), `${c.id}: hue が不正 (${c.hue})`);
  // judge() は vivid を無条件に読みます。undefined でも落ちませんが、
  // 診断から黙って外れるので、書き忘れをここで止めます。
  ok(typeof c.vivid === 'boolean', `${c.id}: vivid が boolean ではありません`);
  ok(!(c.neutral && c.vivid), `${c.id}: neutral かつ vivid は成り立ちません`);
}

// レシピが存在しない色や存在しない系統を指していると、画面が黙って壊れます。
for (const r of RECIPES) {
  ok(r.colors.length === 3, `${r.id}: colors は 3 色`);
  r.colors.forEach(c => ok(swatchIds.has(c), `${r.id}: 未知の色 ${c}`));
  r.tags.forEach(t => ok(styleIds.has(t), `${r.id}: 未知の系統タグ ${t}`));
}

// 系統カードは palette から色面を作るので、欠けると帯が崩れます。
for (const s of STYLES) {
  ok(s.palette.base.length >= 2, `${s.id}: palette.base が 2 色未満`);
  ok(s.palette.accent.length >= 1, `${s.id}: palette.accent が空`);
  [...s.palette.base, ...s.palette.accent].forEach(h =>
    ok(/^#[0-9a-f]{6}$/i.test(h), `${s.id}: palette の hex が不正 (${h})`));
  s.adjacent.forEach(a => {
    ok(styleIds.has(a), `${s.id}: 未知の隣接系統 ${a}`);
    ok(a !== s.id, `${s.id}: 自分自身を隣接に含んでいます`);
  });
  // app.js の route() が拾える文字だけに限ります。両方を同時に直してください。
  ok(/^[a-z0-9-]+$/.test(s.id), `${s.id}: id に使えない文字。ハッシュルートが引けません`);
}

// 原則の図は app.js の DEMOS と名前で結びついています。片方だけ直すと図が消えます。
const demoKeys = [...read('app.js').matchAll(/^\s{2}(\w+):\s*\(\)\s*=>/gm)].map(m => m[1]);
for (const p of PRINCIPLES) {
  ok(demoKeys.includes(p.demo), `原則 ${p.num}: app.js の DEMOS に "${p.demo}" がありません`);
}

ok(TERMS.length > 0, 'TERMS が空');

// 色見本の群。ちょうど 1 回ずつ現れないと、選べない色か二重に出る色ができます。
const grouped = SWATCH_GROUPS.flatMap(g => g.ids);
ok(grouped.length === new Set(grouped).size, 'SWATCH_GROUPS に重複した色があります');
for (const id of grouped) ok(swatchIds.has(id), `SWATCH_GROUPS: 未知の色 ${id}`);
for (const c of SWATCHES) ok(grouped.includes(c.id), `${c.id} がどの群にも入っていません。選択肢に出ません`);

// 着装図。型紙の名前が garment.js に無いと、その系統だけ既定の形で描かれ、
// 見た目では気づけません。
for (const s of STYLES) {
  ok(!!s.look, `${s.id}: look がありません`);
  if (!s.look) continue;
  ok(s.look.top    in TOPS,    `${s.id}: 未知の上 "${s.look.top}"`);
  ok(s.look.outer  in OUTERS,  `${s.id}: 未知の羽織り "${s.look.outer}"`);
  ok(s.look.bottom in BOTTOMS, `${s.id}: 未知の下 "${s.look.bottom}"`);
  ok(s.look.shoe   in SHOES,   `${s.id}: 未知の足元 "${s.look.shoe}"`);

  const need = ['top', 'bottom', 'shoe'];
  if (s.look.outer !== 'none') need.push('outer');
  for (const k of need) {
    ok(/^#[0-9a-f]{6}$/i.test(s.look.colors[k] || ''),
       `${s.id}: look.colors.${k} が不正 (${s.look.colors[k]})`);
  }
  // outer が none なのに色を書いていると、直したつもりが効きません。
  ok(!(s.look.outer === 'none' && s.look.colors.outer),
     `${s.id}: outer は none なのに colors.outer が書かれています`);

  // 実際に描かせて、閉じた SVG になるかを見ます。
  const svg = garmentSVG(s.look);
  ok(svg.trim().startsWith('<svg') && svg.includes('</svg>'), `${s.id}: SVG が組み立てられません`);
  ok(!svg.includes('undefined'), `${s.id}: SVG に undefined が混ざっています`);
}

// グラデーションの id は instance ごとに変えないと、同じ画面に複数置いたとき
// 最初の影が全部に効きます。2 回呼んで id が変わることを確かめます。
{
  const a = garmentSVG(STYLES[0].look), b = garmentSVG(STYLES[0].look);
  const idOf = s => (s.match(/id="(gsh\d+)"/) || [])[1];
  ok(idOf(a) && idOf(b) && idOf(a) !== idOf(b), 'garmentSVG: 影の id が使い回されています');
}

// 座標系。中心線が 100 でないと、体と服の型紙が合いません。
ok(/viewBox="0 0 200 300"/.test(read('garment.js')), 'garment.js: viewBox が 200x300 ではありません');

// 羽織りは前開きでなければいけません。一枚の板にすると、上より大きい分だけ
// 中の服を覆い隠し、3色のうち1色が絵から消えます。
// 身頃のどのパーツも中心の通り道（92〜108）を跨がないことを確かめます。
// フード（Q を含む曲線）は頭を包むので跨いで構いません。
for (const [name, paths] of Object.entries(OUTERS)) {
  if (name === 'none') continue;
  const panels = paths.filter(d => !d.includes('Q'));
  ok(panels.length >= 2, `OUTERS.${name}: 身頃が ${panels.length} 枚。前開きなら 2 枚必要です`);
  for (const d of panels) {
    const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const xs = n.filter((_, i) => i % 2 === 0);
    const left = xs.every(x => x <= 94), right = xs.every(x => x >= 106);
    ok(left || right,
       `OUTERS.${name}: 身頃が中心を跨いでいます（x ${Math.min(...xs)}〜${Math.max(...xs)}）。中の服が隠れます`);
  }
}

// 羽織りと上が同じ色だと、開けた意味がありません。
for (const s of STYLES) {
  if (s.look && s.look.outer !== 'none') {
    ok(s.look.colors.top !== s.look.colors.outer,
       `${s.id}: 羽織りと上が同色です。前を開けても違いが出ません`);
  }
}

// 白紙事故の見張り。スクロール演出で中身を隠す指定は、必ず html.js の下に
// なければいけません。素の [data-lazy] に opacity:0 を書くと、
// JavaScript が動かなかった環境でページ全体が消えます。
const css = read('style.css');
const bareHide = /^\s*\[data-lazy\][^{]*\{[^}]*opacity:\s*0/m.test(css);
ok(!bareHide, 'style.css: [data-lazy] を .js で囲わずに隠しています。JS 無効時に白紙になります');
ok(/\.js \[data-lazy\]/.test(css), 'style.css: .js [data-lazy] の指定が見当たりません');
ok(/classList\.add\('js'\)/.test(read('app.js')), "app.js: html に 'js' クラスを付ける行がありません");

if (fails.length) {
  console.error(`✕ ${fails.length} 件\n` + fails.map(f => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log(`✓ 通過  系統 ${STYLES.length} / 色 ${SWATCHES.length} / 原則 ${PRINCIPLES.length} / 配色 ${RECIPES.length} / 用語 ${TERMS.length}`);
