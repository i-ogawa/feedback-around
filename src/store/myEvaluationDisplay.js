export const state = () => ({
  myEvaluation: [],
  primary: [],
  secondary: [],
  member: [],
  myWantRank: '',
  indicators: [],
  myEvaluationEvaluatorName: '',
  primaryEvaluatorName: '',
  secondaryEvaluatorName: '',
})

export const mutations = {
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
  setMyEvaluationEvaluatorName(state, myEvaluationEvaluatorName) {
    state.myEvaluationEvaluatorName = myEvaluationEvaluatorName
  },
  setSecondaryEvaluatorName(state, secondaryEvaluatorName) {
    state.secondaryEvaluatorName = secondaryEvaluatorName
  },
  setPrimaryEvaluatorName(state, primaryEvaluatorName) {
    state.primaryEvaluatorName = primaryEvaluatorName
  },
  setMyWantRank(state, myWantRank) {
    state.myWantRank = myWantRank
  },
  setIndicators(state, indicators) {
    state.indicators = indicators
  },
}

export const actions = {
  async getMyEvaluationDisplay({ commit }) {
    // const res = await this.$axios.$get(`/evaluation_and_feedbacks`)
    // const indicator = res.items[0].presenter_id
    // const res = await this.$axios.$get(`/presenters/{indicator}`)
    const res = await require('../testdata/evaluation_and_feedback.json')
    const resp = await require('../testdata/presenters.json')
    const presenters = resp.items[0]
    console.log('aa', presenters.secondary_evaluator_id)
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
    console.log(myEvaluation)
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
  },
  async getMyWantRank({ commit }) {
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
    commit('setMyWantRank', myWantRank)
  },
  async getIndicators({ commit }) {
    // const res = await this.$axios.$get(`/evaluation_and_feedbacks`)

    // const res = await this.$axios.$get(`/professions/{indicator}`)
    const res = await require('../testdata/presenters.json')
    const professionId = res.items[0].user.rank.profession_id
    console.log(professionId)
    const response = await require('../testdata/indicator_categories.json')
    const indicators = response.items.filter((item) => item.profession_id === professionId)
    commit('setIndicators', indicators)
  },
}
