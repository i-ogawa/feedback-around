<template lang="pug">
v-app
  //-サイドナビゲーションドロワ
  v-navigation-drawer(v-model='drawer', app, clipped, dark)
    v-list(dense)
      v-list-item
        v-list-item-title プレゼンテーション一覧
    v-list(dense, nav)
      v-list-item(v-for='item in displayPresentations', :key='item.id', nuxt, :to='item.link ? item.link : ""')
        v-icon(:color='item.iconColor') {{ item.icon }}
        v-tooltip(v-if='item.status === BEFORE_ENTERING', right, color='primary')
          template(v-slot:activator='{ on, attrs }')
            v-list-item-content(v-bind='attrs', v-on='on')
              v-list-item-title.pl-4 {{ item.name }}
          span {{ $dayjs(item.chipMessage).format("YYYY/M/D") }}から評価開始
        div(v-else, right)
          v-list-item-content
            v-list-item-title.pl-4 {{ item.name }}
      v-list-item(v-show='displayPresentations.length <= 3', @click='displayAll')
        v-list-item-content
          v-row
            .ml-13.caption もっと見る

  //-上部ナビゲーションバー
  v-app-bar(:clipped-left='$vuetify.breakpoint.lgAndUp', app, dark, color='main')
    v-app-bar-nav-icon.ml-1(@click.stop='drawer = !drawer')
      v-avatar
        img.pt-1.pb-1(src='/logo_transparent_small.png')
    v-toolbar-title.ml-0.pl-2(style='width: 300px')
      span.hidden-sm-and-down(style='color: #faebcd') FEEDBACK AROUND
    v-spacer

    //-ログインユーザ情報カード
    v-menu(offset-x, offset-y, bottom, nudge-bottom='20')
      template(v-slot:activator='{ on, attrs }')
        v-avatar
          v-img(v-if='me.avatar_url', :src='me.avatar_url', v-bind='attrs', v-on='on')
          v-img(v-else, src='/omeroid.png', v-bind='attrs', v-on='on')

      v-sheet.ma-7.mb-0
        v-row(justify='center')
          v-avatar(size='84')
            v-img(v-if='me.avatar_url', :src='me.avatar_url')
            v-img(v-else, src='/omeroid_card.png', gradient='to top right, rgba(230,250,111,.20), rgba(75,94,194,.5)')
      v-list(width='330')
        v-list-item(two-line)
          v-list-item-content
            v-list-item-title.text-center {{ me.name }}
              span.subtitle-2(v-show='me.is_admin') (管理者)
            v-list-item-subtitle.text-center {{ me.mail_address }}
        v-divider

        //-管理者メニュー
        v-list-item(v-if='me.is_admin', dense, nuxt, to='/admin')
          v-list-item-icon
            v-icon(small, color='main') mdi-wrench
          v-list-item-content
            v-list-item-title 管理者設定

        //-ログアウト
        v-list-item(dense, nuxt, @click='logout')
          v-list-item-icon
            v-icon(color='main') mdi-logout
          v-list-item-content
            v-list-item-title ログアウト

  //-メイン
  v-main
    v-container(fluid)
      nuxt

      //-スナックバー
      .text-center.ma-2
        SnackbarError(:isShow='errorSnackbar', :message='errorMessage', @close='closeErrorSnackbar')
        SnackbarSuccess(:isShow='successSnackbar', :message='successMessage', @close='closeSuccessSnackbar')
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import consts from '../const/const.js'
import SnackbarSuccess from '~/components/common/SnackbarSuccess.vue'
import SnackbarError from '~/components/common/SnackbarError.vue'

export default {
  name: 'Default',
  components: {
    SnackbarSuccess,
    SnackbarError,
  },
  data: () => ({
    BEFORE_ENTERING: consts.BEFORE_ENTERING,
    drawer: null,
    allDisplayed: false,
    snackTimeout: 3000,
  }),
  computed: {
    ...mapState('default', ['displayPresentations']),
    ...mapState('me', ['me']),
    ...mapState('snackbar', ['successMessage', 'successSnackbar', 'errorMessage', 'errorSnackbar', 'isErr']),
  },
  watch: {
    successMessage() {
      setTimeout(() => {
        this.closeSuccessSnackbar()
      }, this.snackTimeout)
    },
  },
  async mounted() {
    this.getPresentations()
    await this.getMe()
  },
  methods: {
    ...mapActions('default', ['getPresentations', 'setAllPresentations']),
    ...mapActions('me', ['getMe']),
    ...mapMutations('snackbar', ['setSuccessMessage', 'setSuccessSnackbar', 'setErrorMessage', 'setErrorSnackbar']),
    logout() {
      this.$auth.logout()
      window.location.href = '/'
    },
    displayAll() {
      this.setAllPresentations()
      this.allDisplayed = true
    },
    closeSuccessSnackbar() {
      this.setSuccessSnackbar(false)
      this.setSuccessMessage('')
    },
    closeErrorSnackbar() {
      this.setErrorSnackbar(false)
      this.setErrorMessage('')
    },
  },
}
</script>
