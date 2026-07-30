/* ============================================================
   WARDROBE INDEX — 画面の組み立て
   ビルド工程はありません。このファイルがそのまま動きます。
   ============================================================ */

'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const byId = (list, id) => list.find(x => x.id === id);
const swatch = id => byId(SWATCHES, id);

/* 少しずつ傾ける。同じ角度が並ぶと機械的に見えるので、
   index から決め打ちの疑似乱数で散らします。 */
const tilt = i => ((Math.sin(i * 12.9898) * 43758.5453) % 1 * 2.4 - 1.2).toFixed(2) + 'deg';

/* 現れる順の差。40ms ずつずらし、8 枚目で頭打ちにします。
   均等に伸ばし続けると、下のほうのカードが目に見えて待たされます。 */
const stagger = i => Math.min(i, 8) * 40 + 'ms';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

/* ── 系統 ───────────────────────────────────── */

function renderStyles() {
  const grid = $('#style-grid');
  if (!grid) return;

  // data-styles.js がまだ無い状態でも、他の画面は動かします。
  if (typeof STYLES === 'undefined' || !Array.isArray(STYLES)) {
    grid.innerHTML = '<p class="card-one">系統データを読み込めませんでした。</p>';
    return;
  }

  grid.innerHTML = STYLES.map((s, i) => {
    const band = [...s.palette.base, ...s.palette.accent]
      .map(c => `<span style="background:${esc(c)}"></span>`).join('');
    // 系統の説明は、布の厚みや落ち方まで読める実写で見せます。
    // 色を試すラボの着装図は、選択に合わせて描き直せる SVG のまま残します。
    const photo = `assets/styles/${encodeURIComponent(s.id)}.jpg`;
    const lookNo = String(i + 1).padStart(2, '0');
    return `
      <button type="button" class="style-card" data-style="${esc(s.id)}" style="--rot:${tilt(i)};--stagger:${stagger(i)}">
        <span class="card-era">${esc(s.era)}</span>
        <span class="card-figure">
          <img class="style-photo" src="${photo}" alt="${esc(s.name)}の着こなし例"
               width="768" height="1152" loading="lazy" decoding="async">
          <span class="photo-index" aria-hidden="true">LOOK ${lookNo}</span>
        </span>
        <span class="card-band" aria-hidden="true">${band}</span>
        <span class="card-body">
          <span class="card-en">${esc(s.en)}</span>
          <span class="card-name">${esc(s.name)}</span>
          <span class="card-one">${esc(s.oneLine)}</span>
        </span>
      </button>`;
  }).join('');

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-style]');
    if (card) location.hash = '#/style/' + card.dataset.style;
  });
}

function openSheet(id) {
  if (typeof STYLES === 'undefined') return;
  const s = byId(STYLES, id);
  if (!s) return closeSheet();

  const band = [...s.palette.base, ...s.palette.accent]
    .map(c => `<span style="background:${esc(c)}"></span>`).join('');

  const near = s.adjacent
    .map(a => byId(STYLES, a))
    .filter(Boolean)
    .map(a => `<button type="button" data-style="${esc(a.id)}">${esc(a.name)}</button>`)
    .join('');
  const photo = `assets/styles/${encodeURIComponent(s.id)}.jpg`;

  $('#sheet-content').innerHTML = `
    <h3 id="sheet-title">${esc(s.name)}</h3>
    <p class="s-en">${esc(s.en)} &nbsp;·&nbsp; ${esc(s.era)}</p>
    <div class="s-band" aria-hidden="true">${band}</div>
    <div class="s-lead">
      <div class="s-figure">
        <img class="style-photo" src="${photo}" alt="${esc(s.name)}の着こなし例"
             width="768" height="1152" decoding="async">
      </div>
      <p class="s-body">${esc(s.body)}</p>
    </div>
    <dl class="s-rows">
      <div class="s-row"><dt>SHAPE</dt><dd>${esc(s.silhouette)}</dd></div>
      <div class="s-row"><dt>ITEMS</dt><dd class="tags">${s.keyItems.map(k => `<span>${esc(k)}</span>`).join('')}</dd></div>
      <div class="s-row"><dt>FABRIC</dt><dd class="tags">${s.materials.map(k => `<span>${esc(k)}</span>`).join('')}</dd></div>
      <div class="s-row"><dt>SHOES</dt><dd class="tags">${s.footwear.map(k => `<span>${esc(k)}</span>`).join('')}</dd></div>
      <div class="s-row"><dt>COLOR</dt><dd>${esc(s.palette.note)}</dd></div>
    </dl>
    <div class="s-pitfall">
      <b>よくある失敗</b>
      <p>${esc(s.pitfall)}</p>
    </div>
    <dl class="s-rows">
      <div class="s-row"><dt>NEAR</dt><dd class="tags">${near}</dd></div>
    </dl>`;

  $('#sheet').hidden = false;
  document.body.style.overflow = 'hidden';
  $('.sheet-close').focus();
}

