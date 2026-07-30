// 12系統の着装図を1枚のSVGに並べます。目で確かめるための道具です。
//   node tools/montage.js out.svg
// 画面を開かずに絵の破綻を見つけられるので、型紙を触ったら必ず出してください。

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const out = process.argv[2] || path.join(root, 'garments.svg');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const src = [
  read('garment.js'), read('data-colors.js'), read('data-styles.js'),
  'globalThis.__o = { STYLES, garmentSVG };',
].join('\n;\n');

const ctx = { console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'data' });
const { STYLES, garmentSVG } = ctx.__o;

const COLS = 4, W = 150, H = 225;
const rows = Math.ceil(STYLES.length / COLS);

const cells = STYLES.map((s, i) => {
  const x = (i % COLS) * W, y = Math.floor(i / COLS) * H;
  // --form は単体の SVG では解決しないので、実際の値に置き換えます。
  let g = garmentSVG(s.look).replace(/var\(--form,\s*([^)]+)\)/g, '$1');
  g = g.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<g transform="translate(${x},${y})">`
    + `<g transform="scale(${W / 200},${(H - 26) / 300})">${g}</g>`
    + `<text x="${W / 2}" y="${H - 8}" font-family="sans-serif" font-size="13"`
    + ` text-anchor="middle" fill="#14141a">${s.name}</text>`
    + `</g>`;
}).join('');

fs.writeFileSync(out,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * W}" height="${rows * H}"`
  + ` viewBox="0 0 ${COLS * W} ${rows * H}">`
  + `<rect width="100%" height="100%" fill="#e7e4db"/>${cells}</svg>`);

console.log(`書き出しました: ${out}  (${COLS}×${rows}, ${STYLES.length} 系統)`);
