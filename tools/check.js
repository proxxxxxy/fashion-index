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
  read('judge.js'),
  read('data-colors.js'),
  read('data-styles.js'),
  read('closet.js'),
  'globalThis.__out = { SWATCHES, SWATCH_GROUPS, STYLES, PRINCIPLES, RECIPES, TERMS, EXCEPTIONS,' +
  ' TOPS, OUTERS, BOTTOMS, SHOES, HATS, DETAILS, TYPE_NAMES, garmentSVG, judge,' +
  ' CLOSET_PARTS, typesOf, parseCloset, formatCloset, summarise, bestAddition, starterCloset };',
].join('\n;\n');

const ctx = { globalThis: null, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'data' });

const { SWATCHES, SWATCH_GROUPS, STYLES, PRINCIPLES, RECIPES, TERMS, EXCEPTIONS,
        TOPS, OUTERS, BOTTOMS, SHOES, HATS, DETAILS, TYPE_NAMES, garmentSVG, judge,
        CLOSET_PARTS, typesOf, parseCloset, formatCloset, summarise, bestAddition,
        starterCloset } = ctx.__out;

/* パスから座標を取り出します。
   最初は数値を並び順で x,y,x,y… と数えていましたが、それだと H（水平）と
   V（垂直）が壊れます。値が 1 つしかないので、以降の x と y が入れ替わり、
   靴の幅が 76〜313 と報告されました。実害が出る前に気づけましたが、
   検算する側が壊れているのが最も危ないので、素直に解釈します。 */
function points(d) {
  const toks = d.match(/[MLCHVZmlchvz]|-?\d+(?:\.\d+)?/g) || [];
  const pts = [];
  let cmd = '', x = 0, y = 0, i = 0;
  const num = () => Number(toks[i++]);
  while (i < toks.length) {
    if (/^[MLCHVZmlchvz]$/.test(toks[i])) { cmd = toks[i++]; continue; }
    switch (cmd) {
      case 'M': case 'L': x = num(); y = num(); pts.push([x, y]); break;
      case 'C': for (let k = 0; k < 3; k++) { x = num(); y = num(); pts.push([x, y]); } break;
      case 'H': x = num(); pts.push([x, y]); break;
      case 'V': y = num(); pts.push([x, y]); break;
      default:  num();  // 想定外のコマンドは読み捨てて、下で落とします
    }
  }
  return pts;
}

// 検算するパスは M/L/C/H/V/Z だけで書く決まりです。他が混ざると
// points() が黙って取りこぼします。
const simpleOnly = d => !/[AaQqSsTt]/.test(d);

const yMax = d => Math.max(...points(d).map(p => p[1]));
const xsOf = d => points(d).map(p => p[0]);

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

// 例外。条件を書かずに例外だけ並べると、真似した人が外します。
// 「何を破っているか」は原則番号か通説のどちらかで必ず名指しします。
for (const x of EXCEPTIONS) {
  ok(x.colors.length === 3, `${x.id}: colors は 3 色`);
  x.colors.forEach(c => ok(swatchIds.has(c), `${x.id}: 未知の色 ${c}`));
  ok(!!x.why && x.why.length >= 40, `${x.id}: why が短すぎます（なぜ成立するのかを書く欄）`);
  ok(!!x.cond && x.cond.length >= 20, `${x.id}: cond が空です。条件なしの例外は真似できません`);
  ok(!!(x.breaks || x.myth), `${x.id}: breaks も myth も無い。何を破っているのか不明です`);
  ok(!(x.breaks && x.myth), `${x.id}: breaks と myth の両方は書きません`);
  // 原則番号を書くなら、実在する番号であること。
  if (x.breaks) {
    for (const n of x.breaks.split('/').map(s => s.trim())) {
      ok(PRINCIPLES.some(p => p.num === n), `${x.id}: 原則 ${n} は存在しません`);
    }
  }
}

// 例外の主張と、実際の診断が合っているか。ここがずれると、
// 「原則05 を破る」と書いた札の隣で診断が「通ります」と言う画面になります。
// judge.js を独立させたのは、この検算を画面なしで回すためです。
const bySwatch = id => SWATCHES.find(c => c.id === id);
for (const x of EXCEPTIONS) {
  const j = judge(...x.colors.map(bySwatch));
  const badMarks = [...new Set(j.notes.filter(n => n.kind === 'bad').map(n => n.mark))].sort();

  if (x.breaks) {
    const claimed = x.breaks.split('/').map(t => t.trim()).sort();
    ok(claimed.join(',') === badMarks.join(','),
       `${x.id}「${x.name}」: 原則 ${claimed.join('/')} を破ると書いていますが、`
       + `診断が落とすのは ${badMarks.join('/') || 'なし'} です`);
  } else {
    // 通説を破る組は、この索引の原則では通らなければいけません。
    ok(badMarks.length === 0,
       `${x.id}「${x.name}」: 通説の例外としていますが、原則 ${badMarks.join('/')} で落ちます`);
  }
}