function closeSheet() {
  $('#sheet').hidden = true;
  document.body.style.overflow = '';
}

/* ── 原則 ───────────────────────────────────── */

// 原則ごとの図。文章より先に目に入る場所なので、色面だけで言い切ります。
const DEMOS = {
  ratio: () => `<div class="demo-ratio"><span>70 BASE</span><span>25</span><span>5</span></div>`,

  count: () => `<div class="demo-swatches">
      <i style="background:#22293f">紺</i><i style="background:#e6dfd0">生成り</i>
      <i style="background:#5c4433">茶</i><i style="background:#b83b32" class="x">赤</i>
    </div>`,

  tone: () => `<div class="demo-swatches">
      <i style="background:#4e5236">緑</i><i style="background:#7a4a44">赤</i><i style="background:#42506b">青</i>
      <span style="width:1rem"></span>
      <i style="background:#2f8f4a">緑</i><i style="background:#42506b" class="x">青</i>
    </div>`,

  contrast: () => `<div class="demo-cols">
      <div class="demo-col"><b style="background:#e6dfd0"></b><i style="background:#22293f"></i><p>明→暗<br>落ち着く</p></div>
      <div class="demo-col"><b style="background:#22293f"></b><i style="background:#e6dfd0"></i><p>暗→明<br>軽い</p></div>
      <div class="demo-col"><b style="background:#3a3d42"></b><i style="background:#3a3d42"></i><p>同じ<br>背が高い</p></div>
    </div>`,

  accent: () => `<div class="demo-cols">
      <div class="demo-col"><b style="background:#b83b32"></b><i style="background:#22293f"></i><p>胸の赤<br>主張に見える</p></div>
      <div class="demo-col"><b style="background:#e6dfd0"></b><i style="background:#22293f"></i><p>足元の赤<br>意図に見える</p></div>
      <div class="demo-col"><b style="background:#e6dfd0"></b><i style="background:#22293f;border-bottom:6px solid #b83b32"></i><p>こちら</p></div>
    </div>`,

  repeat: () => `<div class="demo-cols">
      <div class="demo-col"><b style="background:#5c4433"></b><i style="background:#22293f"></i><p>1か所<br>浮く</p></div>
      <div class="demo-col"><b style="background:#5c4433"></b><i style="background:#22293f;border-bottom:8px solid #5c4433"></i><p>2か所<br>意図に変わる</p></div>
      <div class="demo-col"><b style="background:#5c4433"></b><i style="background:#5c4433"></i><p>3か所<br>揃えた感じ</p></div>
    </div>`,

  material: () => `<div class="demo-swatches">
      <i style="background:#22293f">ウール</i>
      <i style="background:linear-gradient(120deg,#22293f,#41527e 45%,#22293f)">ナイロン</i>
      <i style="background:#35486b">デニム</i>
    </div>`,

  skin: () => `<div class="demo-cols">
      <div class="demo-col"><b style="background:#e6dfd0"></b><i style="background:#a97c46"></i><p>黄み寄り<br>生成り・キャメル</p></div>
      <div class="demo-col"><b style="background:#f4f2ed"></b><i style="background:#22293f"></i><p>青み寄り<br>白・紺</p></div>
      <div class="demo-col"><b style="background:#8c8f94"></b><i style="background:#8c8f94"></i><p>グレーは<br>どちらでも</p></div>
    </div>`,
};

function renderPrinciples() {
  $('#principle-list').innerHTML = PRINCIPLES.map((p, i) => `
    <article class="principle" id="p-${esc(p.id)}" style="--rot:${tilt(i + 40)};--stagger:${stagger(i)}">
      <p class="p-num">${esc(p.num)}</p>
      <h3 class="p-title">${esc(p.title)}</h3>
      <p class="p-lead">${esc(p.lead)}</p>
      <p class="p-body">${esc(p.body)}</p>
      <div class="p-demo">${DEMOS[p.demo] ? DEMOS[p.demo]() : ''}</div>
    </article>`).join('');
}

/* ── 配色レシピ ─────────────────────────────── */

const SLOT_LABELS = ['TOP', 'BOTTOM', 'SHOES'];

