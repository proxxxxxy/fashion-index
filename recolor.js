/* ============================================================
   REAL LOOK RECOLOR
   12 枚の実写を増殖させず、服の部分だけを Canvas で着色します。
   マスクは各写真に合わせた 0–1 座標の多角形です。元写真の明るさを
   残して色相だけを差し替えるため、布の皺・縫い目・光沢は消えません。
   ============================================================ */

(() => {
  'use strict';

  const W = 768;
  const H = 1152;

  const poly = (...points) => points;
  const pair = (left, right) => [poly(...left), poly(...right)];

  /* 点は [x, y] の組。値は写真幅・高さに対する比率です。
     大きく取りすぎると背景を染めるため、服の輪郭より 1〜2px 内側に置きます。 */
  const MASKS = {
    kireime: {
      top: [poly(
        [.455,.183],[.500,.205],[.545,.185],[.562,.235],[.575,.310],
        [.590,.430],[.566,.443],[.492,.443],[.486,.380],[.476,.290]
      )],
      outer: [
        poly([.430,.190],[.476,.174],[.490,.250],[.500,.455],[.450,.490],[.385,.482],[.350,.505],[.315,.470],[.280,.380],[.300,.285],[.350,.215]),
        poly([.545,.185],[.615,.220],[.655,.285],[.675,.410],[.655,.490],[.615,.480],[.590,.445],[.570,.465],[.545,.445],[.535,.250])
      ],
      bottom: pair(
        [[.365,.438],[.495,.438],[.495,.525],[.455,.905],[.355,.905],[.360,.550]],
        [[.490,.438],[.600,.438],[.620,.535],[.585,.900],[.460,.900],[.495,.525]]
      ),
      shoes: pair(
        [[.350,.895],[.450,.895],[.470,.930],[.445,.958],[.310,.970],[.300,.948]],
        [[.460,.890],[.585,.890],[.630,.930],[.620,.952],[.505,.955],[.455,.935]]
      )
    },
    casual: {
      top: [poly(
        [.425,.205],[.535,.205],[.620,.240],[.707,.342],[.622,.383],
        [.610,.475],[.552,.525],[.360,.525],[.350,.382],[.290,.360],[.340,.250]
      )],
      bottom: pair(
        [[.355,.505],[.505,.505],[.507,.560],[.490,.880],[.400,.880],[.360,.580]],
        [[.490,.505],[.620,.500],[.665,.580],[.690,.880],[.570,.890],[.515,.570]]
      ),
      shoes: pair(
        [[.392,.875],[.485,.875],[.495,.890],[.515,.905],[.500,.925],[.365,.925],[.350,.915],[.360,.895]],
        [[.585,.880],[.675,.880],[.740,.915],[.740,.930],[.700,.940],[.570,.925],[.560,.910]]
      )
    },
    amekaji: {
      top: [poly([.431,.187],[.545,.187],[.566,.480],[.409,.480])],
      outer: [
        poly([.341,.185],[.431,.168],[.436,.218],[.408,.487],[.350,.500],[.285,.453],[.265,.332],[.296,.222]),
        poly([.545,.169],[.637,.194],[.692,.246],[.704,.370],[.661,.476],[.591,.486],[.557,.464],[.552,.213])
      ],
      bottom: pair(
        [[.345,.469],[.490,.464],[.482,.853],[.335,.853]],
        [[.491,.464],[.595,.475],[.600,.851],[.501,.851]]
      ),
      shoes: pair(
        [[.356,.866],[.476,.864],[.491,.895],[.460,.915],[.311,.916],[.304,.893]],
        [[.485,.866],[.575,.865],[.600,.895],[.590,.930],[.480,.925],[.470,.895]]
      )
    },
    trad: {
      top: [poly(
        [.430,.190],[.480,.215],[.525,.190],[.548,.235],
        [.560,.405],[.545,.445],[.468,.445],[.455,.320]
      )],
      outer: [
        poly([.405,.195],[.455,.180],[.468,.245],[.475,.445],[.420,.525],[.365,.500],[.330,.530],[.295,.480],[.260,.375],[.285,.270],[.330,.215]),
        poly([.525,.185],[.585,.210],[.625,.265],[.650,.410],[.645,.535],[.605,.540],[.585,.500],[.548,.465],[.540,.245])
      ],
      bottom: pair(
        [[.355,.450],[.485,.445],[.485,.530],[.460,.860],[.370,.860],[.350,.535]],
        [[.480,.445],[.575,.450],[.590,.570],[.555,.860],[.465,.860],[.485,.530]]
      ),
      shoes: pair(
        [[.395,.855],[.460,.855],[.485,.900],[.470,.928],[.395,.930],[.380,.912]],
        [[.465,.855],[.555,.855],[.620,.900],[.625,.920],[.585,.935],[.470,.915]]
      )
    },
    street: {
      top: [poly(
        [.420,.165],[.500,.175],[.570,.220],[.550,.285],
        [.565,.480],[.505,.505],[.385,.500],[.365,.390],[.390,.225]
      )],
      outer: [
        poly([.365,.205],[.420,.190],[.425,.245],[.390,.495],[.345,.520],[.305,.500],[.275,.440],[.275,.300],[.320,.225]),
        poly([.565,.190],[.650,.220],[.705,.290],[.735,.405],[.695,.490],[.630,.515],[.575,.485],[.560,.255])
      ],
      bottom: pair(
        [[.345,.490],[.495,.490],[.495,.570],[.515,.870],[.405,.875],[.360,.600]],
        [[.490,.490],[.625,.495],[.650,.600],[.625,.885],[.515,.885],[.495,.570]]
      ),
      shoes: pair(
        [[.405,.865],[.520,.865],[.550,.900],[.540,.925],[.375,.925],[.360,.910]],
        [[.515,.880],[.625,.875],[.665,.905],[.650,.945],[.535,.945],[.515,.920]]
      ),
      hat: [poly([.450,.060],[.545,.060],[.570,.085],[.560,.125],[.455,.125],[.438,.095])]
    },
    mode: {
      top: [poly(
        [.410,.180],[.500,.175],[.565,.225],[.590,.420],
        [.555,.540],[.430,.555],[.370,.515],[.390,.255]
      )],
      outer: [
        poly([.360,.185],[.420,.165],[.425,.245],[.390,.590],[.350,.710],[.300,.820],[.255,.790],[.285,.625],[.260,.535],[.270,.300],[.315,.215]),
        poly([.555,.175],[.625,.205],[.660,.285],[.670,.515],[.700,.705],[.640,.735],[.590,.590],[.555,.520],[.570,.250])
      ],
      bottom: pair(
        [[.365,.535],[.490,.525],[.490,.610],[.465,.890],[.375,.890],[.350,.620]],
        [[.485,.525],[.570,.535],[.590,.620],[.565,.885],[.465,.885],[.490,.610]]
      ),
      shoes: pair(
        [[.390,.880],[.465,.880],[.485,.915],[.470,.948],[.385,.950],[.370,.938]],
        [[.465,.870],[.555,.870],[.585,.910],[.575,.935],[.500,.940],[.465,.915]]
      )
    },
    minimal: {
      top: [
        poly([.350,.230],[.440,.205],[.460,.245],[.460,.505],[.445,.555],[.350,.555],[.300,.525],[.290,.360],[.315,.260]),
        poly([.535,.205],[.625,.235],[.670,.310],[.675,.520],[.635,.555],[.540,.555],[.525,.500],[.525,.245])
      ],
      bottom: pair(
        [[.350,.505],[.500,.505],[.500,.575],[.470,.885],[.370,.885],[.350,.575]],
        [[.495,.505],[.625,.505],[.635,.575],[.590,.885],[.485,.885],[.500,.575]]
      ),
      shoes: pair(
        [[.365,.875],[.460,.875],[.478,.910],[.465,.938],[.340,.940],[.330,.928]],
        [[.515,.875],[.590,.875],[.635,.915],[.625,.938],[.520,.940],[.510,.920]]
      )
    },
    military: {
      top: [poly(
        [.430,.175],[.490,.205],[.550,.175],[.575,.260],
        [.585,.490],[.550,.535],[.440,.535],[.405,.505],[.420,.260]
      )],
      outer: [
        poly([.390,.165],[.440,.150],[.455,.230],[.430,.505],[.370,.535],[.330,.510],[.295,.540],[.260,.470],[.250,.335],[.285,.235]),
        poly([.550,.150],[.635,.185],[.690,.250],[.720,.390],[.690,.495],[.635,.535],[.585,.510],[.560,.235])
      ],
      bottom: pair(
        [[.350,.505],[.495,.500],[.495,.585],[.455,.890],[.350,.890],[.350,.590]],
        [[.490,.500],[.615,.505],[.645,.590],[.610,.890],[.485,.890],[.495,.585]]
      ),
      shoes: pair(
        [[.350,.875],[.455,.875],[.485,.920],[.470,.960],[.330,.975],[.315,.950]],
        [[.495,.875],[.610,.875],[.695,.930],[.695,.955],[.630,.970],[.500,.940]]
      )
    },
    work: {
      top: [poly(
        [.420,.155],[.485,.180],[.545,.155],[.565,.250],
        [.565,.525],[.535,.545],[.420,.535],[.395,.480],[.405,.240]
      )],
      outer: [
        poly([.380,.155],[.440,.135],[.450,.215],[.420,.525],[.350,.550],[.315,.520],[.280,.545],[.250,.465],[.250,.325],[.285,.225]),
        poly([.545,.135],[.640,.175],[.700,.245],[.730,.390],[.695,.500],[.640,.545],[.570,.525],[.550,.215])
      ],
      bottom: pair(
        [[.315,.520],[.500,.515],[.500,.600],[.475,.890],[.340,.890],[.315,.600]],
        [[.495,.515],[.645,.520],[.680,.610],[.700,.900],[.570,.900],[.500,.600]]
      ),
      shoes: pair(
        [[.340,.875],[.475,.875],[.505,.920],[.480,.955],[.340,.960],[.325,.940]],
        [[.570,.885],[.700,.885],[.765,.930],[.760,.955],[.680,.970],[.570,.945]]
      ),
      hat: [poly([.405,.035],[.520,.035],[.550,.065],[.540,.105],[.405,.105],[.390,.070])]
    },
    gorpcore: {
      top: [poly(
        [.420,.175],[.490,.180],[.560,.175],[.585,.240],
        [.580,.505],[.545,.525],[.415,.515],[.390,.470],[.395,.240]
      )],
      outer: [
        poly([.375,.165],[.430,.145],[.445,.230],[.405,.510],[.350,.535],[.310,.510],[.275,.535],[.250,.450],[.260,.300],[.300,.215]),
        poly([.555,.145],[.640,.180],[.695,.250],[.720,.410],[.690,.520],[.620,.545],[.575,.510],[.560,.230])
      ],
      bottom: pair(
        [[.350,.500],[.495,.500],[.495,.580],[.460,.870],[.390,.870],[.350,.585]],
        [[.490,.500],[.610,.505],[.625,.590],[.560,.885],[.460,.885],[.495,.580]]
      ),
      shoes: pair(
        [[.395,.855],[.485,.855],[.515,.900],[.500,.928],[.395,.928],[.380,.910]],
        [[.455,.865],[.555,.865],[.595,.905],[.580,.938],[.475,.938],[.450,.915]]
      ),
      hat: [poly([.425,.048],[.550,.048],[.570,.085],[.555,.135],[.425,.130],[.412,.085])]
    },
    y2k: {
      top: [poly(
        [.425,.175],[.490,.195],[.545,.170],[.565,.240],
        [.575,.445],[.540,.460],[.420,.455],[.390,.420],[.405,.235]
      )],
      outer: [
        poly([.385,.170],[.435,.150],[.450,.220],[.410,.475],[.350,.500],[.310,.485],[.285,.510],[.255,.445],[.250,.320],[.285,.220]),
        poly([.545,.145],[.620,.180],[.675,.240],[.705,.390],[.690,.510],[.640,.515],[.600,.490],[.560,.475],[.555,.220])
      ],
      bottom: pair(
        [[.335,.450],[.500,.450],[.500,.545],[.500,.900],[.380,.900],[.350,.570]],
        [[.495,.450],[.625,.455],[.675,.580],[.675,.905],[.550,.905],[.500,.545]]
      ),
      shoes: pair(
        [[.380,.885],[.500,.885],[.535,.920],[.520,.955],[.360,.965],[.345,.945]],
        [[.550,.890],[.675,.890],[.725,.925],[.715,.960],[.580,.965],[.545,.940]]
      )
    },
    vintage: {
      top: [poly(
        [.420,.175],[.490,.190],[.550,.170],[.575,.235],
        [.590,.470],[.550,.495],[.405,.490],[.380,.455],[.395,.235]
      )],
      outer: [
        poly([.370,.170],[.430,.145],[.445,.220],[.405,.490],[.350,.510],[.315,.535],[.285,.500],[.270,.370],[.285,.245]),
        poly([.550,.145],[.630,.180],[.685,.245],[.710,.390],[.690,.475],[.640,.510],[.580,.490],[.560,.220])
      ],
      bottom: pair(
        [[.325,.485],[.495,.480],[.500,.565],[.460,.900],[.350,.900],[.330,.570]],
        [[.490,.480],[.625,.485],[.645,.570],[.620,.900],[.490,.900],[.500,.565]]
      ),
      shoes: pair(
        [[.350,.890],[.460,.890],[.485,.925],[.470,.950],[.325,.955],[.315,.935]],
        [[.490,.890],[.620,.890],[.650,.930],[.640,.955],[.515,.960],[.485,.930]]
      )
    }
  };

  const HAT_PLACEMENT = {
    kireime:  { x: .48, y: .005, w: .205, angle: -4 },
    casual:   { x: .47, y: .015, w: .215, angle: -2 },
    amekaji:  { x: .50, y: -.015, w: .225, angle:  1 },
    trad:     { x: .46, y: .025, w: .210, angle: -2 },
    mode:     { x: .47, y: .015, w: .210, angle: -4 },
    minimal:  { x: .49, y: .003, w: .205, angle:  0 },
    military: { x: .49, y: -.012, w: .205, angle:  2 },
    y2k:      { x: .48, y: -.008, w: .200, angle: -8 },
    vintage:  { x: .50, y: .007, w: .210, angle:  0 }
  };

  const imageCache = new Map();
  const foregroundCache = new Map();
  const accessoryCache = new Map();
  let activeMask = null;

  function maskPolygons(styleId, slot, definitions) {
    return definitions[slot];
  }

  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    imageCache.set(src, promise);
    return promise;
  }

  function drawPolygons(ctx, polygons) {
    if (!polygons || !polygons.length) return;
    ctx.beginPath();
    for (const points of polygons) {
      if (!points.length) continue;
      ctx.moveTo(points[0][0] * W, points[0][1] * H);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0] * W, points[i][1] * H);
      }
      ctx.closePath();
    }
    ctx.fill();
  }

  function buildMasks(styleId, source) {
    const key = `${styleId}:${source}`;
    if (activeMask?.key === key) return activeMask;

    const definitions = MASKS[styleId];
    if (!definitions) return null;

    const slots = {};
    for (const slot of ['top', 'bottom', 'shoes', 'outer', 'hat']) {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff';
      drawPolygons(ctx, maskPolygons(styleId, slot, definitions));
      const data = ctx.getImageData(0, 0, W, H).data;
      const allowGrow = false;
      const expandedCanvas = document.createElement('canvas');
      expandedCanvas.width = W;
      expandedCanvas.height = H;
      const expandedCtx = expandedCanvas.getContext('2d', { willReadFrequently: true });
      expandedCtx.filter = allowGrow ? 'blur(9px)' : 'none';
      expandedCtx.drawImage(canvas, 0, 0);
      const expanded = expandedCtx.getImageData(0, 0, W, H).data;
      const core = new Uint8Array(W * H);
      const radius = 10;
      // 背景に近い白い服だけは色差判定が難しいため、トップスの内側を保証します。
      if (slot === 'top') {
        for (let y = radius; y < H - radius; y++) {
          for (let x = radius; x < W - radius; x++) {
            const p = y * W + x;
            if (data[p * 4 + 3] === 0) continue;
            const samples = [
              p - radius, p + radius, p - radius * W, p + radius * W,
              p - radius * W - radius, p - radius * W + radius,
              p + radius * W - radius, p + radius * W + radius
            ];
            if (samples.every(sample => data[sample * 4 + 3] > 0)) core[p] = 1;
          }
        }
      }
      slots[slot] = {
        data,
        expanded,
        core,
        allowGrow,
        // The polygon is only a routing guide. Every visible pixel still has
        // to belong to the photographed subject, so polygon corners can never
        // tint the studio backdrop.
        trustHard: false
      };
    }

    activeMask = { key, slots };
    return activeMask;
  }

  function parseHex(hex) {
    const value = hex.replace('#', '');
    const full = value.length === 3
      ? value.split('').map(c => c + c).join('')
      : value;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16)
    ];
  }

  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > .5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h / 6, s, l];
  }

  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToRgb(h, s, l) {
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const q = l < .5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [
      Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
      Math.round(hueToRgb(p, q, h) * 255),
      Math.round(hueToRgb(p, q, h - 1 / 3) * 255)
    ];
  }

  function skinLike(r, g, b) {
    const rg = r - g;
    const gb = g - b;
    return r > 72 && g > 42 && b > 28 &&
      rg > 10 && rg < 95 && gb > 8 && gb < 80 && b < r * .86;
  }

  function colorCenters(data, mask, protectSkin, background) {
    const samples = [];
    for (let i = 0; i < data.length; i += 64) {
      if (mask.data[i + 3] < 180) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (protectSkin && skinLike(r, g, b)) continue;
      const y = Math.floor(i / 4 / W);
      const x = (i / 4) % W;
      if (!mask.core[i / 4] && foregroundAmount(r, g, b, background, x, y) < .45) continue;
      samples.push([r, g, b]);
    }
    if (!samples.length) return [[128, 128, 128]];

    const count = Math.min(4, samples.length);
    let centers = Array.from({ length: count }, (_, i) =>
      samples[Math.floor(i * (samples.length - 1) / Math.max(1, count - 1))].slice());
    for (let iteration = 0; iteration < 5; iteration++) {
      const sums = Array.from({ length: count }, () => [0, 0, 0, 0]);
      for (const sample of samples) {
        let best = 0;
        let bestDistance = Infinity;
        for (let c = 0; c < centers.length; c++) {
          const distance = Math.hypot(
            sample[0] - centers[c][0], sample[1] - centers[c][1], sample[2] - centers[c][2]);
          if (distance < bestDistance) { best = c; bestDistance = distance; }
        }
        sums[best][0] += sample[0];
        sums[best][1] += sample[1];
        sums[best][2] += sample[2];
        sums[best][3]++;
      }
      centers = centers.map((center, i) => sums[i][3]
        ? [sums[i][0] / sums[i][3], sums[i][1] / sums[i][3], sums[i][2] / sums[i][3]]
        : center);
    }
    return centers;
  }

  function modelAmount(r, g, b, centers) {
    let distance = Infinity;
    for (const center of centers) {
      distance = Math.min(distance, Math.hypot(r - center[0], g - center[1], b - center[2]));
    }
    return Math.max(0, Math.min(1, (38 - distance) / 22));
  }

  function backgroundProfile(data) {
    const profile = new Array(H);
    for (let y = 0; y < H; y++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let x = 12; x < W - 12; x += 12) {
        if (x > 86 && x < W - 86) continue;
        const i = (y * W + x) * 4;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }
      profile[y] = [r / count, g / count, b / count];
    }
    return profile;
  }

  function foregroundAmount(r, g, b, background, x, y) {
    const expected = background[y];
    const distance = Math.hypot(
      r - expected[0],
      g - expected[1],
      b - expected[2]
    );
    return Math.max(0, Math.min(1, (distance - 12) / 30));
  }

  function foregroundSilhouette(data, source, background) {
    if (foregroundCache.has(source)) return foregroundCache.get(source);

    const size = W * H;
    const visited = new Uint8Array(size);
    const queue = new Int32Array(size);
    let head = 0;
    let tail = 0;

    const push = p => {
      if (visited[p]) return;
      visited[p] = 1;
      queue[tail++] = p;
    };

    for (let x = 0; x < W; x++) {
      push(x);
      push((H - 1) * W + x);
    }
    for (let y = 1; y < H - 1; y++) {
      push(y * W);
      push(y * W + W - 1);
    }

    const canEnter = (from, to) => {
      const fromI = from * 4;
      const toI = to * 4;
      const localDistance = Math.hypot(
        data[fromI] - data[toI],
        data[fromI + 1] - data[toI + 1],
        data[fromI + 2] - data[toI + 2]
      );
      if (localDistance > 18) return false;

      const y = Math.floor(to / W);
      const expected = background[y];
      const profileDistance = Math.hypot(
        data[toI] - expected[0],
        data[toI + 1] - expected[1],
        data[toI + 2] - expected[2]
      );
      return profileDistance < 100;
    };

    while (head < tail) {
      const p = queue[head++];
      const x = p % W;
      const neighbors = [];
      if (x > 0) neighbors.push(p - 1);
      if (x < W - 1) neighbors.push(p + 1);
      if (p >= W) neighbors.push(p - W);
      if (p < size - W) neighbors.push(p + W);
      for (const next of neighbors) {
        if (!visited[next] && canEnter(p, next)) push(next);
      }
    }

    const silhouette = new Uint8Array(size);
    for (let p = 0; p < size; p++) silhouette[p] = visited[p] ? 0 : 1;
    foregroundCache.set(source, silhouette);
    return silhouette;
  }

  function slotMeanLightness(data, mask, protectSkin, background) {
    let total = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (mask.data[i + 3] < 128) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (protectSkin && skinLike(r, g, b)) continue;
      const y = Math.floor(i / 4 / W);
      const x = (i / 4) % W;
      const p = i / 4;
      if (!mask.core[p] && foregroundAmount(r, g, b, background, x, y) < .4) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      total += (max + min) / 510;
      count++;
    }
    return count ? total / count : .5;
  }

  function recolor(data, mask, hex, protectSkin, background, centers, silhouette) {
    if (!hex || !mask) return;
    const [h, s, targetL] = rgbToHsl(parseHex(hex));
    const meanL = slotMeanLightness(data, mask, protectSkin, background);

    for (let i = 0; i < data.length; i += 4) {
      let alpha = mask.data[i + 3] / 255;
      if (alpha <= 0 && mask.allowGrow && mask.expanded[i + 3] > 12) {
        const grown = mask.expanded[i + 3] / 255;
        alpha = grown * modelAmount(data[i], data[i + 1], data[i + 2], centers);
      }
      if (alpha <= 0) continue;

      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (protectSkin && skinLike(r, g, b)) alpha *= .06;
      const y = Math.floor(i / 4 / W);
      const x = (i / 4) % W;
      const p = i / 4;
      if (!mask.core[p] && !mask.trustHard) {
        if (!silhouette[p]) continue;
        alpha *= foregroundAmount(r, g, b, background, x, y);
      }
      if (alpha <= 0) continue;

      const originalL = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
      const contrast = .82 - targetL * .12;
      const nextL = Math.max(.035, Math.min(.965, targetL + (originalL - meanL) * contrast));
      const saturation = targetL < .10 ? s * .45 : s;
      const [nr, ng, nb] = hslToRgb(h, saturation, nextL);
      const mix = alpha * .84;

      data[i]     = Math.round(r + (nr - r) * mix);
      data[i + 1] = Math.round(g + (ng - g) * mix);
      data[i + 2] = Math.round(b + (nb - b) * mix);
    }
  }

  async function tintedAccessory(type, hex) {
    const key = `${type}:${hex}`;
    if (accessoryCache.has(key)) return accessoryCache.get(key);

    const asset = type === 'beanie' ? 'hat-beanie' : 'hat-cap';
    const image = await loadImage(`assets/accessories/${asset}.png`);
    const layer = document.createElement('canvas');
    layer.width = image.naturalWidth;
    layer.height = image.naturalHeight;
    const context = layer.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);

    const frame = context.getImageData(0, 0, layer.width, layer.height);
    const [h, s, targetL] = rgbToHsl(parseHex(hex));
    for (let i = 0; i < frame.data.length; i += 4) {
      if (frame.data[i + 3] === 0) continue;
      const originalL = (
        Math.max(frame.data[i], frame.data[i + 1], frame.data[i + 2]) +
        Math.min(frame.data[i], frame.data[i + 1], frame.data[i + 2])
      ) / 510;
      const nextL = Math.max(.04, Math.min(.94, targetL + (originalL - .52) * .72));
      const [r, g, b] = hslToRgb(h, targetL < .10 ? s * .45 : s, nextL);
      frame.data[i] = r;
      frame.data[i + 1] = g;
      frame.data[i + 2] = b;
    }
    context.putImageData(frame, 0, 0);
    accessoryCache.set(key, layer);
    return layer;
  }

  async function drawHat(ctx, styleId, type, hex) {
    const placement = HAT_PLACEMENT[styleId];
    if (!placement || !hex) return;
    const layer = await tintedAccessory(type, hex);
    const size = placement.w * W;
    const centerX = placement.x * W;
    const centerY = placement.y * H + size / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(placement.angle * Math.PI / 180);
    ctx.drawImage(layer, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  async function render(canvas, styleId, colors, options = {}) {
    if (!canvas || !MASKS[styleId]) return false;
    const src = `assets/styles/${encodeURIComponent(styleId)}.jpg`;
    const img = await loadImage(src);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = W;
    canvas.height = H;
    ctx.drawImage(img, 0, 0, W, H);

    const image = ctx.getImageData(0, 0, W, H);
    const original = new Uint8ClampedArray(image.data);
    const masks = buildMasks(styleId, src).slots;
    const background = backgroundProfile(image.data);
    const silhouette = foregroundSilhouette(original, src, background);
    const centers = {
      top: colorCenters(original, masks.top, false, background),
      bottom: colorCenters(original, masks.bottom, false, background),
      shoes: colorCenters(original, masks.shoes, false, background),
      outer: colorCenters(original, masks.outer, true, background),
      hat: colorCenters(original, masks.hat, true, background)
    };

    // 内側から外側へ。重なる箇所では最後に描いた服が上になります。
    const bottomSkinGuard = [
      'kireime', 'casual', 'amekaji', 'street', 'mode',
      'military', 'gorpcore', 'y2k', 'vintage'
    ].includes(styleId);
    recolor(image.data, masks.bottom, colors.bottom, bottomSkinGuard, background, centers.bottom, silhouette);
    // Mustard and tan garments can satisfy the broad skin heuristic. Their
    // polygons stay inside the torso, so vintage can safely keep the full dye.
    recolor(
      image.data,
      masks.top,
      colors.top,
      styleId !== 'vintage',
      background,
      centers.top,
      silhouette
    );
    recolor(image.data, masks.shoes, colors.shoe, false, background, centers.shoes, silhouette);
    recolor(
      image.data,
      masks.outer,
      colors.outer,
      !['work', 'vintage'].includes(styleId),
      background,
      centers.outer,
      silhouette
    );
    recolor(image.data, masks.hat, colors.hat, false, background, centers.hat, silhouette);

    ctx.putImageData(image, 0, 0);
    if (options.overlayHat) {
      await drawHat(ctx, styleId, options.hatType || 'cap', colors.hat);
    }
    return true;
  }

  globalThis.RealLook = {
    render,
    has: id => Boolean(MASKS[id]),
    hasOriginalHat: id => Boolean(MASKS[id]?.hat),
    canOverlayHat: id => Boolean(HAT_PLACEMENT[id])
  };
})();
