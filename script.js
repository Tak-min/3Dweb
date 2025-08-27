/* "random-color-on-click" という名前の新しいコンポーネント（魔法）を登録します。
  この名前はHTMLで指定した属性名と一致させます。
*/
AFRAME.registerComponent('random-color-on-click', {
  
  // コンポーネントが初期化されたときに一度だけ呼ばれる関数
  init: function () {
    
    // 自分自身（このコンポーネントが付けられたエンティティ）をクリックした時の処理を登録
    this.el.addEventListener('click', () => {
      
      // ランダムな色を生成する
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      
      // 自分自身の 'material' という属性の中の 'color' プロパティを、
      // 今作ったランダムな色に設定（変更）する
      this.el.setAttribute('material', 'color', randomColor);
      
      console.log('色が変わりました！ -> ' + randomColor);
    });
  }
});