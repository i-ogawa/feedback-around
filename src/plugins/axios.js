import axios from 'axios'
export default function ({ $axios }) {
  $axios.onRequest((config) => {
    axios.defaults.headers.common.Authorization = localStorage.getItem('auth._token.google')
    return config
  })
}
// axiosにデフォルトでヘッダーにAuthorizationを用意し、中身はlogalStorageのtokenを貼り付けるよ
// onRequest リクエスト飛ばす前に処理いれるよ
// common はすべてのリクエストGET,POST....につけるよ
// https://qiita.com/masatakaaaa/items/7bc7cfb2c561c54e424a
