// Object.freezeを使用しないと外部で値を書き換えることが出来る
// Object.freezeはネストしたオブジェクトまで見ないので、Objectの中でObjectを宣言する場合、宣言するObjectにもObject.freezeをつける
// https://konprogrammer.hatenablog.com/entry/2020/02/26/122607
export default Object.freeze({
  BEFORE_ENTERING: 0,
  BETWEEN_ENTERING_AND_PUBLISHING: 1,
  AFTER_PUBLISHING: 2,
})