// 収録した20組も同じ突き合わせをします。r14 だけは意図した例外です。
{
  const flagged = RECIPES.filter(r => judge(...r.colors.map(bySwatch)).bad > 0).map(r => r.id);
  ok(flagged.length === 1 && flagged[0] === 'r14',
     `RECIPES と診断の食い違いが ${flagged.join(',') || 'なし'}。意図した例外は r14 だけです`);
}

// 全通り。例外を投げず、必ず1つ以上の指摘を返すこと。
{
  let crashed = 0, silent = 0;
  for (const a of SWATCHES) for (const b of SWATCHES) for (const c of SWATCHES) {
    for (const h of [null, ...SWATCHES]) {
      try { const j = judge(a, b, c, h); if (!j.notes.length) silent++; }
      catch { crashed++; }
    }
  }
  ok(crashed === 0, `judge が ${crashed} 通りで例外を投げます`);
  ok(silent === 0, `judge が ${silent} 通りで何も言いません`);
}

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
// y の下限が負なのは、帽子と頭を原点より上に足したためです。既存の型紙は
// 1 つも動かしていないので、ここを 0 に戻すと頭が切れます。
ok(/const VIEW_BOX = '0 -14 200 336'/.test(read('garment.js')),
   'garment.js: VIEW_BOX が変わっています。頭と帽子が切れないか確かめてください');

// 帽子の型紙。冠と鍔（または折り返し）で 2 枚あるはずです。
for (const [name, paths] of Object.entries(HATS)) {
  if (name === 'none') continue;
  ok(paths.length >= 1, `HATS.${name}: 型紙が空です`);
  // 帽子は額より上（y <= 34）にしか出てきてはいけません。顎は 44 です。
  for (const d of paths) {
    ok(simpleOnly(d), `HATS.${name}: 検算できないコマンドが混ざっています`);
    ok(yMax(d) <= 34, `HATS.${name}: 帽子が顔の下まで下りています（y ${yMax(d)}）`);
  }
}

// 線だけのパーツ。型紙に線が無いと、その部位だけ無地のままになり、
// 一枚だけ雑に見えます。カテゴリ名の対応も見ます（tailored は上にも
// 羽織りにもあるので、名前だけでは足りません）。
const PART_SETS = { top: TOPS, outer: OUTERS, bottom: BOTTOMS, shoe: SHOES, hat: HATS };
for (const [cat, set] of Object.entries(PART_SETS)) {
  ok(DETAILS[cat], `DETAILS に ${cat} がありません`);
  for (const name of Object.keys(set)) {
    if (name === 'none') continue;
    const lines = (DETAILS[cat] || {})[name];
    ok(Array.isArray(lines) && lines.length > 0,
       `DETAILS.${cat}.${name} が空です。この部位だけ無地になります`);
  }
  // 逆向き。使われない線を書いても気づけないので。
  for (const name of Object.keys(DETAILS[cat] || {})) {
    ok(name in set, `DETAILS.${cat}.${name} に対応する型紙がありません`);
  }
}

// 帽子を指す系統は、帽子の色も持っていなければ描けません。
for (const s of STYLES) {
  if (!s.look) continue;
  const hat = s.look.hat || 'none';
  ok(hat in HATS, `${s.id}: 未知の帽子 "${hat}"`);
  if (hat !== 'none') {
    ok(/^#[0-9a-f]{6}$/i.test(s.look.colors.hat || ''),
       `${s.id}: look.colors.hat が不正 (${s.look.colors.hat})`);
  } else {
    ok(!s.look.colors.hat, `${s.id}: 帽子は none なのに colors.hat が書かれています`);
  }
}

// 羽織りは前開きでなければいけません。一枚の板にすると、上より大きい分だけ
// 中の服を覆い隠し、3色のうち1色が絵から消えます。
// 身頃のどのパーツも中心の通り道（92〜108）を跨がないことを確かめます。
//
// 身頃かどうかは「裾まで届いているか」で見ます（最大 y が 120 を超える）。
// フードや襟は肩より上で閉じるので、跨いで構いません。曲線の種類で
// 見分けようとして、C で描いたフードを身頃と誤判定したことがあります。
for (const [name, paths] of Object.entries(OUTERS)) {
  if (name === 'none') continue;
  const panels = paths.filter(d => yMax(d) > 120);
  ok(panels.length >= 2, `OUTERS.${name}: 裾まで届く身頃が ${panels.length} 枚。前開きなら 2 枚必要です`);
  for (const d of panels) {
    ok(simpleOnly(d), `OUTERS.${name}: 検算できないコマンドが混ざっています`);
    const xs = xsOf(d);
    const left = xs.every(x => x <= 94), right = xs.every(x => x >= 106);
    ok(left || right,
       `OUTERS.${name}: 身頃が中心を跨いでいます（x ${Math.min(...xs)}〜${Math.max(...xs)}）。中の服が隠れます`);
  }
}

