import consts from '../const/const.js'

export const state = () => ({
  presentation: [],
})

export const mutations = {
  setPresentation(state, presentation) {
    state.presentation = presentation
  },
}

export const actions = {
  async getPresentation({ dispatch, commit }, id) {
    await this.$axios
      .$get(`/presentations/${id}`)
      .then((response) => {
        // response = require('../testdata/presentations.json')
        const presentation = response
        const enteringDate = this.$dayjs(presentation.feedback_entering_on).format()
        const publishingDate = this.$dayjs(presentation.feedback_publishing_on).format()
        const today = this.$dayjs().format()
        let status = ''

        // 評価開始日以前 (遷移不可なので使われない想定)
        if (this.$dayjs(today).isBefore(this.$dayjs(enteringDate))) {
          status = consts.BEFORE_ENTERING

          // 公開開始日以降
        } else if (this.$dayjs(today).isAfter(this.$dayjs(publishingDate))) {
          status = consts.AFTER_PUBLISHING

          // 評価開始日〜公開開始日
        } else {
          status = consts.BETWEEN_ENTERING_AND_PUBLISHING
        }
        presentation.status = status
        commit('setPresentation', presentation)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'プレゼンテーション一覧の取得に失敗しました', { root: true })
      })
  },
}
