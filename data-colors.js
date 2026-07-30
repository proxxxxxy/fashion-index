// 色のデータ。手で書いています。ビルド工程はないので、そのままブラウザが読みます。

// 実際に服になる色だけを並べています。絵の具の色ではありません。
// 蛍光色や原色が少ないのは、売り場にほとんど無いからです。
//
// lightness は 0（黒）〜100（白）。
// neutral は「何にでも合う側の色」という意味で、色数を数えるときに数えない色。
// vivid は「視線を止める強さがあるか」。明るさとは別の軸なので、手で付けています。
//   ボルドーやパープルは色としては強いのに vivid ではないのは、暗いからです。
//   暗い色は面積を取っても騒がず、胸元にあっても顔の邪魔をしません。
//   app.js の judge() が、この 3 つだけを見て診断を組み立てます。
const SWATCHES = [
  // 無彩色とその周辺
  { id: 'black',     name: '黒',           hex: '#1a1a1c', lightness: 10, hue: 'neutral', neutral: true,  vivid: false, note: '最も締まる色。面積を取ると重くなります' },
  { id: 'charcoal',  name: 'チャコール',    hex: '#3a3d42', lightness: 24, hue: 'neutral', neutral: true,  vivid: false, note: '黒より柔らかく、黒より合わせやすい' },
  { id: 'gray',      name: 'グレー',        hex: '#8c8f94', lightness: 57, hue: 'neutral', neutral: true,  vivid: false, note: '中間。どの色の隣にも立てる' },
  { id: 'lightgray', name: 'ライトグレー',  hex: '#c3c5c8', lightness: 78, hue: 'neutral', neutral: true,  vivid: false, note: '白より肌に馴染む明るい面' },
  { id: 'white',     name: '白',           hex: '#f4f2ed', lightness: 95, hue: 'neutral', neutral: true,  vivid: false, note: '純白より、少し黄みの白が服では自然です' },
  { id: 'ecru',      name: '生成り',        hex: '#e6dfd0', lightness: 88, hue: 'warm',    neutral: true,  vivid: false, note: '白の代わりに置くと一段落ち着きます' },
  { id: 'beige',     name: 'ベージュ',      hex: '#cbb99b', lightness: 73, hue: 'warm',    neutral: true,  vivid: false, note: '明るい面を作る色。日本人の肌と近い' },
  { id: 'camel',     name: 'キャメル',      hex: '#a97c46', lightness: 52, hue: 'warm',    neutral: false, vivid: false, note: '茶の中で最も明るく、上品に振れる' },
  { id: 'brown',     name: 'ブラウン',      hex: '#5c4433', lightness: 29, hue: 'warm',    neutral: false, vivid: false, note: '黒の代わりに締める色。柔らかく締まります' },
  { id: 'navy',      name: 'ネイビー',      hex: '#22293f', lightness: 17, hue: 'cool',    neutral: true,  vivid: false, note: '黒に次いで締まり、黒より軽い' },

  // 青の系列
  { id: 'indigo',    name: 'インディゴ',    hex: '#35486b', lightness: 30, hue: 'cool',    neutral: false, vivid: false, note: '濃いデニムの色。育つ色でもあります' },
  { id: 'denim',     name: '淡いデニム',    hex: '#7f9dc0', lightness: 62, hue: 'cool',    neutral: false, vivid: false, note: '色落ちしたデニム。空色に近い' },
  { id: 'sax',       name: 'サックス',      hex: '#a8c4dd', lightness: 76, hue: 'cool',    neutral: false, vivid: false, note: 'シャツの色。白より顔が明るく見えます' },
  { id: 'blue',      name: 'ブルー',        hex: '#2d5aa0', lightness: 36, hue: 'cool',    neutral: false, vivid: true,  note: 'はっきりした青。差し色として強い' },

  // 緑・カーキ
  { id: 'olive',     name: 'オリーブ',      hex: '#4e5236', lightness: 31, hue: 'warm',    neutral: false, vivid: false, note: '軍の色。茶にも緑にも寄れます' },
  { id: 'khaki',     name: 'カーキ',        hex: '#6b6a4b', lightness: 41, hue: 'warm',    neutral: false, vivid: false, note: 'オリーブより明るく、砂に近い' },
  { id: 'green',     name: 'グリーン',      hex: '#2f5d4a', lightness: 34, hue: 'cool',    neutral: false, vivid: true,  note: '深い緑。紺の代わりが務まります' },

  // 赤・暖色
  { id: 'bordeaux',  name: 'ボルドー',      hex: '#5c2b32', lightness: 24, hue: 'warm',    neutral: false, vivid: true,  note: '暗い赤。差し色でありながら締まる稀な色' },
  { id: 'red',       name: '赤',           hex: '#b83b32', lightness: 42, hue: 'warm',    neutral: false, vivid: true,  note: '最も強い差し色。面積は小さく' },
  { id: 'orange',    name: 'オレンジ',      hex: '#d1682f', lightness: 53, hue: 'warm',    neutral: false, vivid: true,  note: '山の道具に多い色。街では小物で' },
  { id: 'mustard',   name: 'マスタード',    hex: '#c8942f', lightness: 62, hue: 'warm',    neutral: false, vivid: true,  note: '黄の中で唯一、服として落ち着く明度' },
  { id: 'pink',      name: 'ピンク',        hex: '#d9a3a1', lightness: 70, hue: 'warm',    neutral: false, vivid: false, note: 'くすませると男物でも成立します' },

  // 紫
  { id: 'purple',    name: 'パープル',      hex: '#4c3b63', lightness: 28, hue: 'cool',    neutral: false, vivid: true,  note: '扱いが難しい分、効いたときは強い' },
];

