export const state = () => ({
  professions: [{}],
  professionSelectOptions: [],
})

export const mutations = {
  setProfessions(state, professions) {
    state.professions = professions
  },
  setProfessionSelectOptions(state, professionSelectOptions) {
    state.professionSelectOptions = professionSelectOptions
  },
}

// 職種一覧の取得
export const actions = {
  async getProfessions({ commit, dispatch }) {
    await this.$axios
      .$get('/admin/professions')
      .then((response) => {
        // response = require('../testdata/professions.json')
        commit('setProfessions', response.items)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '職種一覧の取得に失敗しました', { root: true })
      })
  },

  // 職種の登録
  async createProfession({ dispatch }, item) {
    const body = {
      name: item.name,
    }
    await this.$axios
      .$post('/admin/professions', body)
      .then(function (response) {
        dispatch('getProfessionSelectOptions')
        dispatch('snackbar/displaySuccessSnackbar', '職種の登録に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '職種の登録に成功しました', { root: true })
      })
  },

  // 職種の更新
  async updateProfession({ dispatch }, item) {
    const body = {
      id: item.id,
      name: item.name,
    }
    await this.$axios
      .$put(`/admin/professions/${item.id}`, body)
      .then(function (response) {
        dispatch('getProfessionSelectOptions')
        dispatch('snackbar/displaySuccessSnackbar', '職種の更新に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '職種の更新に失敗しました', { root: true })
      })
  },

  // 職種の削除
  async deleteProfession({ dispatch }, id) {
    await this.$axios
      .$delete(`/admin/professions/${id}`)
      .then(function (response) {
        dispatch('getProfessionSelectOptions')
        dispatch('snackbar/displaySuccessSnackbar', '職種の削除に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '職種の削除に失敗しました', { root: true })
      })
  },

  // 職種選択肢の取得
  async getProfessionSelectOptions({ dispatch, commit }) {
    await this.$axios
      .$get('/admin/professions')
      .then((response) => {
        // response = require('../testdata/professions.json')
        const professionSelectOptions = response.items.map((item) => {
          return {
            text: item.name,
            value: item.id,
          }
        })
        commit('setProfessionSelectOptions', professionSelectOptions)
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '職種選択肢の取得に失敗しました', { root: true })
      })
  },
}