function renderRecipes() {
  $('#recipe-grid').innerHTML = RECIPES.map((r, i) => {
    const cols = r.colors.map((cid, n) => {
      const c = swatch(cid);
      return `<span style="background:${c.hex}" data-label="${SLOT_LABELS[n]}"></span>`;
    }).join('');
    const names = r.colors.map(cid => swatch(cid).name).join(' · ');
    return `
      <article class="recipe" data-tags="${esc(r.tags.join(' '))}" style="--rot:${tilt(i + 90)};--stagger:${stagger(i)}">
        <div class="recipe-colors" aria-hidden="true">${cols}</div>
        <div class="recipe-body">
          <h3 class="recipe-name">${esc(r.name)}</h3>
          <p class="recipe-note"><b>${esc(names)}</b><br>${esc(r.note)}</p>
        </div>
      </article>`;
  }).join('');

  // 絞り込みは、レシピが実際に持っているタグからだけ作ります。
  const tags = [...new Set(RECIPES.flatMap(r => r.tags))];
  const label = id => (typeof STYLES !== 'undefined' && byId(STYLES, id)) ? byId(STYLES, id).name : id;

  $('#recipe-filter').innerHTML =
    `<button type="button" class="chip" data-tag="" aria-pressed="true">すべて</button>` +
    tags.map(t => `<button type="button" class="chip" data-tag="${esc(t)}" aria-pressed="false">${esc(label(t))}</button>`).join('');

  $('#recipe-filter').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('#recipe-filter .chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    const tag = chip.dataset.tag;
    $$('#recipe-grid .recipe').forEach(el => {
      el.classList.toggle('is-hidden', !!tag && !el.dataset.tags.split(' ').includes(tag));
    });
  });
}

/* ── 例外 ───────────────────────────────────── */

function renderExceptions() {
  const grid = $('#exception-grid');
  if (!grid || typeof EXCEPTIONS === 'undefined') return;

  grid.innerHTML = EXCEPTIONS.map((x, i) => {
    const cols = x.colors.map((cid, n) => {
      const c = swatch(cid);
      return `<span style="background:${c.hex}" data-label="${SLOT_LABELS[n]}"></span>`;
    }).join('');
    const names = x.colors.map(cid => swatch(cid).name).join(' · ');

    // 何を破っているのか。通説なら通説、原則なら番号で名指しします。
    const tag = x.breaks
      ? `<span class="ex-breaks">原則 ${esc(x.breaks)} を破る</span>`
      : `<span class="ex-breaks ex-myth">通説では「${esc(x.myth)}」</span>`;

    return `
      <article class="exception" style="--rot:${tilt(i + 150)};--stagger:${stagger(i)}">
        <div class="ex-colors" aria-hidden="true">${cols}</div>
        <div class="ex-body">
          <h4 class="ex-name">${esc(x.name)}</h4>
          ${tag}
          <p class="ex-names">${esc(names)}</p>
          <p class="ex-why">${esc(x.why)}</p>
          <p class="ex-cond"><b>条件</b>${esc(x.cond)}</p>
          <button type="button" class="ex-try" data-try="${esc(x.colors.join('-'))}">
            これを試着に入れる
          </button>
        </div>
      </article>`;
  }).join('');

  // 例外を診断に入れると落ちます。落ちるところまで見せるのが目的です。
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-try]');
    if (!b) return;
    const [t, bo, s] = b.dataset.try.split('-');
    pick.top = t; pick.bottom = bo; pick.shoes = s;
    hatOn = false;
    syncLab();
    location.hash = labHash();
  });
}

/* ── 手持ちから ─────────────────────────────
   在庫から始めて次の一手を返す区画。他の区画と違って、出すのは
   意見ではなく数です。localStorage に持ち物を残し、リンクにも詰めます。 */

const CLOSET_KEY = 'wardrobe-index:closet';
let closet = [];

function loadCloset() {
  try {
    const saved = localStorage.getItem(CLOSET_KEY);
    if (saved !== null) return parseCloset(saved);
  } catch { /* 保存が使えない環境でも動かします */ }
  return starterCloset();
}

function saveCloset() {
  try { localStorage.setItem(CLOSET_KEY, formatCloset(closet)); } catch {}
}

const typeName = it => (TYPE_NAMES[it.part] || {})[it.type] || it.type;
const itemLabel = it => `${swatch(it.color).name}の${typeName(it)}`;

// 追加フォーム。部位を変えると型の一覧も変わります。
function renderAddForm() {
  const partSel = $('#add-part');
  if (!partSel) return;

  partSel.innerHTML = CLOSET_PARTS
    .map(p => `<option value="${p.key}">${esc(p.name)}</option>`).join('');
  $('#add-color').innerHTML = SWATCHES
    .map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  const syncTypes = () => {
    $('#add-type').innerHTML = typesOf(partSel.value)
      .map(t => `<option value="${t}">${esc((TYPE_NAMES[partSel.value] || {})[t] || t)}</option>`)
      .join('');
  };
  partSel.addEventListener('change', syncTypes);
  syncTypes();

  $('#btn-add').addEventListener('click', () => {
    const it = { part: partSel.value, type: $('#add-type').value, color: $('#add-color').value };
    if (closet.some(x => x.part === it.part && x.type === it.type && x.color === it.color)) {
      return toast('それはもう入っています');
    }
    closet.push(it);
    saveCloset();
    renderCloset();
    toast(`${itemLabel(it)}を入れました`);
  });

  $('#closet-list').addEventListener('click', e => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    closet.splice(Number(b.dataset.remove), 1);
    saveCloset();
    renderCloset();
  });

  $('#btn-closet-share').addEventListener('click', async () => {
    const url = location.origin + location.pathname + '#/closet/' + formatCloset(closet);
    try { await navigator.clipboard.writeText(url); toast('クローゼットのリンクをコピーしました'); }
    catch { location.hash = '#/closet/' + formatCloset(closet); toast('アドレス欄のリンクを共有してください'); }
  });
  $('#btn-closet-reset').addEventListener('click', () => {
    closet = starterCloset(); saveCloset(); renderCloset(); toast('見本に戻しました');
  });
  $('#btn-closet-clear').addEventListener('click', () => {
    closet = []; saveCloset(); renderCloset();
  });
}