/* 横幅。肩は x 64-136（70 幅）です。ここから外へ出るのは袖山と羽織りの
   肩だけで、片側 12 までに抑えます。88 幅で描いていたときは、上着が
   虫の胸部のように張り出して、頭と腰が細く見えました。 */
{
  const widest = paths => {
    const xs = paths.filter(simpleOnly).flatMap(xsOf);
    return [Math.min(...xs), Math.max(...xs)];
  };
  const limit = (label, paths, out) => {
    if (!paths.length) return;
    const [lo, hi] = widest(paths);
    ok(lo >= 64 - out && hi <= 136 + out,
       `${label}: 肩（64-136）から片側 ${out} を超えて張り出しています（${lo}-${hi}）`);
  };
  for (const [k, v] of Object.entries(TOPS))   limit(`TOPS.${k}`, v, 18);
  for (const [k, v] of Object.entries(OUTERS)) limit(`OUTERS.${k}`, v, 26);
  // 靴が肩より外に出ると、それだけでがに股に見えます。
  for (const [k, v] of Object.entries(SHOES))  limit(`SHOES.${k}`, v, 0);
}

/* 型紙の日本語名。名前が無い型紙は、クローゼットの選択肢に
   内部の英語名のまま出ます。 */
for (const [cat, set] of Object.entries(PART_SETS)) {
  ok(TYPE_NAMES[cat], `TYPE_NAMES に ${cat} がありません`);
  for (const name of Object.keys(set)) {
    if (name === 'none') continue;
    ok((TYPE_NAMES[cat] || {})[name], `TYPE_NAMES.${cat}.${name} がありません`);
  }
  for (const name of Object.keys(TYPE_NAMES[cat] || {})) {
    ok(name in set, `TYPE_NAMES.${cat}.${name} に対応する型紙がありません`);
  }
}

/* 手持ちから。ここは数を出す区画なので、数が正しいことを確かめます。 */
{
  // 部位の記号は URL の意味そのものです。変えると配ったリンクが別物を指します。
  ok(CLOSET_PARTS.map(p => p.tag).join('') === 'hotbs',
     'CLOSET_PARTS の記号が変わっています。配ったクローゼットのリンクが別物を指します');

  // 往復。書いて読んで同じものが戻ること。
  const seed = starterCloset();
  ok(seed.length > 0, 'starterCloset が空です');
  ok(formatCloset(parseCloset(formatCloset(seed))) === formatCloset(seed),
     'クローゼットの符号化が往復しません');

  // 壊れた入力で落ちないこと。
  for (const bad of ['', 'x-y-z', 't-nope-white', 't-shirt-nope', '...', 'h-cap-navy.h-cap-navy']) {
    let ok2 = true;
    try { parseCloset(bad); } catch { ok2 = false; }
    ok(ok2, `parseCloset("${bad}") が例外を投げます`);
  }
  ok(parseCloset('h-cap-navy.h-cap-navy').length === 1, 'parseCloset が同じ服を二重に数えます');

  // 数え方。上下足元が 1 点ずつなら、帽子も羽織りも無いので 1 通りだけ。
  const one = parseCloset('t-shirt-white.b-slim-navy.s-low-brown');
  ok(summarise(one).total === 1, `上下足元1点ずつで ${summarise(one).total} 通りと数えています`);

  /* 帽子を 1 点足しても、組める「組」は増えません。帽子は同じ 3 点の
     着方の違いなので、掛け算しないのが正しい数え方です。ここを掛けていた
     ときは「次に買う1着＝黒のキャップ、+10通り」という無意味な助言が出ました。 */
  const two = parseCloset('t-shirt-white.b-slim-navy.s-low-brown.h-cap-navy');
  ok(summarise(two).total === 1,
     `帽子を足して ${summarise(two).total} 通りに増えています。着方を掛け算しています`);

  // 必須部位が欠けていたら 0 通り。
  ok(summarise(parseCloset('t-shirt-white.b-slim-navy')).total === 0,
     '足元が無いのに組める通りが出ています');

  // 総数は掛け算と一致すること。
  const many = starterCloset();
  const n = k => many.filter(i => i.part === k).length;
  // 着方（帽子・羽織りの有無）は掛けません。3 点の組み合わせだけです。
  const expect = n('top') * n('bottom') * n('shoe');
  ok(summarise(many).total === expect,
     `見本の総数が ${summarise(many).total}、掛け算では ${expect}`);

  // 見本は、通る組が 1 つ以上なければ道具になりません。
  ok(summarise(many).clear > 0, '見本のクローゼットで通る組が 0 です');

  /* 次に買う1着は、本当に増える1着でなければいけません。
     「増える」と言いながら増えないなら、近似が混ざっています。 */
  const buy = bestAddition(many);
  if (buy) {
    const after = summarise([...many, buy.item]).clear;
    ok(after === buy.to, `次に買う1着の予想が ${buy.to}、実際は ${after}`);
    ok(buy.gained > 0, '次に買う1着で通る組が増えていません');
    ok(!many.some(i => i.part === buy.item.part && i.type === buy.item.type
                    && i.color === buy.item.color),
       '次に買う1着が、すでに持っている服です');
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
