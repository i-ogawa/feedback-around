import orderBy from 'lodash/orderBy'
import consts from '../const/const.js'

export const state = () => ({
  presentations: [],
  displayPresentations: [],
})

export const mutations = {
  setPresentations(state, presentations) {
    state.presentations = presentations
  },
  setDisplayPresentations(state, displayPresentations) {
    state.displayPresentations = displayPresentations
  },
}

export const actions = {
  async getPresentations({ dispatch, commit, state }) {
    await this.$axios
      .$get('/presentations')
      .then((response) => {
        // response = require('../testdata/presentations')

        // 0件の場合はそのまま出力
        if (response.items.length <= 0) {
          commit('setPresentations', response.items)
          commit('setDisplayPresentations', response.items)
        }

        // ソート
        const orderedPresentations = orderBy(response.items, (o) => o.feedback_entering_on, 'desc')

        // 必要な情報だけオブジェクトにまとめる
        const presentations = orderedPresentations.map((item) => {
          const today = new Date()
          let status = ''
          let icon = ''
          let iconColor = ''
          let link = ''
          let chipMessage = ''

          // 評価開始日以前
          if (today < new Date(item.feedback_entering_on)) {
            status = consts.BEFORE_ENTERING
            icon = 'mdi-progress-clock'
            iconColor = 'grey'
            chipMessage = new Date(item.feedback_entering_on)

            // 公開開始日以降
          } else if (('afterPublishing', new Date(item.feedback_publishing_on) < today)) {
            status = consts.AFTER_PUBLISHING
            icon = 'mdi-window-minimize'
            iconColor = 'grey'
            link = `/presentations/${item.id}`
            chipMessage = ''

            // 評価開始日〜公開開始日
          } else {
            status = consts.BETWEEN_ENTERING_AND_PUBLISHING
            icon = 'mdi-pencil'
            iconColor = 'primary'
            link = `/presentations/${item.id}`
            chipMessage = ''
          }
          return {
            id: item.id,
            name: item.name,
            status,
            icon,
            iconColor,
            link,
            chipMessage,
          }
        })
        commit('setPresentations', presentations)
        commit('setDisplayPresentations', presentations.slice(0, 3))
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '参加者一覧の取得に失敗しました', { root: true })
      })
  },

  setAllPresentations({ commit, state }) {
    commit('setDisplayPresentations', state.presentations)
  },
}