function renderCloset() {
  if (!$('#closet-list')) return;

  // 持ち物。部位ごとにまとめて並べます。
  $('#closet-list').innerHTML = CLOSET_PARTS.map(p => {
    const owned = closet.map((it, i) => ({ it, i })).filter(x => x.it.part === p.key);
    if (!owned.length) return '';
    return `<li class="closet-part">
      <span class="closet-part-name">${esc(p.name)}</span>
      <span class="closet-items">${owned.map(({ it, i }) => `
        <button type="button" class="closet-item" data-remove="${i}"
                title="外す" aria-label="${esc(itemLabel(it))}を外す">
          <i style="background:${swatch(it.color).hex}"></i>${esc(typeName(it))}<b>✕</b>
        </button>`).join('')}</span>
    </li>`;
  }).join('') || '<li class="closet-empty">まだ何も入っていません。上・下・足元を1点ずつ入れると組み始めます。</li>';

  const parts = CLOSET_PARTS.filter(p => !p.optional)
    .filter(p => !closet.some(it => it.part === p.key));
  if (parts.length) {
    $('#closet-count').innerHTML =
      `<p class="closet-blocked">${esc(parts.map(p => p.name).join('・'))}が足りません。`
      + `これが揃うまで、組める組は 0 通りです。</p>`;
    $('#closet-buy').innerHTML = '';
    $('#closet-grid').innerHTML = '';
    return;
  }

  const sum = summarise(closet);
  $('#closet-count').innerHTML = `
    <p class="closet-figures">
      <span><b>${sum.owned}</b>点</span>
      <span><b>${sum.total}</b>通り組める</span>
      <span class="ok"><b>${sum.clear}</b>通りが原則を通る</span>
      <span class="warn"><b>${sum.close}</b>通りが惜しい</span>
    </p>
    <p class="closet-note">
      数えているのは<b>上・下・足元の3点</b>の組み合わせです。帽子と羽織りは
      着方の違いなので掛けません。3点ごとに着方を全部試して、最も良い着方で
      判定しています。通る割合は
      ${sum.total ? Math.round(sum.clear / sum.total * 100) : 0}%。
    </p>`;

  // 次に買う1着。総当たりなので、近似はしていません。
  const buy = bestAddition(closet);
  $('#closet-buy').innerHTML = buy ? `
    <div class="buy-card">
      <p class="buy-kicker">次に買う1着</p>
      <p class="buy-item">${esc(itemLabel(buy.item))}</p>
      <p class="buy-gain">通る組が <b>${buy.from}</b> → <b>${buy.to}</b> 通り
        <span>（+${buy.gained}）</span></p>
      <p class="buy-note">
        候補を全部試して、通る組が最も増えるものです。同じだけ増えるものが
        複数あるときは、足元・下・上・羽織り・帽子の順で選んでいます。
      </p>
      <button type="button" class="btn" id="btn-buy-add">これを入れてみる</button>
    </div>` : `
    <div class="buy-card">
      <p class="buy-kicker">次に買う1着</p>
      <p class="buy-item">見つかりませんでした</p>
      <p class="buy-note">どの1着を足しても、通る組は増えません。
        いま持っているものの組み合わせで足りている、ということです。</p>
    </div>`;

  if (buy) {
    $('#btn-buy-add').addEventListener('click', () => {
      closet.push(buy.item); saveCloset(); renderCloset();
      toast(`${itemLabel(buy.item)}を入れました`);
    });
  }

  // 通る組。着装図で並べます。多すぎると読めないので 12 までに。
  const clear = sum.outfits.filter(o => o.verdict.bad === 0).slice(0, 12);
  $('#closet-grid').innerHTML = clear.length ? clear.map((o, i) => {
    const colors = {
      top: swatch(o.top.color).hex,
      bottom: swatch(o.bottom.color).hex,
      shoe: swatch(o.shoe.color).hex,
    };
    if (o.outer) colors.outer = swatch(o.outer.color).hex;
    if (o.hat)   colors.hat   = swatch(o.hat.color).hex;
    const look = {
      top: o.top.type, bottom: o.bottom.type, shoe: o.shoe.type,
      outer: o.outer ? o.outer.type : 'none',
      hat: o.hat ? o.hat.type : 'none',
      colors,
    };
    const names = [o.hat, o.outer, o.top, o.bottom, o.shoe]
      .filter(Boolean).map(itemLabel).join(' · ');
    /* 羽織りや帽子は、それが成立に効いているときだけ書きます。
       「羽織らない」を全件に出すと、羽織ってはいけないように読めます。 */
    const worn = [o.outer ? '羽織って成立' : '', o.hat ? 'かぶって成立' : '']
      .filter(Boolean).join('・');
    return `<article class="fit" style="--stagger:${stagger(i)}">
      <div class="fit-figure">${garmentSVG(look, { label: names })}</div>
      <p class="fit-names">${esc(names)}${worn ? `<span class="fit-worn">${esc(worn)}</span>` : ''}</p>
    </article>`;
  }).join('') : `<p class="closet-note">通る組がありません。
    上の「次に買う1着」を足すか、暗い色を1点入れてみてください。</p>`;

  if (sum.clear > clear.length) {
    $('#closet-grid').innerHTML +=
      `<p class="closet-note closet-more">ほか ${sum.clear - clear.length} 通り。
       持ち物を絞ると、ここに出る組も絞れます。</p>`;
  }
}

