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
    // 着装図。写真の代わりで、この系統の典型的な一組を描いています。
    const fig = s.look ? garmentSVG(s.look, { label: s.name + 'の一例' }) : '';
    return `
      <button type="button" class="style-card" data-style="${esc(s.id)}" style="--rot:${tilt(i)};--stagger:${stagger(i)}">
        <span class="card-era">${esc(s.era)}</span>
        <span class="card-figure">${fig}</span>
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

  $('#sheet-content').innerHTML = `
    <h3 id="sheet-title">${esc(s.name)}</h3>
    <p class="s-en">${esc(s.en)} &nbsp;·&nbsp; ${esc(s.era)}</p>
    <div class="s-band" aria-hidden="true">${band}</div>
    <div class="s-lead">
      <div class="s-figure">${s.look ? garmentSVG(s.look, { label: s.name + 'の一例' }) : ''}</div>
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
const pick = { top: 'white', bottom: 'navy', shoes: 'brown', hat: 'navy' };
let hatOn = false;

const SLOTS = ['hat', 'top', 'bottom', 'shoes'];

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

/* 試着に使う型。「最初の一組」と同じ形にしています。
   ここで系統を選ばせると、色の話に形の話が混ざります。 */
const LAB_LOOK = { top: 'shirt', outer: 'none', bottom: 'slim', shoe: 'low' };

function syncLab() {
  const t = swatch(pick.top), b = swatch(pick.bottom), s = swatch(pick.shoes);
  const h = hatOn ? swatch(pick.hat) : null;

  const colors = { top: t.hex, bottom: b.hex, shoe: s.hex };
  if (h) colors.hat = h.hex;

  // 着装図は描き直します。体の上に服を重ねる順は garment.js が持っています。
  $('#figure').innerHTML = garmentSVG(
    { ...LAB_LOOK, hat: hatOn ? 'cap' : 'none', colors },
    { label: (h ? `帽子が${h.name}、` : '') +
             `上が${t.name}、下が${b.name}、足元が${s.name}の着装図` }
  );

  // 面積の目安。帽子は小さいので、5 の側に足します。
  $('#lab-ratio').innerHTML =
    `<span style="background:${t.hex}"></span><span style="background:${b.hex}"></span>` +
    `<span style="background:${s.hex}"></span>` +
    (h ? `<span class="ratio-hat" style="background:${h.hex}"></span>` : '');

  const shown = [['top', t], ['bottom', b], ['shoes', s], ['hat', swatch(pick.hat)]];
  for (const [slot, c] of shown) {
    $('#name-' + slot).textContent =
      (slot === 'hat' && !hatOn) ? 'かぶらない' : c.name;
    $$('#sw-' + slot + ' .sw').forEach(el =>
      el.setAttribute('aria-pressed', String(el.dataset.color === pick[slot])));
  }

  $('#btn-hat').setAttribute('aria-pressed', String(hatOn));
  $('.slot-hat').classList.toggle('is-off', !hatOn);

  renderVerdict(t, b, s, h);
}

function renderVerdict(t, b, s, h = null) {
  const v = judge(t, b, s, h);
  const line = (h ? [h.name] : []).concat([t.name, b.name, s.name]).join(' · ');
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
    </div>`;
}

function labHash() {
  // 帽子をかぶらないときは 3 つのまま。以前に配ったリンクをそのまま生かします。
  const base = `${pick.top}-${pick.bottom}-${pick.shoes}`;
  return `#/lab/${hatOn ? base + '-' + pick.hat : base}`;
}

/* 当たりを引く。
   総当たりの表を持たず、引いて診断に通ったものだけ残します。原則を書いた側が
   その原則で自分を試す形なので、原則を直せば当たりの中身も勝手に変わります。

   無彩色だけの組は必ず通るので、それだけが出続けると道具になりません。
   色みのある色を 1 つ以上含むことを条件に足しています。 */
function drawGoodCombo() {
  const r = () => SWATCHES[Math.floor(Math.random() * SWATCHES.length)];
  const before = `${pick.top}-${pick.bottom}-${pick.shoes}-${hatOn ? pick.hat : ''}`;

  for (let i = 0; i < 600; i++) {
    const t = r(), b = r(), s = r();
    const h = hatOn ? r() : null;
    const j = judge(t, b, s, h);
    if (j.bad !== 0) continue;

    const chromatic = [t, b, s, ...(h ? [h] : [])].filter(c => !c.neutral);
    if (!chromatic.length) continue;                    // 無彩色だけは面白くない

    const after = `${t.id}-${b.id}-${s.id}-${h ? h.id : ''}`;
    if (after === before) continue;                     // 同じ組は引き直し

    pick.top = t.id; pick.bottom = b.id; pick.shoes = s.id;
    if (h) pick.hat = h.id;
    return true;
  }
  return false;
}

function bindLabActions() {
  $('#btn-hat').addEventListener('click', () => { hatOn = !hatOn; syncLab(); });

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
    pick.top = r(); pick.bottom = r(); pick.shoes = r(); pick.hat = r();
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

  // 4 つ目は帽子で、省略できます。3 つのリンクは帽子なしとして開きます。
  const lab = h.match(/^#\/lab\/([a-z]+)-([a-z]+)-([a-z]+)(?:-([a-z]+))?$/);
  if (lab) {
    closeSheet();
    const [, a, b, c, d] = lab;
    if (swatch(a) && swatch(b) && swatch(c) && (!d || swatch(d))) {
      pick.top = a; pick.bottom = b; pick.shoes = c;
      hatOn = !!d;
      if (d) pick.hat = d;
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
