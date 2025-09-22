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