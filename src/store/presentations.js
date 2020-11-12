import orderBy from 'lodash/orderBy'
import consts from '../const/const.js'

export const state = () => ({
  presentations: [],
  presenters: {},
  users: [],
})

export const mutations = {
  setPresentations(state, presentations) {
    state.presentations = presentations
  },
  setPresenters(state, presenters) {
    state.presenters = presenters
  },
  setUsers(state, users) {
    state.users = users
  },
}

export const actions = {
  // プレゼンテーション一覧の取得
  async getPresentations({ dispatch, commit, state }) {
    await this.$axios
      .$get('/presentations')
      .then((response) => {
        // response = require('../testdata/presentations')
        // 0件の場合はなにもしない
        if (response.items.length === 0) {
          commit('setPresentations', response.items)
        } else {
          // 評価開始日で並び替えし最新のプレゼンテーションIDを取得(編集可能に設定するため)
          const orderedPresentations = orderBy(response.items, (o) => o.feedback_entering_on, 'desc')
          const mostRecentPresentationId = orderedPresentations[0].id

          const presentations = response.items.map((item) => {
            const today = this.$dayjs(new Date())
            const enteringOn = this.$dayjs(item.feedback_entering_on)
            const publishingOn = this.$dayjs(item.feedback_publishing_on)
            let status = ''
            let isEditable = false

            // 評価開始日以前
            if (today.isBefore(enteringOn)) {
              status = consts.BEFORE_ENTERING
              isEditable = true

              // 公開開始日以降
            } else if (today.isAfter(publishingOn)) {
              status = consts.AFTER_PUBLISHING
              if (item.id === mostRecentPresentationId) isEditable = true

              // 評価開始日〜公開開始日
            } else {
              status = consts.BETWEEN_ENTERING_AND_PUBLISHING
              isEditable = true
            }
            return {
              id: item.id,
              name: item.name,
              enteringOn: item.feedback_entering_on,
              publishingOn: item.feedback_publishing_on,
              status,
              isEditable,
            }
          })
          commit('setPresentations', presentations)
        }
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'プレゼンテーション一覧の取得に失敗しました', { root: true })
      })
  },

  // プレゼンテーションの登録
  async createPresentation({ dispatch }, item) {
    const body = {
      name: item.name,
      feedback_entering_on: item.enteringOn ? new Date(item.enteringOn) : '',
      feedback_publishing_on: item.publishingOn ? new Date(item.publishingOn) : '',
    }
    await this.$axios
      .$post('/admin/presentations', body)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', 'プレゼンテーションの登録に成功しました', { root: true })
        dispatch('default/getPresentations', '_', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'プレゼンテーションの登録に失敗しました', { root: true })
      })
  },

  // プレゼンテーションの更新
  async updatePresentation({ dispatch }, item) {
    const body = {
      id: item.id,
      name: item.name,
      feedback_entering_on: item.enteringOn ? new Date(item.enteringOn) : '',
      feedback_publishing_on: item.publishingOn ? new Date(item.publishingOn) : '',
    }
    await this.$axios
      .$put(`/admin/presentations/${Number(item.id)}`, body)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', 'プレゼンテーションの更新に成功しました', { root: true })
        dispatch('default/getPresentations', '_', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'プレゼンテーションの更新に失敗しました', { root: true })
      })
  },

  // プレゼンテーションの削除
  async deletePresentation({ dispatch }, item) {
    await this.$axios
      .$delete(`/admin/presentations/${item.id}`)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', 'プレゼンテーションの削除に成功しました', { root: true })
        dispatch('default/getPresentations', '_', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'プレゼンテーションの削除に失敗しました', { root: true })
      })
  },

  // 参加者一覧の取得
  async getPresenters({ dispatch, commit, state }, item) {
    await this.$axios.$get('/presenters').then(async (response) => {
      // response = require('../testdata/presenters_over20')
      await dispatch('getUsers')
      const targetPresenters = response.items
        .filter((presenter) => {
          return Number(presenter.presentation_id) === Number(item.id)
        })
        .map((presenter) => {
          const primaryEvaluator = state.users.find(
            (user) => Number(user.id) === Number(presenter.primary_evaluator_id)
          )
          const secondaryEvaluator = state.users.find(
            (user) => Number(user.id) === Number(presenter.secondary_evaluator_id)
          )
          return {
            id: presenter.id,
            presentingOn: presenter.presenting_on ? new Date(presenter.presenting_on).toISOString().substr(0, 10) : '',
            presenterId: presenter.user.id,
            presenterName: presenter.user.name,
            presenterNameIndex: presenter.user.name_index,
            primaryEvaluatorId: primaryEvaluator ? primaryEvaluator.id : '',
            primaryEvaluatorName: primaryEvaluator ? primaryEvaluator.name : '',
            primaryEvaluatorNameIndex: primaryEvaluator ? primaryEvaluator.name_index : '',
            secondaryEvaluatorId: secondaryEvaluator ? secondaryEvaluator.id : '',
            secondaryEvaluatorName: secondaryEvaluator ? secondaryEvaluator.name : '',
            secondaryEvaluatorNameIndex: secondaryEvaluator ? secondaryEvaluator.name_index : '',
          }
        })
      commit('setPresenters', targetPresenters)
    })
  },

  // 参加者の登録
  async createPresenter({ dispatch }, item) {
    const body = {
      presentation_id: item.presentationId,
      user_id: item.presenterId,
      primary_evaluator_id: item.primaryEvaluatorId,
      secondary_evaluator_id: item.secondaryEvaluatorId ? item.secondaryEvaluatorId : null,
      presenting_on: item.presentingOn ? new Date(item.presentingOn) : '',
    }
    console.log(body)
    await this.$axios
      .$post('/admin/presenters', body)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', '参加者の登録に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '参加者の登録に失敗しました', { root: true })
      })
  },

  // 参加者の更新
  async updatePresenter({ dispatch }, item) {
    const body = {
      id: item.id,
      presentation_id: item.presentationId,
      user_id: item.presenterId,
      primary_evaluator_id: item.primaryEvaluatorId,
      secondary_evaluator_id: item.secondaryEvaluatorId ? item.secondaryEvaluatorId : null,
      presenting_on: item.presentingOn ? new Date(item.presentingOn) : '',
    }
    await this.$axios
      .$put(`/admin/presenters/${Number(item.id)}`, body)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', '参加者の更新に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '参加者の更新に失敗しました', { root: true })
      })
  },

  // 参加者の削除
  async deletePresenter({ dispatch }, item) {
    await this.$axios
      .$delete(`/admin/presenters/${item.id}`)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', '参加者の削除に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', '参加者の削除に失敗しました', { root: true })
      })
  },

  // ユーザ一覧の取得
  async getUsers({ dispatch, commit }) {
    await this.$axios
      .$get('/admin/users')
      .then((response) => {
        // response = require('../testdata/users')
        commit('setUsers', response.items)
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ユーザ一覧の取得に失敗しました', { root: true })
      })
  },
}
