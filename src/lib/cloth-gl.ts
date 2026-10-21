/**
 * The hero cloth as a deformable WebGL mesh.
 *
 * The cover texture sits on a fine grid. A vertex shader peels it like a real sheet being whipped off: material past a
 * moving fold line wraps around a curl, flips over and rides up and back toward the rear, flutters with travelling
 * waves that grow toward the free end, billows across its width, and finally flies off up-left. Normals are taken from
 * the deformed surface so the satin is re-lit every frame (highlights and fold shadows move, the lining shows darker).
 * At rest the lighting is calibrated to leave the texture exactly as it is.
 *
 * Progress is set from scroll (deterministic, so scrubbing backwards works). Time only drives the flutter, which keeps
 * the airborne sheet alive while the visitor pauses.
 */

const VERT = `
attribute vec2 aUV;
uniform vec2 uCloth;    // cover size in cover pixels
uniform vec4 uBox;      // where the resting cover sits, in canvas CSS px (x, y, w, h)
uniform vec2 uCanvas;   // canvas size in CSS px
uniform float uFold;    // fold position along F, in cover px
uniform float uR;       // curl radius
uniform float uPhi;     // how far the lifted sheet is turned over
uniform float uTime;
uniform float uFlutter; // 0..1
uniform float uFly;     // 0..1: final fly-off
varying vec2 vUV;
varying vec3 vN;
varying float vCurl;

const vec2 F = vec2(0.9218, 0.3875);   // toward the front wheel; the cloth travels the other way (up and back)
const vec2 T = vec2(-0.3875, 0.9218);

vec3 deform(vec2 uv) {
  vec2 P = uv * uCloth;
  float s = dot(P, F);
  float t = dot(P, T);
  float a = s - uFold;
  float sp = s;
  float z = 0.0;
  if (a > 0.0) {
    float arc = uR * uPhi;
    if (a < arc) {
      float th = a / uR;
      sp = uFold + uR * sin(th);
      z = uR * (1.0 - cos(th));
    } else {
      float r = a - arc;
      sp = uFold + uR * sin(uPhi) + r * cos(uPhi);
      z = uR * (1.0 - cos(uPhi)) + r * sin(uPhi);
    }
    // travelling waves, stronger toward the free end
    float amp = clamp(a / 420.0, 0.0, 1.0) * 28.0 * uFlutter;
    float w = sin(a * 0.018 - uTime * 6.0 + t * 0.006) + 0.5 * sin(a * 0.041 - uTime * 9.3 - t * 0.011);
    z += amp * w;
    sp += amp * 0.25 * w;
    t += amp * 0.35 * sin(a * 0.013 - uTime * 4.1);
    // the airborne sheet balloons across its width
    float tn = clamp((t + 449.0) / 1169.0, 0.0, 1.0);
    z += clamp(a / 300.0, 0.0, 1.0) * 38.0 * uFlutter * sin(3.14159 * tn);
  }
  vec2 Q = F * sp + T * t;
  Q += vec2(-1.0, -0.62) * uFly * 1500.0;   // off it goes, up and back
  z += uFly * 280.0;
  return vec3(Q, z);
}

void main() {
  vec3 p = deform(aUV);
  float e = 1.0 / 96.0;
  vec3 px = deform(aUV + vec2(e, 0.0));
  vec3 py = deform(aUV + vec2(0.0, e));
  vN = normalize(cross(px - p, py - p));
  vec2 P0 = aUV * uCloth;
  float a = dot(P0, F) - uFold;
  vCurl = (a > 0.0 && a < uR * uPhi) ? sin(a / uR) : 0.0;
  vUV = aUV;

  float persp = 2400.0 / (2400.0 - p.z);
  vec2 c = uCloth * 0.5;
  vec2 q = c + (p.xy - c) * persp;
  vec2 css = uBox.xy + q / uCloth * uBox.zw;
  gl_Position = vec4(css.x / uCanvas.x * 2.0 - 1.0, 1.0 - css.y / uCanvas.y * 2.0, clamp(-p.z / 3000.0, -1.0, 1.0), 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uAlpha;
varying vec2 vUV;
varying vec3 vN;
varying float vCurl;

void main() {
  vec4 tex = texture2D(uTex, vUV);          // premultiplied
  if (tex.a < 0.02) discard;
  vec3 n = normalize(vN);
  float back = step(n.z, 0.0);
  n = mix(n, -n, back);
  vec3 L = normalize(vec3(-0.45, -0.55, 0.70));
  // wrap lighting with an ambient floor: satin in the air stays luminous, just shifts light and shade
  float wrapN = (dot(n, L) + 0.65) / 1.65;
  float wrapRest = (L.z + 0.65) / 1.65;              // the same term for cloth lying flat (n = 0,0,1)
  float shade = clamp(mix(1.0, wrapN / wrapRest, 0.6), 0.62, 1.12);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = max(pow(max(dot(n, H), 0.0), 18.0) - pow(H.z, 18.0), 0.0) * 0.32;
  vec3 col = tex.rgb * shade;
  col = mix(col, col * vec3(0.9, 0.9, 0.93), back);    // the lining is only a little darker
  col += vec3(spec) * tex.a;
  col *= 1.0 - vCurl * 0.16;                           // the inside of the curl sits in soft shadow
  col = min(col, vec3(tex.a));
  gl_FragColor = vec4(col, tex.a) * uAlpha;
}
`;

