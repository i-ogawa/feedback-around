export const state = () => ({
  indicators: [],
  myEvaluationEvaluatorName: '',
  professionRanks: [],
  editedItem: [],
  presenters: '',
  me: '',
  myEvaluation: [],
  primary: [],
  secondary: [],
  member: [],
  primaryEvaluatorName: '',
  secondaryEvaluatorName: '',
  meId: '',
  myWantRank: '',
})

export const mutations = {
  setMyWantRank(state, myWantRank) {
    state.myWantRank = myWantRank
  },
  setMyEvaluationEvaluatorName(state, myEvaluationEvaluatorName) {
    state.myEvaluationEvaluatorName = myEvaluationEvaluatorName
  },
  setIndicators(state, indicators) {
    state.indicators = indicators
  },
  setProfessionRanks(state, professionRanks) {
    state.professionRanks = professionRanks
    console.log(professionRanks)
  },
  setEditedItem(state, editedItem) {
    state.editedItem = editedItem
  },
  updateMessage(state, message, index) {
    state.myEvaluationInput.editedItem.indicatorCategoryEvaluations[index].message = message
  },
  setPresenters(state, presenters) {
    state.presenters = presenters
  },
  setMe(state, me) {
    state.me = me
  },
  setMyEvaluation(state, myEvaluation) {
    state.myEvaluation = myEvaluation
  },
  setMember(state, member) {
    state.member = member.sort(() => Math.random() - 0.5)
  },
  setSecondary(state, secondary) {
    state.secondary = secondary
  },
  setPrimary(state, primary) {
    state.primary = primary
  },
  setSecondaryEvaluatorName(state, secondaryEvaluatorName) {
    state.secondaryEvaluatorName = secondaryEvaluatorName
  },
  setPrimaryEvaluatorName(state, primaryEvaluatorName) {
    state.primaryEvaluatorName = primaryEvaluatorName
  },
}

