export const state = () => ({
  indicators: [],
  myEvaluationEvaluatorName: '',
  professionRanks: [],
  editedItem: [],
})

export const mutations = {
  setMyEvaluationEvaluatorName(state, myEvaluationEvaluatorName) {
    state.myEvaluationEvaluatorName = myEvaluationEvaluatorName
  },
  setIndicators(state, indicators) {
    state.indicators = indicators
  },
  setProfessionRanks(state, professionRanks) {
    state.professionRanks = professionRanks
  },
  setEditedItem(state, editedItem) {
    state.editedItem = editedItem
  },
  updateMessage(state, message, index) {
    state.myEvaluationInput.editedItem.indicatorCategoryEvaluations[index].message = message
  },
}

export const actions = {
  async getMyEvaluationDisplay({ commit }) {
    // const res = await this.$axios.$get(`/evaluation_and_feedbacks`)
    const res = await require('../testdata/evaluation_and_feedback.json')
    const myEvaluationDisplay = res.items
    let myEvaluation = ''
    for (let i = 0; i < myEvaluationDisplay.length; i++) {
      if (myEvaluationDisplay[i].evaluator_id === myEvaluationDisplay[i].presenter_id) {
        myEvaluation = Object.assign({}, myEvaluationDisplay[i])
      }
    }
    const myEvaluationEvaluatorName = myEvaluation.evaluator.name
    commit('setMyEvaluationEvaluatorName', myEvaluationEvaluatorName)
    const professionRanks = myEvaluation.evaluator.rank.profession.ranks.map((item) => {
      return [item.code]
    })
    commit('setProfessionRanks', professionRanks)
    // const res = await this.$axios.$get(`/presenters/{id}`)
    const con = await require('../testdata/presenters.json')
    const professionId = con.items[0].user.rank.profession_id
    // const res = await this.$axios.$get(`/indicator_categories`)
    const response = await require('../testdata/indicator_categories.json')
    const indicators = response.items.filter((item) => item.profession_id === professionId)
    let editedItem = []
    if (myEvaluation === undefined) {
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
    } else {
      editedItem = {
        presenter_id: con.items[0].user_id,
        evaluator_id: con.items[0].user_id,
        comment: myEvaluation.comment,
        want_rank_id: myEvaluation.want_rank_id,
        indicatorCategoryEvaluations: [],
      }
      for (let i = 0; i < indicators.length; i++) {
        const indicatorSubcategoryEvaluations = {
          indicator_category_id: indicators[i].indicatorSubcategories[0].indicator_category_id,
          comment: myEvaluation.indicatorCategoryEvaluationAndFeedbacks[i].comment,
          indicatorSubcategoryEvaluations: [],
        }
        for (let j = 0; j < indicators[i].indicatorSubcategories.length; j++) {
          const item = {
            indicator_subcategory_id:
              indicators[i].indicatorSubcategories[j].indicatorSubcategoryRanks[0].indicator_subcategory_id,
            rank_id:
              myEvaluation.indicatorCategoryEvaluationAndFeedbacks[i].indicatorSubcategoryEvaluations[j]
                .indicator_subcategory_rank_id,
          }
          indicatorSubcategoryEvaluations.indicatorSubcategoryEvaluations.push(item)
        }
        editedItem.indicatorCategoryEvaluations.push(indicatorSubcategoryEvaluations)
      }
    }
    commit('setEditedItem', editedItem)
  },
  async getIndicators({ commit, dispatch }) {
    await this.$axios
      .$get(`/evaluation_and_feedbacks`)
      .then((response) => {
        response = require('../testdata/evaluation_and_feedback.json')
        const professionId = response.items[0].evaluator.rank.profession_id
        const indicatorCategories = require('../testdata/indicator_categories.json')
        const indicators = indicatorCategories.items.filter((item) => item.profession_id === professionId)
        commit('setIndicators', indicators)
        console.log('indicator', indicators)
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランクの更新に失敗しました', { root: true })
      })
  },
  async updateMyEvaluation({ dispatch }, item) {
    // 評価ランクが更新されていた場合は置き換える
    for (let i = 0; i < item.editedItems.indicatorCategoryEvaluations.length; i++) {
      for (
        let j = 0;
        j < item.editedItems.indicatorCategoryEvaluations[i].indicatorSubcategoryEvaluations.length;
        j++
      ) {
        const subcategoryId =
          item.editedItems.indicatorCategoryEvaluations[i].indicatorSubcategoryEvaluations[j].indicator_subcategory_id
        for (let k = 0; k < item.selectedRanks.length; k++) {
          const selectedSubcategoryId = item.selectedRanks[k].indicator_subcategory_id
          if (Number(subcategoryId) === Number(selectedSubcategoryId)) {
            item.editedItems.indicatorCategoryEvaluations[i].indicatorSubcategoryEvaluations[j] = item.selectedRanks[k]
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
    // サーバーへPUTする情報
    const body = {
      presenter_id: item.editedItems.presenter_id,
      evaluator_id: item.editedItems.evaluator_id,
      comment: item.editedItems.comment,
      want_rank_id: item.editedItems.want_rank_id,
      indicatorCategoryEvaluations: item.editedItems.indicatorCategoryEvaluations,
    }
    await this.$axios
      .$post(`/evaluations`, body)
      .then((response) => {
        dispatch('snackbar/displaySuccessSnackbar', 'ランクの更新に成功しました', { root: true })
      })
      .catch((error) => {
        console.log(error)
        dispatch('snackbar/displayErrorSnackbar', 'ランクの更新に失敗しました', { root: true })
      })
  },
}