const GX = 96;
const GY = 64;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Fold position along the peel axis, in cover px, at progress p. Shared by the shader driver and the hero's paint glint. */
export function foldAt(p: number, width: number, height: number) {
  const sMax = 0.9218 * width + 0.3875 * height;
  const sEnd = -70 * 2.55 - 260;
  return sMax + 2 - Math.min(1, Math.max(0, p) / 0.86) * (sMax + 2 - sEnd);
}

export interface ClothGL {
  /** Resolves true when the texture is loaded and the cloth can be drawn with WebGL. */
  ready: Promise<boolean>;
  setProgress(p: number): void;
  destroy(): void;
}

interface Options {
  canvas: HTMLCanvasElement;
  /** element whose box is where the resting cover sits (it is drawn there at progress 0) */
  anchor: HTMLElement;
  src: string;
  width: number;
  height: number;
}

export function createClothGL({ canvas, anchor, src, width, height }: Options): ClothGL | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true, depth: true });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
    return sh;
  };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  } catch {
    return null;
  }
  gl.useProgram(prog);

  // grid mesh
  const uv = new Float32Array((GX + 1) * (GY + 1) * 2);
  for (let j = 0, k = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) { uv[k++] = i / GX; uv[k++] = j / GY; }
  const idx = new Uint16Array(GX * GY * 6);
  for (let j = 0, k = 0; j < GY; j++) {
    for (let i = 0; i < GX; i++) {
      const a = j * (GX + 1) + i, b = a + 1, c = a + GX + 1, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  const aUV = gl.getAttribLocation(prog, "aUV");
  gl.enableVertexAttribArray(aUV);
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { cloth: U("uCloth"), box: U("uBox"), canvas: U("uCanvas"), fold: U("uFold"), r: U("uR"), phi: U("uPhi"), time: U("uTime"), flutter: U("uFlutter"), fly: U("uFly"), alpha: U("uAlpha") };
  gl.uniform2f(u.cloth, width, height);
  gl.uniform1f(u.r, 70);
  gl.uniform1f(u.phi, 2.55);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


  let progress = 0;
  let raf = 0;
  let destroyed = false;
  let texReady = false;
  const t0 = performance.now();

  const draw = () => {
    raf = 0;
    if (destroyed || !texReady) return;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.5 : 2); // fewer pixels to shade on phones
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }
    const cr = canvas.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const p = progress;
    gl.uniform4f(u.box, ar.left - cr.left, ar.top - cr.top, ar.width, ar.height);
    gl.uniform2f(u.canvas, cw, ch);
    gl.uniform1f(u.fold, foldAt(p, width, height)); // sweeps from the front wheel to past the rear, so it all lifts off
    gl.uniform1f(u.time, (performance.now() - t0) / 1000);
    gl.uniform1f(u.flutter, smoothstep(0, 0.08, p) * (1 - smoothstep(0.97, 1, p)));
    gl.uniform1f(u.fly, Math.pow(smoothstep(0.72, 1, p), 2));
    gl.uniform1f(u.alpha, 1 - smoothstep(0.9, 1, p));
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    if (p > 0 && p < 1) raf = requestAnimationFrame(draw); // keep fluttering while it is in the air
  };
  const request = () => { if (!raf) raf = requestAnimationFrame(draw); };

  const ready = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (destroyed) return resolve(false);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texReady = true;
      request();
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });

  return {
    ready,
    setProgress(p: number) {
      progress = Math.min(1, Math.max(0, p));
      request();
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
