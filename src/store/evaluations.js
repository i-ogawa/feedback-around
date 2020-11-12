import sortBy from 'lodash/sortBy'
import cloneDeep from 'lodash/cloneDeep'

export const state = () => ({
  evaluations: [],
  indicatorCategorySelectOptions: [],
  rankDescriptionValidations: {},
})

export const mutations = {
  setEvaluations(state, evaluations) {
    state.evaluations = evaluations
  },
  setIndicatorCategorySelectOptions(state, indicatorCategorySelectOptions) {
    state.indicatorCategorySelectOptions = indicatorCategorySelectOptions
  },
  updateRankDescriptionValidations(state, item) {
    state.rankDescriptionValidations = { ...state.rankDescriptionValidations, ...item }
  },
}

export const actions = {
  // 評価一覧の取得
  async getEvaluations({ commit, dispatch }) {
    await this.$axios
      .$get('/indicator_categories')
      .then((response) => {
        // response = require('../testdata/indicator_categories.json')
        const evaluations = response.items
        const copiedEvaluations = cloneDeep(evaluations)

        // 評価基準大分類の並び替え
        const sortedEvaluations = sortBy(copiedEvaluations, 'sort_order')

        // 評価基準中分類の並び替え
        sortedEvaluations.forEach((category) => {
          const sortedSubcategories = sortBy(category.indicatorSubcategories, 'sort_order')
          category.indicatorSubcategories = sortedSubcategories
        })
        // 評価ランクの並び替え
        sortedEvaluations.forEach((category) => {
          category.indicatorSubcategories.forEach((subcategory) => {
            const sortedRanks = sortBy(subcategory.indicatorSubcategoryRanks, 'rank.sort_order')
            subcategory.indicatorSubcategoryRanks = sortedRanks
          })
        })
        commit('setEvaluations', sortedEvaluations)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価一覧の取得に失敗しました', { root: true })
      })
  },

  // 評価基準大分類の新規追加
  async createIndicatorCategory({ dispatch }, item) {
    const body = {
      sort_order: Number(item.sortOrder),
      profession_id: item.professionId,
      name: item.name,
    }
    await this.$axios
      .$post('/admin/indicator_categories', body)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価基準大分類の登録に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準大分類の登録に失敗しました', { root: true })
      })
  },

  // 評価基準大分類の編集保存
  async updateIndicatorCategory({ dispatch }, item) {
    const body = {
      id: item.id,
      sort_order: Number(item.sortOrder),
      name: item.name,
    }
    await this.$axios
      .$put(`/admin/indicator_categories/${item.id}`, body)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価基準大分類の更新に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準大分類の更新に失敗しました', { root: true })
      })
  },

  // 評価基準大分類の削除
  async deleteIndicatorCategory({ dispatch }, item) {
    await this.$axios
      .$delete(`/admin/indicator_categories/${item.id}`)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価基準大分類の削除に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準大分類の削除に失敗しました', { root: true })
      })
  },

  // 評価基準中分類の新規追加
  async createIndicatorSubcategory({ dispatch }, item) {
    const professionId = item.professionId
    // 該当職種のランク一覧を作成
    // const ranks = await this.$axios.$get('/indicator_categories')
    const ranks = await require('../testdata/ranks.json')
    const indicatorSubcategoryRanks = ranks.items
      .filter((item) => !item.profession.id || item.profession.id === professionId)
      .map((item) => {
        return {
          rank_id: item.id,
          description: null,
        }
      })
    const body = {
      indicator_category_id: item.indicatorCategoryId,
      sort_order: Number(item.sortOrder),
      name: item.name,
      indicatorSubcategoryRanks,
    }
    await this.$axios
      .$post('/admin/indicator_subcategories', body)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価基準中分類の登録に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準中分類の登録に失敗しました', { root: true })
      })
  },

  // 評価基準中分類の編集保存
  async updateIndicatorSubcategory({ dispatch }, item) {
    const body = {
      id: item.id,
      sort_order: Number(item.sortOrder),
      indicator_category_id: item.indicatorCategoryId,
      name: item.name,
    }
    await this.$axios
      .$put(`/admin/indicator_categories/${item.id}`, body)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価基準中分類の更新に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準中分類の更新に失敗しました', { root: true })
      })
  },

  // 評価基準中分類の削除
  async deleteIndicatorSubcategory({ dispatch }, item) {
    await this.$axios
      .$delete(`/admin/indicator_subcategories/${item.id}`)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価基準中分類の削除に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準中分類の削除に失敗しました', { root: true })
      })
  },

  // 評価ランクの編集保存
  async updateIndicatorSubcategoryRanks({ dispatch }, item) {
    const indicatorSubcategoryRanks = item.indicatorSubcategoryRanks.map((rank) => {
      return {
        rank_id: rank.id,
        description: rank.description,
      }
    })
    const body = {
      id: item.id,
      indicatorSubcategoryRanks,
    }
    await this.$axios
      .$put(`/admin/indicator_categories/${item.id}`, body)
      .then(function (response) {
        dispatch('snackbar/displaySuccessSnackbar', '評価ランクの更新に成功しました', { root: true })
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価ランクの更新に失敗しました', { root: true })
      })
  },
}
