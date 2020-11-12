import sortBy from 'lodash/sortBy'

export const state = () => ({
  ranks: [],
  rankSelectOptions: [],
})

export const mutations = {
  setRanks(state, ranks) {
    state.ranks = ranks
  },
  setRankSelectOptions(state, rankSelectOptions) {
    state.rankSelectOptions = rankSelectOptions
  },
}

// ランク一覧の取得
export const actions = {
  async getRanks({ dispatch, commit }) {
    await this.$axios
      .$get('/ranks')
      .then((response) => {
        // response = require('../testdata/ranks.json')
        const ranks = response.items
        // 0件の場合はなにもしない
        if (ranks.length === 0) {
          commit('setRanks', ranks)
        } else {
          const sortedRanks = sortBy(ranks, (rank) => rank.sort_order)
          commit('setRanks', sortedRanks)
        }
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランク一覧の取得に失敗しました', { root: true })
      })
  },

  // ランクの登録
  async createRanks({ dispatch }, item) {
    const body = {
      profession_id: item.professionId ? item.professionId : null,
      code: item.code,
      name: item.name,
      description: item.description,
      previous_rank_id: item.previous_rank_id ? item.previous_rank_id : null,
      sort_order: Number(item.sort_order),
    }
    await this.$axios
      .$post('/admin/ranks', body)
      .then((response) => {
        dispatch('getRankSelectOptions')
        dispatch('users/getRankSelectOptions', 'ランクの削除に成功しました', { root: true })
        dispatch('snackbar/displaySuccessSnackbar', 'ランクの登録に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランクの登録に失敗しました', { root: true })
      })
  },

  // ランクの更新
  async updateRanks({ dispatch }, item) {
    // サーバーへPUTする情報
    const body = {
      profession_id: item.professionId ? item.professionId : null,
      code: item.code,
      name: item.name,
      description: item.description,
      previous_rank_id: item.previous_rank_id ? item.previous_rank_id : null,
      sort_order: Number(item.sort_order),
    }
    await this.$axios
      .$put(`/admin/ranks/${item.id}`, body)
      .then((response) => {
        dispatch('getRankSelectOptions')
        dispatch('users/getRankSelectOptions', 'ランクの削除に成功しました', { root: true })
        dispatch('snackbar/displaySuccessSnackbar', 'ランクの更新に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランクの更新に失敗しました', { root: true })
      })
  },

  // ランクの削除
  async deleteRanks({ dispatch }, id) {
    await this.$axios
      .$delete(`/admin/ranks/${id}`)
      .then((response) => {
        dispatch('getRankSelectOptions')
        dispatch('users/getRankSelectOptions', 'ランクの削除に成功しました', { root: true })
        dispatch('snackbar/displaySuccessSnackbar', 'ランクの削除に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランクの削除に失敗しました', { root: true })
      })
  },

  // ランク選択肢の取得
  async getRankSelectOptions({ dispatch, commit }) {
    await this.$axios
      .$get('/ranks')
      .then((response) => {
        // response = require('../testdata/ranks.json')
        const rankSelectOptions = response.items.map((item) => {
          return {
            text: item.profession.name ? `${item.code}` : item.code,
            value: item.id,
            profId: item.profession.id,
          }
        })
        // 空欄を選択できるように空のアイテムを一番上に追加
        rankSelectOptions.unshift({ text: '', value: '', profId: '' })
        commit('setRankSelectOptions', rankSelectOptions)
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランク選択肢の取得に失敗しました', { root: true })
      })
  },
}