/* ── 用語 ───────────────────────────────────── */

function renderTerms() {
  $('#term-list').innerHTML = TERMS.map((t, i) => `
    <div style="--stagger:${stagger(i)}">
      <dt>${esc(t.term)}<small>${esc(t.read)}</small></dt>
      <dd>${esc(t.desc)}</dd>
    </div>`).join('');
}

/* ── 配色を試す ─────────────────────────────── */

/* 帽子は既定でかぶりません。かぶらない状態が最も外れないからです。
   hatOn を false のまま色だけ選べるようにしてあるので、
   ON にした瞬間の変化が見えます。 */
const pick = { top: 'white', bottom: 'navy', shoes: 'brown', hat: 'navy', outer: 'navy' };
let hatOn = false;
let outerOn = false;

const SLOTS = ['hat', 'outer', 'top', 'bottom', 'shoes'];

function renderSwatchPickers() {
  for (const slot of SLOTS) {
    // 23 個を平らに並べると、どれが土台でどれが差し色か伝わりません。
    // 群ごとに小さな見出しを付けて、上から読める順にします。
    $('#sw-' + slot).innerHTML = SWATCH_GROUPS.map(g => `
      <div class="sw-group">
        <p class="sw-group-label">${esc(g.label)}<span>${esc(g.note)}</span></p>
        <div class="sw-row">${g.ids.map(id => {
          const c = swatch(id);
          return `<button type="button" class="sw" style="--c:${c.hex}"
              data-slot="${slot}" data-color="${c.id}"
              aria-pressed="${pick[slot] === c.id}"
              title="${esc(c.name)} — ${esc(c.note)}" aria-label="${esc(c.name)}"></button>`;
        }).join('')}</div>
      </div>`).join('');

    $('#sw-' + slot).addEventListener('click', e => {
      const b = e.target.closest('.sw');
      if (!b) return;
      pick[b.dataset.slot] = b.dataset.color;
      syncLab();
    });
  }
}

/* 試着に使う形。既定は「最初の一組」と同じ、シャツに細いパンツです。
   系統を選ぶと形だけが替わり、色はそのまま持ち越します。
   同じ配色が系統によってどう見えるかを比べるための作りです。 */
const BASE_SHAPE = {
  id: 'base', name: '基本', note: 'シャツに細いパンツ。形の癖がないので、色だけを見たいときに',
  top: 'shirt', outer: 'none', bottom: 'slim', shoe: 'low', hat: 'none',
};
// 最初から実写で見せられる、羽織り・帽子なしの形を選びます。
let shapeId = 'casual';

// 系統から形だけを取り出します。色は look から読みません。
function shapes() {
  const fromStyles = (typeof STYLES === 'undefined' ? [] : STYLES)
    .filter(s => s.look)
    .map(s => ({
      id: s.id, name: s.name, note: s.silhouette,
      top: s.look.top, outer: s.look.outer, bottom: s.look.bottom,
      shoe: s.look.shoe, hat: s.look.hat || 'none',
    }));
  return [BASE_SHAPE, ...fromStyles];
}

function currentShape() {
  return shapes().find(s => s.id === shapeId) || BASE_SHAPE;
}

function renderShapePicker() {
  const row = $('#shape-row');
  if (!row) return;
  row.innerHTML = shapes().map(s =>
    `<button type="button" class="shape-chip" data-shape="${esc(s.id)}"
             aria-pressed="${s.id === shapeId}">${esc(s.name)}</button>`).join('');

  row.addEventListener('click', e => {
    const b = e.target.closest('[data-shape]');
    if (!b) return;
    shapeId = b.dataset.shape;
    const sh = currentShape();
    // 形が羽織りを含むなら自動で羽織らせます。含まないなら脱がせます。
    outerOn = sh.outer !== 'none';
    hatOn   = sh.hat !== 'none';
    syncLab();
  });
}

