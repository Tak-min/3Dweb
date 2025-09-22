/* 'show-info-on-click' という名前のコンポーネントを登録します。
  画像などをクリックしたときに、指定されたテキストの表示・非表示を切り替えます。
*/
AFRAME.registerComponent('show-info-on-click', {
  // schemaで、HTML側から受け取るデータ（ここではターゲットのID）を定義します
  schema: {
    target: {type: 'selector'} // IDセレクタで要素を指定する
  },

  // コンポーネントが初期化されたときに一度だけ呼ばれる関数
  init: function () {
    // ターゲット要素（このコンポーネントがくっついている要素）がクリックされた時の処理
    this.el.addEventListener('click', () => {
      
      // HTMLの "target" 属性で指定された要素を取得
      const targetElement = this.data.target;
      
      // ターゲットが見つからなければ、エラーを防ぐために処理を終了
      if (!targetElement) {
        console.error('ターゲット要素が見つかりません！');
        return;
      }

      // ターゲット要素の現在の表示状態（visible属性）を取得
      const currentVisibility = targetElement.getAttribute('visible');
      
      // 表示状態を反転させる（trueならfalseに、falseならtrueに）
      targetElement.setAttribute('visible', !currentVisibility);
    });
  }
});

// Create guide lights along both sides of the corridor when the scene is ready
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (!scene) return;

  // Avoid duplicating lights if script runs twice
  if (scene.querySelectorAll('.guide-light').length > 0) return;

  const startZ = 8; // front of the corridor
  const endZ = -30; // back of the corridor
  const spacing = 4; // distance between lights
  const leftX = -4.2; // slightly in front of the left wall
  const rightX = 4.2; // slightly in front of the right wall
  const lampY = 0.08; // lamp height from floor

  function createRow(x) {
    for (let z = startZ; z >= endZ; z -= spacing) {
      const container = document.createElement('a-entity');
      container.className = 'guide-light';
      container.setAttribute('position', `${x} ${lampY} ${z}`);

      // small point light to softly illuminate the floor
      const light = document.createElement('a-light');
      light.setAttribute('type', 'point');
      light.setAttribute('color', '#ffdcb3');
      light.setAttribute('intensity', '1.0');
      light.setAttribute('distance', '5');
      light.setAttribute('decay', '2');
      light.setAttribute('position', '0 0.06 0');
      container.appendChild(light);

      // visible lamp geometry (small cylinder)
      const lamp = document.createElement('a-cylinder');
      lamp.setAttribute('radius', '0.08');
      lamp.setAttribute('height', '0.12');
      lamp.setAttribute('segments-radial', '6');
      lamp.setAttribute('material', 'color: #ffdcb3; emissive: #ffdcb3; emissiveIntensity: 0.9');
      lamp.setAttribute('position', '0 0.06 0');
      container.appendChild(lamp);

      // subtle glow plane to suggest light spill (facing upward, very transparent)
      const glow = document.createElement('a-plane');
      glow.setAttribute('width', '0.6');
      glow.setAttribute('height', '0.6');
      glow.setAttribute('rotation', '-90 0 0');
      glow.setAttribute('position', '0 0 0');
      glow.setAttribute('material', 'color: #ffdcb3; opacity: 0.08; transparent: true; side: double');
      container.appendChild(glow);

      scene.appendChild(container);
    }
  }

  createRow(leftX);
  createRow(rightX);
});

// (Removed older circular-gallery block: replaced by corridor bulge below)

