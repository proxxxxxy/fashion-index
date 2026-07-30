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
      top: [poly([.425,.188],[.535,.188],[.555,.453],[.407,.453])],
      outer: [
        poly([.330,.184],[.421,.161],[.430,.206],[.411,.456],[.363,.486],[.300,.456],[.277,.341],[.296,.223]),
        poly([.537,.165],[.626,.197],[.679,.246],[.694,.379],[.661,.474],[.591,.476],[.552,.450],[.548,.205])
      ],
      bottom: pair(
        [[.392,.438],[.494,.438],[.485,.840],[.365,.840]],
        [[.493,.438],[.588,.445],[.620,.838],[.506,.838]]
      ),
      shoes: pair(
        [[.360,.827],[.485,.827],[.486,.889],[.337,.895]],
        [[.503,.827],[.620,.827],[.657,.889],[.506,.889]]
      )
    },
    casual: {
      top: [poly([.372,.192],[.459,.170],[.559,.176],[.653,.222],[.682,.318],[.644,.390],[.625,.477],[.390,.477],[.377,.388],[.319,.386],[.297,.302],[.327,.223])],
      bottom: pair(
        [[.382,.492],[.488,.485],[.482,.861],[.360,.861]],
        [[.487,.485],[.598,.492],[.635,.860],[.506,.860]]
      ),
      shoes: pair(
        [[.355,.862],[.482,.856],[.506,.897],[.340,.904]],
        [[.509,.858],[.635,.858],[.684,.901],[.512,.901]]
      )
    },
    amekaji: {
      top: [poly([.431,.187],[.545,.187],[.566,.480],[.409,.480])],
      outer: [
        poly([.341,.185],[.431,.168],[.436,.218],[.408,.487],[.350,.500],[.285,.453],[.265,.332],[.296,.222]),
        poly([.545,.169],[.637,.194],[.692,.246],[.704,.370],[.661,.476],[.591,.486],[.557,.464],[.552,.213])
      ],
      bottom: pair(
        [[.370,.469],[.490,.464],[.482,.853],[.356,.853]],
        [[.491,.464],[.607,.475],[.623,.851],[.501,.851]]
      ),
      shoes: pair(
        [[.356,.866],[.476,.864],[.491,.895],[.460,.915],[.311,.916],[.304,.893]],
        [[.505,.866],[.620,.865],[.668,.895],[.662,.916],[.505,.916],[.493,.895]]
      )
    },
    trad: {
      top: [poly([.438,.181],[.531,.181],[.552,.438],[.421,.438])],
      outer: [
        poly([.351,.176],[.434,.158],[.438,.205],[.420,.449],[.375,.472],[.317,.435],[.294,.319],[.314,.216]),
        poly([.531,.161],[.614,.183],[.653,.224],[.667,.348],[.641,.453],[.584,.469],[.548,.441],[.544,.202])
      ],
      bottom: pair(
        [[.405,.426],[.491,.426],[.482,.831],[.387,.831]],
        [[.490,.426],[.580,.430],[.604,.831],[.503,.831]]
      ),
      shoes: pair(
        [[.383,.815],[.482,.815],[.489,.881],[.368,.884]],
        [[.502,.814],[.603,.814],[.636,.878],[.504,.878]]
      )
    },
    street: {
      top: [poly([.394,.193],[.565,.190],[.590,.480],[.378,.480])],
      outer: [
        poly([.318,.184],[.401,.168],[.407,.220],[.377,.476],[.323,.492],[.267,.444],[.246,.330],[.270,.222]),
        poly([.559,.170],[.649,.192],[.710,.246],[.730,.366],[.692,.468],[.622,.492],[.579,.471],[.570,.220])
      ],
      bottom: pair(
        [[.338,.463],[.490,.458],[.476,.870],[.327,.870]],
        [[.488,.458],[.626,.465],[.664,.868],[.503,.868]]
      ),
      shoes: pair(
        [[.324,.851],[.474,.851],[.501,.915],[.302,.920]],
        [[.506,.851],[.660,.850],[.700,.916],[.510,.916]]
      ),
      hat: [poly([.414,.060],[.555,.055],[.597,.107],[.581,.151],[.426,.148],[.393,.106])]
    },
    mode: {
      top: [poly([.410,.187],[.561,.178],[.586,.501],[.389,.508])],
      outer: [
        poly([.318,.177],[.412,.159],[.420,.220],[.390,.624],[.345,.758],[.275,.728],[.301,.505],[.257,.410],[.277,.238]),
        poly([.557,.161],[.637,.181],[.689,.249],[.700,.485],[.657,.713],[.590,.728],[.575,.510],[.571,.218])
      ],
      bottom: pair(
        [[.391,.485],[.493,.480],[.479,.858],[.369,.858]],
        [[.490,.480],[.590,.489],[.612,.853],[.504,.853]]
      ),
      shoes: pair(
        [[.366,.839],[.480,.839],[.493,.902],[.348,.904]],
        [[.505,.838],[.612,.838],[.648,.897],[.505,.897]]
      )
    },
    minimal: {
      top: [poly([.347,.178],[.429,.158],[.540,.158],[.631,.184],[.668,.244],[.674,.433],[.635,.503],[.562,.480],[.403,.480],[.334,.501],[.294,.429],[.301,.242])],
      bottom: pair(
        [[.392,.461],[.490,.457],[.481,.854],[.371,.854]],
        [[.489,.457],[.588,.463],[.613,.853],[.503,.853]]
      ),
      shoes: pair(
        [[.368,.837],[.480,.837],[.489,.899],[.348,.903]],
        [[.503,.836],[.611,.836],[.647,.897],[.504,.897]]
      )
    },
    military: {
      top: [poly([.425,.183],[.550,.183],[.568,.492],[.405,.492])],
      outer: [
        poly([.325,.178],[.425,.159],[.435,.214],[.404,.493],[.346,.510],[.280,.463],[.259,.337],[.287,.222]),
        poly([.548,.161],[.642,.184],[.698,.239],[.718,.364],[.681,.474],[.612,.506],[.567,.486],[.561,.213])
      ],
      bottom: pair(
        [[.372,.474],[.490,.468],[.481,.858],[.354,.858]],
        [[.489,.468],[.604,.476],[.628,.858],[.503,.858]]
      ),
      shoes: pair(
        [[.350,.841],[.480,.841],[.490,.917],[.326,.923]],
        [[.503,.841],[.628,.841],[.672,.917],[.503,.917]]
      )
    },
    work: {
      top: [poly([.421,.183],[.550,.184],[.570,.500],[.401,.500])],
      outer: [
        poly([.321,.180],[.423,.160],[.431,.214],[.401,.500],[.344,.517],[.278,.466],[.255,.338],[.281,.220]),
        poly([.548,.160],[.648,.186],[.710,.244],[.727,.372],[.682,.486],[.612,.514],[.568,.493],[.561,.214])
      ],
      bottom: pair(
        [[.348,.486],[.491,.477],[.477,.868],[.331,.868]],
        [[.489,.477],[.623,.486],[.660,.867],[.503,.867]]
      ),
      shoes: pair(
        [[.328,.850],[.475,.850],[.495,.916],[.304,.923]],
        [[.505,.850],[.659,.850],[.700,.918],[.508,.918]]
      ),
      hat: [poly([.395,.055],[.559,.052],[.596,.103],[.574,.150],[.410,.144],[.379,.104])]
    },
    gorpcore: {
      top: [poly([.412,.177],[.563,.173],[.584,.505],[.392,.505])],
      outer: [
        poly([.316,.177],[.416,.153],[.423,.215],[.393,.505],[.335,.521],[.272,.464],[.252,.332],[.280,.218]),
        poly([.559,.154],[.654,.181],[.713,.241],[.730,.371],[.689,.480],[.620,.516],[.580,.499],[.572,.214])
      ],
      bottom: pair(
        [[.386,.488],[.494,.482],[.480,.862],[.366,.862]],
        [[.492,.482],[.601,.488],[.632,.861],[.503,.861]]
      ),
      shoes: pair(
        [[.363,.845],[.479,.845],[.494,.909],[.345,.914]],
        [[.504,.844],[.632,.844],[.676,.909],[.506,.909]]
      ),
      hat: [poly([.398,.051],[.565,.049],[.602,.105],[.580,.153],[.414,.149],[.382,.102])]
    },
    y2k: {
      top: [poly([.410,.184],[.556,.183],[.578,.491],[.390,.491])],
      outer: [
        poly([.324,.177],[.414,.158],[.423,.214],[.390,.493],[.339,.507],[.278,.462],[.258,.337],[.285,.222]),
        poly([.553,.158],[.646,.181],[.701,.240],[.718,.365],[.680,.476],[.612,.505],[.577,.485],[.567,.213])
      ],
      bottom: pair(
        [[.378,.473],[.492,.468],[.482,.864],[.359,.864]],
        [[.490,.468],[.604,.474],[.632,.864],[.503,.864]]
      ),
      shoes: pair(
        [[.355,.846],[.480,.846],[.494,.912],[.335,.917]],
        [[.505,.846],[.631,.846],[.675,.912],[.507,.912]]
      )
    },
    vintage: {
      top: [poly([.412,.183],[.558,.182],[.578,.497],[.392,.497])],
      outer: [
        poly([.323,.178],[.416,.157],[.423,.215],[.390,.498],[.336,.514],[.276,.465],[.255,.337],[.281,.220]),
        poly([.554,.158],[.647,.182],[.703,.242],[.719,.370],[.679,.482],[.610,.511],[.578,.491],[.567,.214])
      ],
      bottom: pair(
        [[.376,.481],[.491,.473],[.481,.867],[.357,.867]],
        [[.490,.473],[.606,.480],[.634,.866],[.503,.866]]
      ),
      shoes: pair(
        [[.354,.850],[.480,.850],[.493,.916],[.333,.920]],
        [[.505,.850],[.633,.850],[.674,.914],[.506,.914]]
      )
    }
  };

  const imageCache = new Map();
  const foregroundCache = new Map();
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
      const allowGrow = slot === 'bottom' || slot === 'outer';
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
      slots[slot] = { data, expanded, core, allowGrow };
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
      return profileDistance < 62;
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
      if (!mask.core[p]) {
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

  async function render(canvas, styleId, colors) {
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
    recolor(image.data, masks.bottom, colors.bottom, false, background, centers.bottom, silhouette);
    recolor(image.data, masks.top, colors.top, true, background, centers.top, silhouette);
    recolor(image.data, masks.shoes, colors.shoe, false, background, centers.shoes, silhouette);
    recolor(image.data, masks.outer, colors.outer, true, background, centers.outer, silhouette);
    recolor(image.data, masks.hat, colors.hat, true, background, centers.hat, silhouette);

    ctx.putImageData(image, 0, 0);
    return true;
  }

  globalThis.RealLook = { render, has: id => Boolean(MASKS[id]) };
})();
