const envPath = `env/.env.${process.env.ENV || 'dev'}`
require('dotenv').config({ path: envPath })
console.log('process.env.ENV:', process.env.ENV)
const srcDir = 'src'
export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'spa',
  srcDir,
  /*
   ** Nuxt middlewareをどこでも使えるように設定
   */
  router: {
    middleware: ['auth'],
  },
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'server',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    { src: '~plugins/day.js', ssr: false },
    { src: '~plugins/axios.js', ssr: false },
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */ components: true,
  /*
   ** Nuxt.js dev-modules
   */
  webfontloader: {
    google: {
      families: ['Noto Sans JP', 'Source Sans Pro'],
    },
    /*
     ** Nuxt.js modules
     */
  },
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    // https://github.com/nuxt-community/dotenv-module
    [
      '@nuxtjs/dotenv',
      {
        path: 'env/',
        filename: process.env.ENV !== 'prd' ? '.env.dev' : '.env.prd',
      },
    ],
  ],
  vuetify: {
    theme: {
      dark: false,
      themes: {
        light: {
          main: '#434343',
          secondary: '#79736A',
          primary: '#CAA667',
          accent: '#F7C873',
          sub: '#FAEBCD',
          error: '#e74c3c',
          action: '#23DB2A',
        },
      },
    },
  },
  /*
   ** Nuxt.js modules
   */
  // リフレッシュ設定がないと401権限エラーになる
  // https://github.com/nuxt-community/auth-module/blob/dev/demo/nuxt.config.ts
  modules: ['@nuxtjs/auth', '@nuxtjs/axios', 'nuxt-webfontloader'],
  auth: {
    cookie: {
      options: {
        maxAge: 60 * 60 * 24,
      },
    },
    redirect: {
      login: '/login', // 未ログイン状態でアクセスした場合のリダイレクト先
      logout: '/', // ログアウト後の遷移先
      callback: '/callback', // コールバックルート
      home: '/home', // ログイン後の遷移先
    },
    strategies: {
      // local: {
      //   token: {
      //     property: 'auth._token.google',
      //     refreshToken: {
      //       property: 'refresh_token',
      //       data: 'refresh_token',
      //       maxAge: 60 * 60 * 24 * 30,
      //     },
      //   },
      //   },
      //   localRefresh: {
      //     scheme: 'refresh',
      //     token: {
      //       property: 'token.accessToken',
      //       maxAge: 15,
      //     },
      //     refreshToken: {
      //       property: 'token.refreshToken',
      //       data: 'refreshToken',
      //       maxAge: false,
      //     },
      // },

      // TODO: リフレッシュトークンができておらず401エラーになるバグ対応中
      // https://dev.auth.nuxtjs.org/schemes/oauth2
      google: {
        scheme: 'refresh', // 前はoauth2にしていた
        authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        userinfo_endpoint: undefined,
        scope: ['openid', 'profile', 'email'],
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        response_type: 'id_token', // id_token以外だとCallback.vuで固まる
        token_key: 'id_token',
        grant_type: 'authorization_code',
        access_type: 'offline',
        refreshToken: {
          // 新たに追加
          property: 'refresh_token',
          maxAge: 60 * 60 * 24 * 30,
        },
      },
    },
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.BASE_URL,
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
}