export const actions = {
  async getMe({ dispatch, commit }) {
    await this.$axios
      .$get('/me')
      .then((response) => {
        response = require('../testdata/me_sample.json')
        commit('setMe', response)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('displayErrorSnackbar', 'ログインユーザ情報の取得に失敗しました')
      })
  },
  async getPresenters({ dispatch, commit, state }) {
    await dispatch('getMe')
    await this.$axios
      .$get('/presenters')
      .then((response) => {
        response = require('../testdata/presenters')
        const presenters = response.items.filter(
          (presenter) =>
            presenter.secondary_evaluator_id === state.me.id || presenter.primary_evaluator_id === state.me.id
        )
        commit('setPresenters', presenters)
      })
      .catch(function (error) {
        console.log(error)
        dispatch('displayErrorSnackbar', '参加者一覧の取得に失敗しました')
      })
  },
  async getMyWantRank({ dispatch, commit }) {
    // const res = await this.$axios.$get(`/evaluation_and_feedbacks`)
    const res = await require('../testdata/evaluation_and_feedback.json')
    const rankSelectOptions = res.items.map((item) => {
      return {
        text: item.want_rank_id,
        value: item.presenter_id,
        profId: item.evaluator_id,
        indicatorCategoryEvaluationAndFeedbacks: item.indicatorCategoryEvaluationAndFeedbacks,
      }
    })
    const items = rankSelectOptions.filter((item) => item.profId === item.value)
    const myWantRank = items[0].text
    commit('setMyWantRank', myWantRank).catch(function (error) {
      console.log(error)
      dispatch('displayErrorSnackbar', 'データ取得に失敗しました')
    })
  },
  async getMyEvaluationDisplay({ dispatch, commit, state }, item) {
    await dispatch('getMe')
    // const presentationId = item.presentation_id
    // const res = await this.$axios.$get(`/evaluation_and_feedbacks`)
    const resp = require('../testdata/presenters.json')
    const presenters = resp.items[0]
    const res = await require('../testdata/evaluation_and_feedback.json')
    const myEvaluationDisplay = res.items
    let myEvaluation = ''
    let secondary = ''
    let primary = ''
    const member = []
    for (let i = 0; i < myEvaluationDisplay.length; i++) {
      if (myEvaluationDisplay[i].evaluator_id === myEvaluationDisplay[i].presenter_id) {
        myEvaluation = Object.assign({}, myEvaluationDisplay[i])
      } else if (myEvaluationDisplay[i].evaluator_id === presenters.primary_evaluator_id) {
        primary = Object.assign({}, myEvaluationDisplay[i])
      } else if (myEvaluationDisplay[i].evaluator_id === presenters.secondary_evaluator_id) {
        secondary = Object.assign({}, myEvaluationDisplay[i])
      } else {
        myEvaluationDisplay[i].evaluator.name = '匿名'
        member.push(myEvaluationDisplay[i])
      }
    }
    commit('setPrimary', primary)
    commit('setMyEvaluation', myEvaluation)
    commit('setMember', member)
    commit('setSecondary', secondary)
    const myEvaluationEvaluatorName = myEvaluation.evaluator.name
    commit('setMyEvaluationEvaluatorName', myEvaluationEvaluatorName)
    const primaryEvaluatorName = primary.evaluator.name
    commit('setPrimaryEvaluatorName', primaryEvaluatorName)
    const secondaryEvaluatorName = secondary.evaluator.name
    commit('setSecondaryEvaluatorName', secondaryEvaluatorName)
    const professionRanks = myEvaluation.evaluator.rank.profession.ranks.map((item) => {
      return [item.code]
    })
    commit('setProfessionRanks', professionRanks)
    // const res = await this.$axios.$get(`/presenters/{id}`)
    const con = await require('../testdata/presenters.json')
    const professionId = con.items[0].user.rank.profession_id
    console.log(professionId)
    // const res = await this.$axios.$get(`/indicator_categories`)
    const response = await require('../testdata/indicator_categories.json')
    const indicators = response.items.filter((item) => item.profession_id === professionId)
    let editedItem = []
    if (state.me.id === secondary.evaluator_id || state.me.id === primary.evaluator_id) {
      if (secondary === undefined || primary === undefined) {
        editedItem = {
          presenter_id: con.items[0].user_id,
          evaluator_id: con.items[0].user_id,
          comment: 'string',
          want_rank_id: 'string',
          indicatorCategoryEvaluations: [],
        }
        for (let i = 0; i < indicators.length; i++) {
          const indicatorSubcategoryEvaluations = {
            indicator_category_id: indicators[i].indicatorSubcategories[0].indicator_category_id,
            comment: 'string',
            indicatorSubcategoryEvaluations: [],
          }
          for (let j = 0; j < indicators[i].indicatorSubcategories.length; j++) {
            const item = {
              indicator_subcategory_id:
                indicators[i].indicatorSubcategories[j].indicatorSubcategoryRanks[0].indicator_subcategory_id,
              rank_id: 'string',
            }
            indicatorSubcategoryEvaluations.indicatorSubcategoryEvaluations.push(item)
          }
          editedItem.indicatorCategoryEvaluations.push(indicatorSubcategoryEvaluations)
        }
      } else if (state.me.id === secondary.evaluator_id) {
        editedItem = {
          presenter_id: con.items[0].user_id,
          evaluator_id: con.items[0].user_id,
          comment: secondary.comment,
          want_rank_id: secondary.want_rank_id,
          indicatorCategoryEvaluations: [],
        }
        for (let i = 0; i < indicators.length; i++) {
          const indicatorSubcategoryEvaluations = {
            indicator_category_id: indicators[i].indicatorSubcategories[0].indicator_category_id,
            comment: secondary.indicatorCategoryEvaluationAndFeedbacks[i].comment,
            indicatorSubcategoryEvaluations: [],
          }
          console.log(indicatorSubcategoryEvaluations)
          for (let j = 0; j < indicators[i].indicatorSubcategories.length; j++) {
            const item = {
              indicator_subcategory_id:
                indicators[i].indicatorSubcategories[j].indicatorSubcategoryRanks[0].indicator_subcategory_id,
              rank_id:
                secondary.indicatorCategoryEvaluationAndFeedbacks[i].indicatorSubcategoryEvaluations[j]
                  .indicator_subcategory_rank_id,
            }
            indicatorSubcategoryEvaluations.indicatorSubcategoryEvaluations.push(item)
          }
          editedItem.indicatorCategoryEvaluations.push(indicatorSubcategoryEvaluations)
        }
      } else {
        editedItem = {
          presenter_id: con.items[0].user_id,
          evaluator_id: con.items[0].user_id,
          comment: primary.comment,
          want_rank_id: primary.want_rank_id,
          indicatorCategoryEvaluations: [],
        }
        for (let i = 0; i < indicators.length; i++) {
          const indicatorSubcategoryEvaluations = {
            indicator_category_id: indicators[i].indicatorSubcategories[0].indicator_category_id,
            comment: primary.indicatorCategoryEvaluationAndFeedbacks[i].comment,
            indicatorSubcategoryEvaluations: [],
          }
          for (let j = 0; j < indicators[i].indicatorSubcategories.length; j++) {
            const item = {
              indicator_subcategory_id:
                indicators[i].indicatorSubcategories[j].indicatorSubcategoryRanks[0].indicator_subcategory_id,
              rank_id:
                primary.indicatorCategoryEvaluationAndFeedbacks[i].indicatorSubcategoryEvaluations[j]
                  .indicator_subcategory_rank_id,
            }
            indicatorSubcategoryEvaluations.indicatorSubcategoryEvaluations.push(item)
          }
          editedItem.indicatorCategoryEvaluations.push(indicatorSubcategoryEvaluations)
        }
      }
    }
    commit('setEditedItem', editedItem)
  },
  async getIndicators({ commit }) {
    // const res = await this.$axios.$get(`/evaluation_and_feedbacks`)
    const res = await require('../testdata/evaluation_and_feedback.json')
    const professionId = res.items[0].evaluator.rank.profession_id
    const response = await require('../testdata/indicator_categories.json')
    const indicators = response.items.filter((item) => item.profession_id === professionId)
    commit('setIndicators', indicators)
  },
  async updateMyEvaluation({ dispatch }, item) {
    console.log('item', item)
    for (let i = 0; i < item.editedItems.indicatorCategoryEvaluations.length; i++) {
      for (
        let j = 0;
        j < item.editedItems.indicatorCategoryEvaluations[i].indicatorSubcategoryEvaluations.length;
        j++
      ) {
        const subcategoryId =
          item.editedItems.indicatorCategoryEvaluations[i].indicatorSubcategoryEvaluations[j].indicator_subcategory_id
        for (let k = 0; k < item.selectedRanks.length; k++) {
          const selectedSubcategoryId = Number(item.selectedRanks[k].indicator_subcategory_id)
          if (Number(subcategoryId) === Number(selectedSubcategoryId)) {
            console.log('match!', selectedSubcategoryId)
            item.editedItems.indicatorCategoryEvaluations[i].indicatorSubcategoryEvaluations[j] = Number(
              item.selectedRanks[k]
            )
          }
        }
      }
    }
    for (let i = 0; i < item.editedItems.indicatorCategoryEvaluations.length; i++) {
      const categoryId = item.editedItems.indicatorCategoryEvaluations[i].indicator_category_id
      for (let k = 0; k < item.selectedComment.length; k++) {
        const indicatorCategoryId = item.selectedComment[k].indicator_category_id
        if (Number(categoryId) === Number(indicatorCategoryId)) {
          item.editedItems.indicatorCategoryEvaluations[i].comment = item.selectedComment[k].comment
        }
      }
    }
    const body = {
      presenter_id: item.editedItems.presenter_id,
      evaluator_id: item.editedItems.evaluator_id,
      comment: item.editedItems.comment,
      want_rank_id: item.editedItems.want_rank_id,
      indicatorCategoryEvaluations: item.editedItems.indicatorCategoryEvaluations,
    }
    console.log('body', body)
    await this.$axios
      .$post(`/evaluations`, { body: this.body })
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', 'ランクの更新に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランクの更新に失敗しました', { root: true })
      })
  },
}
