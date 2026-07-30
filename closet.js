/* ============================================================
   closet — 手持ちから組む

   この索引の他の区画は、全部「本」です。分類・講義・目録・仮定の採点。
   読み終わってクローゼットの前に立つと、何を着ればいいかは分からない。
   ここだけが、**あなたの在庫から始まって次の一手を返す**区画です。

   出すのは意見ではなく事実です。「持ち物から 14 通り組める、うち 9 通りが
   原則を通る、黒のパンツを 1 本足すと 15 通りに増える」。
   最後のひとつは総当たりで解きます。近似は使いません。

   DOM に触りません。ブラウザと node の両方から読めるので、
   tools/check.js が画面なしで検算できます。
   ============================================================ */

'use strict';

/* 部位の順番。上から下へ。URL の記号もここで決めています。
   記号を変えると、配ったクローゼットのリンクが全部別物を指します。 */
const CLOSET_PARTS = [
  { key: 'hat',    tag: 'h', name: '帽子',   set: () => HATS,    optional: true  },
  { key: 'outer',  tag: 'o', name: '羽織り', set: () => OUTERS,  optional: true  },
  { key: 'top',    tag: 't', name: '上',     set: () => TOPS,    optional: false },
  { key: 'bottom', tag: 'b', name: '下',     set: () => BOTTOMS, optional: false },
  { key: 'shoe',   tag: 's', name: '足元',   set: () => SHOES,   optional: false },
];

const partByKey = k => CLOSET_PARTS.find(p => p.key === k);
const partByTag = t => CLOSET_PARTS.find(p => p.tag === t);

/* 型の一覧。'none' は「着ない」を表す内部値なので、持ち物には出しません。 */
function typesOf(partKey) {
  return Object.keys(partByKey(partKey).set()).filter(t => t !== 'none');
}

const itemId = it => `${partByKey(it.part).tag}-${it.type}-${it.color}`;

/* 持ち物を URL に詰めます。カクテルのメニューリンクと同じ考えで、
   端末に何も残っていなくても、リンクだけで持ち歩けるようにします。 */
function formatCloset(items) {
  return items.map(itemId).join('.');
}

function parseCloset(str) {
  if (!str) return [];
  const out = [];
  const seen = new Set();
  for (const tok of str.split('.')) {
    const m = tok.match(/^([hotbs])-([a-z0-9]+)-([a-z]+)$/);
    if (!m) continue;
    const part = partByTag(m[1]);
    if (!part) continue;
    if (!typesOf(part.key).includes(m[2])) continue;
    if (!SWATCHES.some(c => c.id === m[3])) continue;
    const it = { part: part.key, type: m[2], color: m[3] };
    const id = itemId(it);
    if (seen.has(id)) continue;               // 同じ服を二度数えません
    seen.add(id);
    out.push(it);
  }
  return out;
}

const ownedOf = (items, partKey) => items.filter(i => i.part === partKey);

// SWATCHES を引く小さな道具。closet.js だけで完結させます。
function swatchOf(id) { return SWATCHES.find(c => c.id === id); }

/* 手持ちで組める全通り。
 *
 * 核は**上・下・足元の3点**です。帽子と羽織りは、同じ3点の「着方の違い」
 * なので、別の組として数えません。
 *
 * 最初は掛け算で数えていて、帽子を1つ持つだけで組数が倍になりました。
 * その結果「次に買う1着」が黒のキャップで +10 通り、という無意味な助言が
 * 出ました。着られる幅は1ミリも広がっていないのに、数だけが増えたわけです。
 * いまは3点ごとに、帽子と羽織りの着方を全部試して**最も良い着方**を選び、
 * その3点が成立するかどうかを1通りとして数えます。
 * だから帽子が推薦されるのは、それが落ちていた3点を救うときだけです。
 */
function enumerateOutfits(items) {
  const tops    = ownedOf(items, 'top');
  const bottoms = ownedOf(items, 'bottom');
  const shoes   = ownedOf(items, 'shoe');
  const outers  = [null, ...ownedOf(items, 'outer')];
  const hats    = [null, ...ownedOf(items, 'hat')];

  const out = [];
  for (const t of tops) for (const b of bottoms) for (const s of shoes) {
    let best = null;
    for (const o of outers) for (const h of hats) {
      // 羽織っているときの上半身は羽織りの色です（原則01・面積が先）。
      const upper = o ? swatchOf(o.color) : swatchOf(t.color);
      const verdict = judge(upper, swatchOf(b.color), swatchOf(s.color),
                            h ? swatchOf(h.color) : null);
      if (!best || verdict.bad < best.verdict.bad) best = { outer: o, hat: h, verdict };
      if (best.verdict.bad === 0) break;   // これ以上良くはなりません
    }
    out.push({ top: t, bottom: b, shoe: s, ...best, ways: outers.length * hats.length });
  }
  return out;
}

function summarise(items) {
  const all = enumerateOutfits(items);
  return {
    owned: items.length,
    // total は 3 点の組の数。着方（帽子・羽織りの有無）は掛けません。
    total: all.length,
    clear: all.filter(o => o.verdict.bad === 0).length,
    close: all.filter(o => o.verdict.bad === 1).length,
    outfits: all,
  };
}

/* 次に買う 1 着。
   「人気の部位を足す」ような近似はしません。カクテル側で
   「ベース2本＋割り材3本」という近似がモクテルに当てたとき 0 杯を返した、
   というのと同じ失敗をするからです。**候補を全部試して、通る組が最も
   増えるものを選びます。**

   同点のときは、部位の順（帽子→足元）ではなく「安い方向」を選びたいので、
   足元・下・上・羽織り・帽子の順で優先します。実際に買う順に近いからです。 */
const BUY_PRIORITY = ['shoe', 'bottom', 'top', 'outer', 'hat'];

function bestAddition(items) {
  const base = summarise(items).clear;
  const have = new Set(items.map(itemId));
  let best = null;

  for (const part of CLOSET_PARTS) {
    for (const type of typesOf(part.key)) {
      for (const c of SWATCHES) {
        const cand = { part: part.key, type, color: c.id };
        if (have.has(itemId(cand))) continue;           // 既に持っている
        const gained = summarise([...items, cand]).clear - base;
        if (gained <= 0) continue;
        const rank = BUY_PRIORITY.indexOf(part.key);
        if (!best || gained > best.gained
            || (gained === best.gained && rank < best.rank)) {
          best = { item: cand, gained, rank, from: base, to: base + gained };
        }
      }
    }
  }
  return best;
}

/* 最初に揃える 1 組。手持ちが空のときに何を出すか、という問題です。
   ここも総当たりで、上・下・足元の 3 点だけで最も多くの通る組を作る組み合わせ
   ではなく（3 点なら 1 通りしかありません）、**診断を通る 3 点**を返します。 */
function starterCloset() {
  return parseCloset('t-shirt-white.t-knit-navy.o-jacket-navy'
    + '.b-slim-navy.b-denim-indigo.s-low-brown.s-low-white');
}
