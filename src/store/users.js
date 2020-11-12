export const state = () => ({
  users: [],
  userSelectOptions: [],
  rankSelectOptions: [],
})

export const mutations = {
  setUsers(state, users) {
    state.users = users
  },
  setUserSelectOptions(state, userSelectOptions) {
    state.userSelectOptions = userSelectOptions
  },
  setRankSelectOptions(state, rankSelectOptions) {
    state.rankSelectOptions = rankSelectOptions
  },
}

// ユーザ一覧の取得
export const actions = {
  async getUsers({ dispatch, commit }) {
    await this.$axios
      .$get('/admin/users')
      .then((response) => {
        // response = require('../testdata/users.json')
        const users = response.items.map((item) => {
          return {
            id: item.id,
            code: item.code,
            name: item.name,
            kana: item.name_index,
            nameAndKana: `${item.name}(${item.name_index})`,
            mail: item.mail_address,
            rank: item.rank,
            hiredAt: item.hired_at,
            retiredAt: item.retired_at,
            isAdmin: item.is_admin,
          }
        })
        commit('setUsers', users)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ユーザ一覧の取得に失敗しました', { root: true })
      })
  },

  // ユーザの更新
  async updateUser({ dispatch }, item) {
    const body = {
      code: item.code,
      name: item.name,
      name_index: item.kana,
      rank_id: item.rankId,
      hired_at: item.hiredAt ? new Date(item.hiredAt) : null,
      retired_at: item.hiredAt ? new Date(item.retiredAt) : null,
      is_admin: item.isAdmin,
    }
    await this.$axios
      .$put(`/admin/users/${item.id}`, body)
      .then(function (response) {
        dispatch('me/getMe', '_', { root: true })
        dispatch('getUerSelectOptions')
        dispatch('snackbar/displaySuccessSnackbar', 'ユーザの更新に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ユーザの更新に失敗しました', { root: true })
      })
  },

  // ユーザ選択肢の取得
  async getUserSelectOptions({ dispatch, commit }) {
    await this.$axios
      .$get('/admin/users')
      .then((response) => {
        // response = require('../testdata/users')
        const userSelectOptions = response.items.map((item) => {
          return {
            text: item.name,
            value: item.id,
          }
        })
        // 空欄を選択できるように空のアイテムを一番上に追加
        userSelectOptions.unshift({ text: '', value: '' })
        commit('setUserSelectOptions', userSelectOptions)
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ユーザ一覧の取得に失敗しました', { root: true })
      })
  },

  // ユーザ設定画面のランク選択肢の取得(rank.jsのランク選択肢では職種が表示されないため特別にここで取得)
  async getRankSelectOptions({ dispatch, commit }) {
    await this.$axios
      .$get('/ranks')
      .then((response) => {
        // response = require('../testdata/users_ranks.json')
        const rankSelectOptions = response.items.map((item) => {
          return {
            text: item.profession.name ? `${item.profession.name} - ${item.code}` : item.code,
            value: item.id,
          }
        })
        commit('setRankSelectOptions', rankSelectOptions)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランク選択肢の取得に失敗しました', { root: true })
      })
  },
}
