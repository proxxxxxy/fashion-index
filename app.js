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

/* この索引の原則を、そのまま判定に落としたもの。
   点を競うためではなく、なぜ揃わないのかを言葉にするために書いています。 */
function judge(t, b, s, h = null) {
  const notes = [];
  const add = (kind, mark, text) => notes.push({ kind, mark, text });

  // 帽子はかぶっているときだけ数に入れます。
  const all = h ? [t, b, s, h] : [t, b, s];
  const chromatic = all.filter(c => !c.neutral);
  const uniqueChromatic = [...new Set(chromatic.map(c => c.id))];

  // 原則02 — 色数
  if (uniqueChromatic.length === 0) {
    add('good', '02', '色みのある色が 0。事故は起きませんが、このままだと平板です。素材か形で差をつけてください。');
  } else if (uniqueChromatic.length <= 2) {
    add('good', '02', `色みのある色は ${uniqueChromatic.length} つ。3 つまでの範囲に収まっています。`);
  } else {
    add('bad', '02', `色みのある色が ${uniqueChromatic.length} つあります。${chromatic[0].name}か${chromatic[chromatic.length - 1].name}のどちらかを、無彩色に置き換えてください。`);
  }

  // 原則04 — 上下の明度差
  const d = Math.abs(t.lightness - b.lightness);
  if (d < 12) {
    add('good', '04', '上下の明るさがほぼ同じ。縦に一本通って、最も背が高く見える形です。ただし素材を変えないと、のっぺりします。');
  } else if (d > 45) {
    if (t.lightness > b.lightness) {
      add('good', '04', `上が明るく下が暗い（差 ${d}）。重心が下がって落ち着く、最も外れない形です。`);
    } else {
      add('good', '04', `上が暗く下が明るい（差 ${d}）。軽く、脚が長く見えますが、上半身は細く見えます。`);
    }
  } else {
    add('good', '04', `上下の明度差は ${d}。中庸です。もっと締めたいなら差を広げてください。`);
  }

  // 原則05 — 差し色の位置
  // 「強い色」は明るさでは決まりません。ボルドーもパープルも色としては強いのに、
  // 暗いので胸元にあっても騒ぎません。vivid（手で付けた強さ）と明るさの両方を見ます。
  const loud = c => c.vivid && c.lightness > 35;
  // 帽子は顔から最も近い位置です。強い色をここに置くのが最も外れます。
  if (h && loud(h)) {
    add('bad', '05', `${h.name}の帽子。顔から最も近い場所に最も強い色があるので、視線が顔まで届きません。帽子は無彩色か、暗い色にしてください。`);
  }
  if (loud(t) && !loud(s)) {
    add('bad', '05', `${t.name}が胸にあります。顔の近くの強い色は、視線をそこで止めます。足元か小物に移せるなら、そのほうが効きます。`);
  } else if (loud(s)) {
    add('good', '05', `${s.name}が足元。最も小さい面積に最も強い色が来ていて、意図に見えます。`);
  }

  // 原則06 — 色の反復
  // 全身一色は t.id === s.id でもあるので、必ず先に見ます。
  // 順番を入れ替えると、全身黒が「2か所の反復」として褒められます。
  if (t.id === b.id && b.id === s.id) {
    add('bad', '06', `全身が${t.name}一色。素材で差をつけない限り、作業着か制服に見えます。どこか一か所を替えてください。`);
  } else if (t.id === s.id) {
    add('good', '06', `${t.name}が上と足元の 2 か所に。離れた 2 か所の反復は、偶然ではなく意図として読まれます。`);
  }

  // 帽子は反復の相手として最も使いやすい部位です。上下から最も離れているので。
  if (h) {
    if (h.id === s.id && h.id !== t.id) {
      add('good', '06', `帽子と足元が同じ${h.name}。全身の両端で同じ色が鳴るので、間にある色が落ち着きます。`);
    } else if (h.id === b.id && h.id !== t.id) {
      add('good', '06', `帽子と下が同じ${h.name}。上を挟む形になって、縦のつながりが出ます。`);
    } else if (h.id === t.id) {
      add('bad', '06', `帽子と上が同じ${h.name}で、しかも隣り合っています。頭と胴が一続きに見えるので、どちらかを変えてください。`);
    }

    // 帽子が全身で最も明るいと、重心が頭に上がります。
    if (h.lightness > 78 && h.lightness - Math.max(t.lightness, b.lightness, s.lightness) > 12) {
      add('bad', '04', `帽子が全身で最も明るい。視線が頭の上で止まって、重心が浮きます。帽子は上着より暗いほうが収まります。`);
    }
  }

  // 原則03 — トーン
  // 暖色と寒色が混ざること自体は失敗ではありません。原則03 が言っているのは
  // 「色相を散らすならトーンを揃える」で、揃っていれば深緑と茶は同居します。
  // 彩度は持っていないので、明度の開きをトーンのずれの代わりに使います。
  if (uniqueChromatic.length >= 2) {
    const warm = chromatic.some(c => c.hue === 'warm');
    const cool = chromatic.some(c => c.hue === 'cool');
    const ls = chromatic.map(c => c.lightness);
    const spread = Math.max(...ls) - Math.min(...ls);
    if (warm && cool && spread > 18) {
      add('bad', '03', `暖かい色と冷たい色が、明るさも ${spread} 離れています。色相を散らすならトーンは揃えてください。どちらかに寄せるか、明るさを近づけるかです。`);
    } else if (warm && cool) {
      add('good', '03', '暖色と寒色が混ざっていますが、明るさが揃っているので同じ場所に見えます。原則03 の効いている状態です。');
    }
  }

  // 足元が一番明るいと、重心が浮きます。
  // ただし白い靴は最も一般的な靴なので、少し明るい程度では鳴らしません。
  // 明るい上着 + 白靴（サックス 76 に対し白 95）で鳴ると、実用に耐えなくなります。
  const brighter = Math.max(t.lightness, b.lightness);
  if (s.lightness - brighter > 20 && s.lightness > 70) {
    add('bad', '04', '足元が全身で一番明るい。重心が上がって落ち着きません。白い靴を履くなら、上にも白を置いて釣り合わせてください。');
  }

  // 上下とも同一色でセットアップに見せる場合の注意
  if (t.id === b.id && t.id !== s.id) {
    add('good', '07', `上下が同じ${t.name}。同じ素材なら一着に見え、違う素材なら色数を増やさずに立体が出ます。狙って選んでください。`);
  }

  const bad = notes.filter(n => n.kind === 'bad').length;
  const title = bad === 0 ? '通ります' : bad === 1 ? '惜しい' : '組み直し';
  return { title, bad, notes };
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

function bindLabActions() {
  $('#btn-hat').addEventListener('click', () => { hatOn = !hatOn; syncLab(); });

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