let figureRenderToken = 0;

function renderLabFigure(sh, look, label) {
  const host = $('#figure');
  const originalHat = globalThis.RealLook?.hasOriginalHat(shapeId);
  const overlayHat = hatOn && !originalHat &&
    globalThis.RealLook?.canOverlayHat(shapeId);
  const hatCompatible = hatOn
    ? originalHat || overlayHat
    : !originalHat;
  const real = shapeId !== 'base' &&
    globalThis.RealLook?.has(shapeId) &&
    outerOn === (sh.outer !== 'none') &&
    hatCompatible;

  if (!host.querySelector('.real-look')) {
    host.innerHTML = `
      <canvas class="real-look" width="768" height="1152" aria-hidden="true"></canvas>
      <div class="vector-look"></div>
      <span class="look-mode" aria-hidden="true"></span>`;
  }

  const token = ++figureRenderToken;
  const canvas = host.querySelector('.real-look');
  const vector = host.querySelector('.vector-look');
  const mode = host.querySelector('.look-mode');

  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', label);
  host.classList.toggle('is-real', real);
  host.classList.toggle('is-vector', !real);

  if (!real) {
    vector.innerHTML = garmentSVG(look, { label });
    mode.textContent = 'SHAPE PREVIEW';
    $('#figure-cap').textContent = '形を足したときは図解で確認';
    return;
  }

  mode.textContent = 'LIVE COLOR';
  $('#figure-cap').textContent = '写真の陰影を残したまま再着色';
  host.classList.add('is-loading');
  RealLook.render(canvas, shapeId, look.colors, {
    overlayHat,
    hatType: look.hat
  })
    .then(ok => {
      if (token !== figureRenderToken) return;
      host.classList.remove('is-loading');
      if (!ok) throw new Error('real look is unavailable');
    })
    .catch(() => {
      if (token !== figureRenderToken) return;
      host.classList.remove('is-loading');
      host.classList.remove('is-real');
      host.classList.add('is-vector');
      vector.innerHTML = garmentSVG(look, { label });
      mode.textContent = 'SHAPE PREVIEW';
      $('#figure-cap').textContent = '写真を読めないため図解で表示';
    });
}

function syncLab() {
  const t = swatch(pick.top), b = swatch(pick.bottom), s = swatch(pick.shoes);
  const h = hatOn   ? swatch(pick.hat)   : null;
  const o = outerOn ? swatch(pick.outer) : null;
  const sh = currentShape();

  // 形が羽織りを持たないなら、羽織りは着せられません。
  const outerType = (outerOn && sh.outer !== 'none') ? sh.outer
                  : (outerOn ? 'jacket' : 'none');
  const hatType   = hatOn ? (sh.hat !== 'none' ? sh.hat : 'cap') : 'none';

  const colors = { top: t.hex, bottom: b.hex, shoe: s.hex };
  if (h) colors.hat = h.hex;
  if (o) colors.outer = o.hex;

  const label = `${sh.name}の形。` + (h ? `帽子が${h.name}、` : '')
    + (o ? `羽織りが${o.name}、` : '')
    + `上が${t.name}、下が${b.name}、足元が${s.name}の着装例`;
  renderLabFigure(
    sh,
    { top: sh.top, outer: outerType, bottom: sh.bottom, shoe: sh.shoe,
      hat: hatType, colors },
    label
  );

  /* 面積の目安。羽織ると上半身の広い面はそちらになるので、
     帯の一番大きい区画も羽織りの色に差し替えます。 */
  const upper = o || t;
  $('#lab-ratio').innerHTML =
    `<span style="background:${upper.hex}"></span><span style="background:${b.hex}"></span>` +
    `<span style="background:${s.hex}"></span>` +
    (h ? `<span class="ratio-hat" style="background:${h.hex}"></span>` : '');

  const shown = [['top', t], ['bottom', b], ['shoes', s],
                 ['hat', swatch(pick.hat)], ['outer', swatch(pick.outer)]];
  for (const [slot, c] of shown) {
    $('#name-' + slot).textContent =
      (slot === 'hat' && !hatOn) ? 'かぶらない'
      : (slot === 'outer' && !outerOn) ? '羽織らない'
      : c.name;
    $$('#sw-' + slot + ' .sw').forEach(el =>
      el.setAttribute('aria-pressed', String(el.dataset.color === pick[slot])));
  }

  $('#btn-hat').setAttribute('aria-pressed', String(hatOn));
  $('.slot-hat').classList.toggle('is-off', !hatOn);
  $('#btn-outer').setAttribute('aria-pressed', String(outerOn));
  $('.slot-outer').classList.toggle('is-off', !outerOn);

  $('#name-shape').textContent = sh.name;
  $('#shape-note').textContent = sh.note;
  $$('#shape-row .shape-chip').forEach(el =>
    el.setAttribute('aria-pressed', String(el.dataset.shape === shapeId)));

  /* 診断に渡す「上」は、羽織っているならその色です。原則01 のとおり、
     効くのは面積の大きい面で、羽織りの下の上着は前開きから覗く細い帯に
     なるためです。 */
  renderVerdict(upper, b, s, h, { inner: o ? t : null, upperLabel: o ? '羽織り' : '上' });
}