// 色見本の並び。ただ23個を並べると、選ぶ側にどれが土台でどれが差し色なのかが
// 伝わりません。まず「土台」を選び、そこに色を重ねる順に読めるよう組みます。
// tools/check.js が、全部の色がちょうど1回ずつ現れることを見張っています。
const SWATCH_GROUPS = [
  { label: '土台',   note: '面積の 70 と 25 を担う色。ここから選びます',
    ids: ['black', 'charcoal', 'gray', 'lightgray', 'white', 'ecru', 'beige', 'navy'] },
  { label: '茶',     note: '黒の代わりに締める色',
    ids: ['camel', 'brown'] },
  { label: '青',     note: 'デニムとシャツの色',
    ids: ['indigo', 'denim', 'sax', 'blue'] },
  { label: '緑',     note: '軍と山の色',
    ids: ['olive', 'khaki', 'green'] },
  { label: '暖色',   note: '差し色。5 に置く色',
    ids: ['bordeaux', 'red', 'orange', 'mustard', 'pink'] },
  { label: '紫',     note: '最も扱いが難しい',
    ids: ['purple'] },
];

// 配色の原則。順番に読むと、上から下へ効き目が細かくなります。
const PRINCIPLES = [
  {
    id: 'ratio',
    num: '01',
    title: '面積を 70 : 25 : 5 で分ける',
    lead: '色の良し悪しより先に、どれだけ使うかが効きます。',
    body: '面積の大きい色を 70、次を 25、残り 5 と考えます。上下のどちらかが 70、もう一方が 25、靴か小物が 5 です。' +
          'この比率を守っている限り、色そのものが多少ちぐはぐでも破綻しません。逆に、良い色を 50 : 50 で並べると、' +
          'どちらが主役か決まらないまま喧嘩します。迷ったら、面積を偏らせてください。',
    demo: 'ratio',
  },
  {
    id: 'count',
    num: '02',
    title: '色は 3 つまで。無彩色は数えない',
    lead: '4 色目から、急に「頑張った人」に見えはじめます。',
    body: '黒・白・グレー・紺・生成りは接着剤です。これらは何色あっても数に入れません。数えるのは、' +
          '赤・青・緑・黄・茶といった色みのある色で、それを 3 つまでに抑えます。' +
          '差し色が 2 つ以上あるとき、片方は必ず削れます。削ったほうが強くなります。',
    demo: 'count',
  },
  {
    id: 'tone',
    num: '03',
    title: '色相を散らすなら、トーンを揃える',
    lead: 'まとまって見える服は、色が近いのではなく、明るさと鮮やかさが近い。',
    body: 'くすんだ緑・くすんだ赤・くすんだ青は、色相が正反対でも同じ場所にいるように見えます。' +
          '反対に、鮮やかな赤とくすんだ青は、どちらも良い色なのに揃いません。' +
          '色の名前ではなく、「濁っているか、澄んでいるか」で揃えてください。' +
          '古着が何色使っても成立するのは、経年で全体が同じだけ濁っているからです。',
    demo: 'tone',
  },
  {
    id: 'contrast',
    num: '04',
    title: '上下の明暗で、体型の見え方が決まる',
    lead: '明るい面が広いほど膨らみ、暗い面が広いほど締まります。',
    body: '上が明るく下が暗いと、重心が下がって落ち着きます。定番が明るいシャツに濃紺のパンツなのは、' +
          'この形が最も外れないからです。上が暗く下が明るいと軽く、脚が長く見えますが、上半身が痩せて見えます。' +
          '上下とも同じ明るさにすると縦に一本通り、最も背が高く見えます。狙って選ぶ項目で、なんとなく決める項目ではありません。',
    demo: 'contrast',
  },
  {
    id: 'accent',
    num: '05',
    title: '差し色は、顔から遠いところに置く',
    lead: '靴・靴下・鞄・帽子。この順で失敗しにくい。',
    body: '胸元に強い色があると、視線がそこで止まり、顔が後回しになります。' +
          '足元の赤は「意図」に見え、胸の赤は「主張」に見えます。同じ色でも置く場所で意味が変わります。' +
          '差し色を上半身に置きたいときは、面積を手首か襟元だけに絞ってください。',
    demo: 'accent',
  },
  {
    id: 'repeat',
    num: '06',
    title: '同じ色は、2 か所に置くと理由になる',
    lead: '一度きりの色は浮き、二度目で意図に変わります。',
    body: '靴の茶色とベルトの茶色、帽子の紺と靴下の紺。離れた 2 か所に同じ色があると、' +
          '見る側はそれを偶然だと思わなくなります。3 か所は多すぎで、揃えた感じが出ます。2 か所がちょうどいい。' +
          '色を増やさずに完成度だけ上げられる、最も安い手です。',
    demo: 'repeat',
  },
  {
    id: 'material',
    num: '07',
    title: '同じ紺でも、素材が違えば別の色',
    lead: '色番号が合っていても、光り方が違えば揃いません。',
    body: 'ウールの紺は光を吸い、ナイロンの紺は光を返します。並べると、後者だけが浮きます。' +
          '上下を同じ色で揃えるとき（セットアップに見せたいとき）は、必ず同じ素材か、' +
          '少なくとも同じ光沢の素材にしてください。逆に、あえて素材を変えて同じ色を置くと、' +
          '色数を増やさずに立体感だけが出ます。上級の使い方です。',
    demo: 'material',
  },
  {
    id: 'skin',
    num: '08',
    title: '顔の近くの色だけ、自分の肌で選ぶ',
    lead: '全身をパーソナルカラーで縛る必要はありません。',
    body: '肌が黄みに寄る人は生成り・キャメル・オリーブで血色が出て、純白と黒で顔が沈みます。' +
          '青みに寄る人は白・グレー・紺で澄み、ベージュで顔がくすみます。' +
          'ただしこれが効くのは襟元から 20cm ほどの範囲だけです。パンツと靴は好きな色で構いません。' +
          '苦手な色を上に着たいときは、間に得意な色のインナーを一枚挟めば済みます。',
    demo: 'skin',
  },
];

