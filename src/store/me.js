export const state = () => ({
  me: {},
})

export const mutations = {
  setMe(state, me) {
    state.me = me
  },
}

export const actions = {
  async getMe({ dispatch, commit }) {
    await this.$axios
      .$get('/me')
      .then((response) => {
        // response = require('../testdata/me_sample.json')
        commit('setMe', response)
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ログインユーザ情報の取得に失敗しました', { root: true })
      })
  },
}
