import sortBy from 'lodash/sortBy'
import cloneDeep from 'lodash/cloneDeep'

export const state = () => ({
  presenters: {},
  feedbacks: [],
  selectedFeedbacks: {},
  indicatorCategories: [],
})

export const mutations = {
  setPresenters(state, presenters) {
    state.presenters = presenters
  },
  setFeedbacks(state, feedbacks) {
    state.feedbacks = feedbacks
  },
  setSelectedFeedbacks(state, item) {
    state.selectedFeedbacks = { ...state.rankDescriptionValidations, ...item }
  },
  setIndicatorCategories(state, indicatorCategories) {
    state.indicatorCategories = indicatorCategories
  },
}

export const actions = {
  // 参加者一覧の取得
  async getPresenters({ dispatch, commit, rootState }) {
    await this.$axios
      .$get(`/presenters?filter_presentation_id=${rootState.presentationTabs.presentation.id}`)
      .then((response) => {
        // response = require('../testdata/presenters')
        commit('setPresenters', response.items)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '参加者一覧の取得に失敗しました', { root: true })
      })
  },

  // フィードバック一覧の取得
  async getFeedbacks({ dispatch, commit, rootState }) {
    // 評価は使用はしないがフィードバック詳細表示の初期処理として必要
    await dispatch('getIndicatorCategories')

    await this.$axios
      .$get('/feedbacks')
      .then((response) => {
        // response = require('../testdata/feedbacks')
        const feedbacks = response.items.filter((feedback) => {
          return feedback.member_id === rootState.me.me.id
        })
        commit('setFeedbacks', feedbacks)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'フィードバック一覧の取得に失敗しました', { root: true })
      })
  },

  // 選択された参加者のフィードバックの取得
  getSelectedFeedbacks({ commit, state }, item) {
    const professionId = item.user.rank.profession_id
    const selectedFeedback = state.feedbacks.find((feedback) => feedback.presenter_id === item.id)

    // 空の評価基準大分類のフィードバック郡を作成
    const categories = state.indicatorCategories.filter((evaluation) => evaluation.profession_id === professionId)
    const feedbacks = categories.map((category) => {
      return {
        id: '',
        feedback_id: '',
        indicator_category_id: category.id,
        indicator_category_name: category.name,
        comment: '',
      }
    })
    // 入力済みのフィードバックがあれば上書きする
    if (selectedFeedback) {
      const indicatorCategoryFeedbacks = selectedFeedback.indicatorCategoryFeedbacks
      for (let i = 0; i < feedbacks.length; i++) {
        for (let j = 0; j < indicatorCategoryFeedbacks.length; j++) {
          if (feedbacks[i].indicator_category_id === indicatorCategoryFeedbacks[j].indicator_category_id) {
            feedbacks[i] = {
              id: indicatorCategoryFeedbacks[j].id,
              feedback_id: indicatorCategoryFeedbacks[j].feedback_id,
              indicator_category_id: indicatorCategoryFeedbacks[j].indicator_category_id,
              indicator_category_name: indicatorCategoryFeedbacks[j].indicator_category_name,
              comment: indicatorCategoryFeedbacks[j].comment,
            }
          }
        }
      }
    }
    const comment = selectedFeedback ? selectedFeedback.comment : ''
    commit('setSelectedFeedbacks', { presenter_id: item.id, comment, feedbacks })
  },

  // 評価基準大分類の取得
  async getIndicatorCategories({ commit, dispatch }) {
    await this.$axios
      .$get('/indicator_categories')
      .then((response) => {
        // response = require('../testdata/indicator_categories.json')
        const indicatorCategories = response.items
        // 並び替え
        const copiedEvaluations = cloneDeep(indicatorCategories)
        const sortedEvaluations = sortBy(copiedEvaluations, 'sort_order')
        commit('setIndicatorCategories', sortedEvaluations)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '評価基準大分類の取得に失敗しました', { root: true })
      })
  },

  // フィードバックの編集保存
  async updateFeedbacks({ dispatch }, item) {
    const body = {
      presenter_id: item.presenter_id,
      comment: item.comment,
      indicatorCategoryFeedbacks: item.feedbacks,
    }
    await this.$axios
      .$post('/feedbacks', body)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', '参加者の更新に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '参加者の更新に失敗しました', { root: true })
      })
  },
}