// 実際に着られる 3 色の組。すべて「上・下・足元」の順です。
const RECIPES = [
  { id: 'r01', name: '最初の一組',       tags: ['kireime', 'casual'], colors: ['white', 'navy', 'brown'],        note: '外しようがない基準。ここから何を変えても、変えた分だけ印象が動きます' },
  { id: 'r02', name: '紺と生成り',       tags: ['kireime', 'trad'],   colors: ['navy', 'ecru', 'brown'],         note: '上を暗くして脚を明るく。上背があるほど効きます' },
  { id: 'r03', name: 'グレーの濃淡',     tags: ['minimal', 'mode'],   colors: ['lightgray', 'charcoal', 'black'], note: '色を 0 にして明度だけで組む。素材で差をつけないと平板になります' },
  { id: 'r04', name: '黒に茶を効かせる', tags: ['mode', 'minimal'],   colors: ['black', 'black', 'camel'],       note: '全身黒の唯一の抜け道。足元だけ茶にすると重さが消えます' },
  { id: 'r05', name: 'デニムと白',       tags: ['casual', 'amekaji'], colors: ['white', 'indigo', 'white'],      note: '上と足元で白を繰り返す。原則06 がそのまま形になった組' },
  { id: 'r06', name: 'オリーブと生成り', tags: ['military', 'work'],  colors: ['ecru', 'olive', 'brown'],        note: '軍もので最も外れない。カーキを上にすると途端に作業着へ寄ります' },
  { id: 'r07', name: '三段の茶',         tags: ['trad', 'vintage'],   colors: ['beige', 'brown', 'camel'],       note: '同系色で濃さだけを変える。明度差を各段 20 は空けてください' },
  { id: 'r08', name: 'サックスと紺',     tags: ['kireime', 'trad'],   colors: ['sax', 'navy', 'white'],          note: '顔が最も明るく見える組。面接や初対面はこれで足ります' },
  { id: 'r09', name: 'ボルドーを足す',   tags: ['trad', 'kireime'],   colors: ['gray', 'charcoal', 'bordeaux'],  note: '差し色でありながら暗い色。締まりを保ったまま色が入ります' },
  { id: 'r10', name: '黒とグレー',       tags: ['street', 'mode'],    colors: ['black', 'gray', 'black'],        note: '上下の明暗を逆にした形。上半身が細く見えます' },
  { id: 'r11', name: '砂と空',           tags: ['gorpcore', 'casual'],colors: ['beige', 'denim', 'ecru'],        note: '全体が明るく、夏に効きます。締まりが無いので鞄か時計を黒に' },
  { id: 'r12', name: 'カーキと黒',       tags: ['street', 'military'],colors: ['black', 'khaki', 'black'],       note: '軍ものを街に寄せる定番。カーキの面積を下に置くのが要点' },
  { id: 'r13', name: '赤を靴下に',       tags: ['casual', 'trad'],    colors: ['ecru', 'navy', 'red'],           note: '最も強い色を最も小さい面積に。原則05 の実演です' },
  { id: 'r14', name: 'マスタードの上',   tags: ['vintage', 'casual'], colors: ['mustard', 'brown', 'brown'],     note: '差し色を上に置く、この20組で唯一の例外。原則05 を承知で外しています。下と足元を同じ暗い茶で固め、視線が上で止まる分を受けてください' },
  { id: 'r15', name: '深緑と紺',         tags: ['trad', 'military'],  colors: ['green', 'navy', 'brown'],        note: '暗い色どうし。色相は離れているのに揃うのは、トーンが同じだから' },
  { id: 'r16', name: '全身インディゴ',   tags: ['amekaji', 'vintage'],colors: ['indigo', 'indigo', 'brown'],     note: '同じ色でも素材（シャツとデニム）を変えて立体を出す。原則07' },
  { id: 'r17', name: '灰と空',           tags: ['minimal', 'kireime'],colors: ['sax', 'gray', 'lightgray'],      note: '全体が淡い。輪郭が消えるので、サイズだけは詰めてください' },
  { id: 'r18', name: '黒と橙',           tags: ['gorpcore', 'street'],colors: ['black', 'charcoal', 'orange'],   note: '山の道具の配色をそのまま街へ。橙は靴か鞄の一点だけ' },
  { id: 'r19', name: 'ピンクを混ぜる',   tags: ['mode', 'y2k'],       colors: ['pink', 'gray', 'lightgray'],     note: 'くすんだピンクはグレーと同じ場所にいます。鮮やかなピンクだと成立しません' },
  { id: 'r20', name: '紫を仕込む',       tags: ['mode', 'street'],    colors: ['black', 'purple', 'black'],      note: '最も難しい色。黒で挟むと、色みだけが残って浮きません' },
];

