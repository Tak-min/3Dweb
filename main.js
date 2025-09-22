/* 'show-info-on-click' コンポーネント
  画像などをクリックしたときに、指定されたテキストの表示・非表示を切り替えます。
*/
AFRAME.registerComponent('show-info-on-click', {
  schema: {
    target: {type: 'selector'} // IDセレクタで要素を指定する
  },
  init: function () {
    this.el.addEventListener('click', () => {
      const targetElement = this.data.target;
      if (!targetElement) {
        console.error('ターゲット要素が見つかりません！');
        return;
      }
      const currentVisibility = targetElement.getAttribute('visible');
      targetElement.setAttribute('visible', !currentVisibility);
    });
  }
});

/* 'player-controls' コンポーネント
  キーボード（WASD）でプレイヤーを移動させます。
  物理演算とフレームレートを考慮した設計です。
*/
AFRAME.registerComponent('player-controls', {
  schema: {
    speed: {type: 'number', default: 3.0} // 移動速度
  },
  init: function () {
    this.keys = {};
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // キー入力のイベントリスナーを登録
    document.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });
  },

  tick: function (time, deltaTime) {
    if (!this.el.body) return; // 物理ボディがロードされるまで待つ

    const dt = deltaTime / 1000; // デルタタイムを秒に変換
    this.direction.set(0, 0, 0);

    // キー入力に応じて方向ベクトルを決定
    if (this.keys.w || this.keys.arrowup)   { this.direction.z -= 1; }
    if (this.keys.s || this.keys.arrowdown) { this.direction.z += 1; }
    if (this.keys.a || this.keys.arrowleft) { this.direction.x -= 1; }
    if (this.keys.d || this.keys.arrowright){ this.direction.x += 1; }

    // 方向ベクトルが存在する場合（キーが押されている場合）
    if (this.direction.lengthSq() > 0) {
      // カメラのY軸回転を取得
      const cameraRotation = this.el.getAttribute('rotation').y;
      
      // カメラの向きに合わせて移動方向を回転
      const angle = THREE.MathUtils.degToRad(cameraRotation);
      this.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      // 速度を計算
      this.velocity.copy(this.direction.normalize().multiplyScalar(this.data.speed * dt));
    } else {
      this.velocity.set(0, 0, 0);
    }
    
    // 物理ボディの位置を更新 (kinematic-bodyは直接位置を操作する)
    const currentPosition = this.el.getAttribute('position');
    this.el.setAttribute('position', {
      x: currentPosition.x + this.velocity.x,
      y: currentPosition.y, // Y軸の移動はさせない
      z: currentPosition.z + this.velocity.z
    });
  }
});