function renderVerdict(t, b, s, h = null, opts = {}) {
  const v = judge(t, b, s, h);
  const line = (h ? [h.name] : []).concat([t.name, b.name, s.name]).join(' · ');
  // 羽織りの下の上着は、前開きから覗く細い帯です。面積が小さいので
  // 判定には入れず、そのことだけ言い添えます。
  const innerLine = opts.inner
    ? `<p class="verdict-inner">羽織りの下は${esc(opts.inner.name)}。前開きから縦に覗くだけなので、`
      + `判定には入れていません（原則01・面積が先）。ここは好きな色で構いません。</p>`
    : '';
  $('#verdict').innerHTML = `
    <div class="verdict-card">
      <div class="verdict-head">
        <h3 class="verdict-title">${esc(v.title)}</h3>
        <span class="verdict-badge ${v.bad === 0 ? 'ok' : 'warn'}">${v.bad === 0 ? 'CLEAR' : v.bad + ' TO FIX'}</span>
        <span class="verdict-badge">${esc(line)}</span>
      </div>
      <ul class="verdict-notes">
        ${v.notes.map(n => `<li class="${n.kind}" data-mark="${esc(n.mark)}">${esc(n.text)}</li>`).join('')}
      </ul>
      ${innerLine}
    </div>`;
}

function labHash() {
  /* 3つ＝色だけ、4つ＝＋帽子、5つ＝＋帽子＋羽織り。
     4つ目は帽子の位置に固定してあるので、羽織りだけを足したいときは
     帽子の欄に none を置きます。こうしないと 4 つ目がどちらか分かりません。
     形（系統）は入れていません。ここは色を決める区画なので、
     リンクは色の共有に絞っています。 */
  const base = `${pick.top}-${pick.bottom}-${pick.shoes}`;
  if (outerOn) return `#/lab/${base}-${hatOn ? pick.hat : 'none'}-${pick.outer}`;
  return `#/lab/${hatOn ? base + '-' + pick.hat : base}`;
}

/* 当たりを引く。
   総当たりの表を持たず、引いて診断に通ったものだけ残します。原則を書いた側が
   その原則で自分を試す形なので、原則を直せば当たりの中身も勝手に変わります。

   無彩色だけの組は必ず通るので、それだけが出続けると道具になりません。
   色みのある色を 1 つ以上含むことを条件に足しています。 */
function drawGoodCombo() {
  const r = () => SWATCHES[Math.floor(Math.random() * SWATCHES.length)];
  const before = `${outerOn ? pick.outer : pick.top}-${pick.bottom}-${pick.shoes}-${hatOn ? pick.hat : ''}`;

  for (let i = 0; i < 600; i++) {
    const upper = r(), b = r(), s = r();
    const h = hatOn ? r() : null;
    // 羽織っているなら、判定に効く上半身の色は羽織りのほうです。
    const j = judge(upper, b, s, h);
    if (j.bad !== 0) continue;

    const chromatic = [upper, b, s, ...(h ? [h] : [])].filter(c => !c.neutral);
    if (!chromatic.length) continue;                    // 無彩色だけは面白くない

    const after = `${upper.id}-${b.id}-${s.id}-${h ? h.id : ''}`;
    if (after === before) continue;                     // 同じ組は引き直し

    pick.bottom = b.id; pick.shoes = s.id;
    if (outerOn) pick.outer = upper.id; else pick.top = upper.id;
    if (h) pick.hat = h.id;
    return true;
  }
  return false;
}

function bindLabActions() {
  $('#btn-hat').addEventListener('click', () => { hatOn = !hatOn; syncLab(); });
  $('#btn-outer').addEventListener('click', () => { outerOn = !outerOn; syncLab(); });

  $('#btn-good').addEventListener('click', () => {
    if (drawGoodCombo()) {
      syncLab();
    } else {
      // 600 回引いて出ないのは、原則の側が厳しすぎるということです。
      // 黙って何もしないと壊れて見えるので、収録済みの組に逃がします。
      const rec = RECIPES[Math.floor(Math.random() * RECIPES.length)];
      [pick.top, pick.bottom, pick.shoes] = rec.colors;
      hatOn = false;
      syncLab();
      toast(`収録済みの「${rec.name}」を出しました`);
    }
  });

  $('#btn-random').addEventListener('click', () => {
    const r = () => SWATCHES[Math.floor(Math.random() * SWATCHES.length)].id;
    pick.top = r(); pick.bottom = r(); pick.shoes = r(); pick.hat = r(); pick.outer = r();
    syncLab();
  });

  $('#btn-share').addEventListener('click', async () => {
    const url = location.origin + location.pathname + labHash();
    try {
      await navigator.clipboard.writeText(url);
      toast('リンクをコピーしました');
    } catch {
      location.hash = labHash();
      toast('アドレス欄のリンクを共有してください');
    }
  });
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2400);
}