// Create a bulging circular section (a widened area of the corridor)
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (!scene) return;

  if (scene.querySelector('#corridor-bulge')) return;

  const bulge = document.createElement('a-entity');
  bulge.setAttribute('id', 'corridor-bulge');
  // place bulge centered at z = -10 (relative to scene)
  bulge.setAttribute('position', '0 0 -10');

  // increase radius and segments for a smoother, larger bulge
  const bulgeRadius = 6.5; // how far the corridor expands outward
  const innerRadius = 8.5; // inner radius where walkway meets original corridor
  const segments = 120; // higher segments -> smoother curve

  // floor ring (widened area) - use many boxes to approximate smooth curve
  // create circular array of floor lamps instead of many floor segments
  const lampCount = 20; // number of lamps around the bulge
  const lampRadius = (innerRadius + bulgeRadius) / 2; // where lamps sit
  for (let i = 0; i < lampCount; i++) {
    const angle = (i / lampCount) * Math.PI * 2;
    const x = Math.cos(angle) * lampRadius;
    const z = Math.sin(angle) * lampRadius;

    const lampContainer = document.createElement('a-entity');
    lampContainer.setAttribute('class', 'bulge-lamp');
    lampContainer.setAttribute('position', `${x} 0.06 ${z}`);

    // small point light to softly illuminate the local floor
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('color', '#ffdcb3');
    light.setAttribute('intensity', '1.2');
    light.setAttribute('distance', '4');
    light.setAttribute('decay', '2');
    light.setAttribute('position', '0 0.12 0');
    lampContainer.appendChild(light);

    // visible lamp geometry
    const lamp = document.createElement('a-cylinder');
    lamp.setAttribute('radius', '0.06');
    lamp.setAttribute('height', '0.12');
    lamp.setAttribute('segments-radial', '6');
    lamp.setAttribute('material', 'color: #ffdcb3; emissive: #ffdcb3; emissiveIntensity: 0.9');
    lamp.setAttribute('position', '0 0.06 0');
    lampContainer.appendChild(lamp);

    bulge.appendChild(lampContainer);
  }

  // curved inner wall segments to connect to existing corridor walls
  const wallHeight = 5;
  // create openings at entrance (front) and exit (back) angles
  const gapHalfAngle = (35 * Math.PI) / 180; // half-gap ~40deg -> total gap ~80deg
  const entranceAngle = Math.PI / 2; // forward (positive local Z)
  const exitAngle = (3 * Math.PI) / 2; // backward (negative local Z)

  function angleDistance(a, b) {
    let d = Math.abs(a - b) % (Math.PI * 2);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  }

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    // skip segments within gap around entrance or exit to create openings
    if (angleDistance(angle, entranceAngle) < gapHalfAngle || angleDistance(angle, exitAngle) < gapHalfAngle) {
      continue;
    }

    const r = innerRadius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    const wallSeg = document.createElement('a-box');
    wallSeg.setAttribute('width', '0.2');
    wallSeg.setAttribute('height', `${wallHeight}`);
    wallSeg.setAttribute('depth', '0.8');
    wallSeg.setAttribute('position', `${x} ${wallHeight/2} ${z}`);
    wallSeg.setAttribute('rotation', `0 ${-angle * 180 / Math.PI} 0`);
    wallSeg.setAttribute('material', 'src: #wall-texture; repeat: 1 1; roughness: 1; metalness: 0');
    bulge.appendChild(wallSeg);
  }

  // central pillar in the bulge (slimmer than previous central pillar)
  const centerPillar = document.createElement('a-cylinder');
  centerPillar.setAttribute('radius', '1.0');
  centerPillar.setAttribute('height', `${wallHeight}`);
  centerPillar.setAttribute('position', '0 2.5 0');
  centerPillar.setAttribute('material', 'color: #2b2b2b; roughness: 1; metalness: 0');
  bulge.appendChild(centerPillar);

  // subtle overhead light in bulge center
  const overhead = document.createElement('a-light');
  overhead.setAttribute('type', 'point');
  overhead.setAttribute('color', '#fff5e6');
  overhead.setAttribute('intensity', '0.8');
  overhead.setAttribute('distance', '8');
  overhead.setAttribute('position', '0 3 0');
  bulge.appendChild(overhead);

  scene.appendChild(bulge);
});