// 用語。読み飛ばしてもいいけれど、知っていると本文が速く読めます。
const TERMS = [
  { term: 'トーン',       read: 'tone',        desc: '明るさと鮮やかさの組み合わせ。色相（赤・青といった色名）とは別の軸です' },
  { term: '色相',         read: 'hue',         desc: '赤・橙・黄・緑・青・紫という、色の名前にあたる軸' },
  { term: '彩度',         read: 'saturation',  desc: '鮮やかさ。落とすと「くすむ」。服は落ちている側が多い' },
  { term: '明度',         read: 'lightness',   desc: '明るさ。上下の明度差が体型の見え方を決めます' },
  { term: '同系色',       read: 'analogous',   desc: '色相が近い色どうし。濃さだけを変えて組むと必ずまとまります' },
  { term: '補色',         read: 'complementary', desc: '色相が正反対の色。服では強すぎるので、片方をくすませて使います' },
  { term: 'Iライン',      read: 'I-line',      desc: '上下とも細い。最も背が高く見えるが、体型が出ます' },
  { term: 'Yライン',      read: 'Y-line',      desc: '上が大きく下が細い。いまのカジュアルの基本形' },
  { term: 'Aライン',      read: 'A-line',      desc: '上が細く下が大きい。脚の形を隠せます' },
  { term: '差し色',       read: 'accent',      desc: '全体の 5% に置く、いちばん強い色' },
];