/* ── ルーティング ───────────────────────────── */

function route() {
  const h = location.hash;

  // id には y2k のように数字が入ります。[a-z-] だけだと開けません。
  const style = h.match(/^#\/style\/([a-z0-9-]+)$/);
  if (style) return openSheet(style[1]);

  // 手持ちのリンク。端末に何も残っていなくても、これだけで持ち歩けます。
  const cl = h.match(/^#\/closet\/(.+)$/);
  if (cl) {
    closeSheet();
    const parsed = parseCloset(decodeURIComponent(cl[1]));
    if (parsed.length) {
      closet = parsed;
      saveCloset();
      renderCloset();
      $('#closet').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  // 4 つ目は帽子（none 可）、5 つ目は羽織り。どちらも省略できます。
  const lab = h.match(/^#\/lab\/([a-z]+)-([a-z]+)-([a-z]+)(?:-([a-z]+))?(?:-([a-z]+))?$/);
  if (lab) {
    closeSheet();
    const [, a, b, c, d, e] = lab;
    const okHat = !d || d === 'none' || !!swatch(d);
    if (swatch(a) && swatch(b) && swatch(c) && okHat && (!e || swatch(e))) {
      pick.top = a; pick.bottom = b; pick.shoes = c;
      hatOn = !!d && d !== 'none';
      if (hatOn) pick.hat = d;
      outerOn = !!e;
      if (e) pick.outer = e;
      syncLab();
      $('#lab').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  closeSheet();
}

/* ── 遅延表示 ───────────────────────────────── */

// スクロールで届いたところから見せます。中身は最初から DOM にあるので、
// 検索にも読み上げにも影響しません。
function observeLazy() {
  const reveal = () => $$('[data-lazy]').forEach(el => el.classList.add('shown'));

  if (!('IntersectionObserver' in window)) return reveal();

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: .04 });

  $$('[data-lazy]').forEach(el => io.observe(el));

  // 保険。IntersectionObserver は、タブが表示されていないなど
  // 条件によっては一度も発火しません。そのとき隠したままだと、
  // ページ全体が白紙に見えます。2.5 秒経っても何も出ていなければ、
  // 演出をあきらめて全部見せます。
  setTimeout(() => {
    if (!document.querySelector('[data-lazy].shown')) reveal();
  }, 2500);
}

/* ── 進捗計 ─────────────────────────────────
   70 : 25 : 5 を、そのまま読み進み表示にしています。
   面積の大きい色から順に満ちるので、いま全体のどのあたりかが
   数字を出さずに分かります。 */

function bindProgress() {
  const spans = $$('.progress span');
  if (!spans.length) return;

  // 3 本の帯が受け持つ範囲。合計 1 になります。
  const bands = [0.70, 0.25, 0.05];
  let queued = false;

  const paint = () => {
    queued = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    let start = 0;
    spans.forEach((el, i) => {
      const end = start + bands[i];
      // この帯が受け持つ区間の、どこまで来ているか
      const fill = Math.min(1, Math.max(0, (p - start) / bands[i]));
      el.style.transform = `scaleX(${fill})`;
      start = end;
    });
  };

  // スクロールごとに書かず、次の描画に 1 回だけまとめます。
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  paint();
}

/* ── 起動 ───────────────────────────────────── */

function init() {
  // 隠す CSS は html.js の下にしか書いていません。この 1 行が無いと、
  // 演出が一切かからない代わりに、白紙になることも絶対にありません。
  document.documentElement.classList.add('js');

  renderStyles();
  renderPrinciples();
  renderRecipes();
  renderExceptions();
  renderTerms();
  renderAddForm();
  closet = loadCloset();
  renderCloset();
  renderShapePicker();
  renderSwatchPickers();
  bindLabActions();
  syncLab();
  observeLazy();
  bindProgress();

  $('#sheet').addEventListener('click', e => {
    if (e.target.closest('[data-close]')) {
      history.pushState('', '', location.pathname + location.search);
      closeSheet();
    }
    const near = e.target.closest('#sheet-content [data-style]');
    if (near) location.hash = '#/style/' + near.dataset.style;
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#sheet').hidden) {
      history.pushState('', '', location.pathname + location.search);
      closeSheet();
    }
  });

  window.addEventListener('hashchange', route);
  route();
}

document.addEventListener('DOMContentLoaded', init);
