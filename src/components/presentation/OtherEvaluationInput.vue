<template lang="pug">
div(v-if='presenter===""')
  p 評価対象者がいません
div(v-else)
  v-row.name
    v-col(cols='6', md='6')
      v-sheet.pa-4
        v-text-field(
          v-model='search',
          label='ユーザ検索',
          flat,
          solo-inverted,
          hide-details,
          clearable,
          clear-icon='mdi-close-circle-outline'
        )
        v-list
          template(v-for='(item, i) in presenters')
            v-list-item(:key='item.user.name', @click='selectItem(item)')
              v-list-item-icon(small)
                v-icon(v-show='item.feedback_done', small) mdi-check
              v-list-item-content
                v-list-item-title.body-2 {{ item.user.name }}({{ item.user.name_index }})
            v-divider
  v-divider(vertical)
  v-col
    v-card(flat)
      div(v-if='!selectedPresenter')
        p.subtitle-1.text--secondary 参加者を選択してください
      div(v-else)

        v-card.my-evaluation-input(width='1000')
          v-container
            v-row.desired-rank
              v-card(width='500', color='#79736A', height='90')
                v-row
                  v-col(cols='4', sm='4', md='6')
                    v-card-text.evaluation-rank.display-1 希望ランク
                  v-col(cols='6', sm='6', md='5')
                    v-card(width="250")
                      v-card-text.display-1.text-white {{ myWantRank }}
            v-row.desiredRank
              v-card(width='1000', color='#79736A')
                v-row
                  v-card-text.evaluation-rank.display-1.text-warning 評価ランク
                    v-row.desired-rank(v-for='(item, index) in indicators')
                      v-card(width='900', color='#FAEBCD')
                        v-card-text.evaluation-rank.display-1.text-warning {{ item.name }}
                          v-row.desired-rank(v-for='(items, indexs) in item.indicatorSubcategories')
                            v-card(width='900' )
                              v-card-title {{ items.name }}
                              v-card-text
                                v-radio-group
                                  table.evaluation-rank-cade(v-if='me == primary.evaluator_id' border="3", width="750")
                                    thead
                                      tr(height="60")
                                        th(width="60") 自己評価
                                        th(width="60") 一次評価者
                                        th(width="60") 二次評価者
                                        th 評価詳細
                                    tbody(v-for='(indicaterRank, index1) in items.indicatorSubcategoryRanks')
                                      tr(height="60")
                                        th
                                          v-icon(v-if='indicaterRank.rank_id == myEvaluation.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs].indicator_subcategory_rank_id') mdi-radiobox-marked
                                        th
                                          v-radio(
                                            :input-value='indicaterRank.rank_id',
                                            @change='selectRank({ subcategoryId: items.id, rankId: indicaterRank.rank_id })'
                                          )
                                        th
                                          v-icon(v-if='indicaterRank.rank_id == secondary.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs].indicator_subcategory_rank_id') mdi-radiobox-marked
                                        th {{indicaterRank.rank.code}} &ensp; :{{ indicaterRank.description }}
                                  table.evaluation-rank-cade(v-if='me == secondary.evaluator_id' border="3", width="750")
                                    thead
                                      tr(height="60")
                                        th(width="60") 自己評価
                                        th(width="60") 一次評価者
                                        th(width="60") 二次評価者
                                        th 評価詳細
                                    tbody(v-for='(indicaterRank, index1) in items.indicatorSubcategoryRanks')
                                      tr(height="60")
                                        th
                                          v-icon(small v-if='indicaterRank.rank_id === myEvaluation.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs].indicator_subcategory_rank_id') mdi-radiobox-marked
                                        th
                                          v-icon(small v-if='indicaterRank.rank_id === primary.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs].indicator_subcategory_rank_id') mdi-radiobox-marked
                                        th
                                          v-radiov-radio(
                                            :input-value='indicaterRank.rank_id',
                                            @change='selectRank({ subcategoryId: items.id, rankId: indicaterRank.rank_id })'
                                          )
                                        th {{indicaterRank.rank.code}} &ensp; :{{ indicaterRank.description }}


            v-row.desired-rank
              v-card(width='1000', color='#79736A')
                v-row
                  v-card-title.evaluation-rank.display-1.text-warning 評価コメント
                    v-card.comment(width="840", color="#FAEBCD")
                      v-row.title
                        v-col(cols="5", sm="5", md="5")
                          v-card-title.text-warning フリーコメント
                      v-row
                        v-col.card(cols="12", sm="12", md="11")
                          v-card(width="900" )
                            v-row
                              v-spacer
                                v-col(cols="12", sm="12", md="12")
                                  v-card-title.comment-box {{ myEvaluationEvaluatorName }}
                                  v-textarea.comment-box(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="myEvaluation.comment"
                                  )
                                v-col(cols="12", sm="12", md="12" v-if='me == secondary.evaluator_id')
                                  v-card-title.comment-box 一次評価者 &ensp; {{ primaryEvaluatorName }}
                                  v-textarea.comment-box(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="primary.comment"
                                  )
                                v-col(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                  v-if="secondary !== undefined && me == primary.evaluator_id"
                                )
                                  v-card-title.comment-box 二次評価者 &ensp; {{ secondaryEvaluatorName }}
                                  v-textarea.comment-box(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="secondary.comment"
                                  )
                                v-col(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                )
                                  span#randomList.commentName(
                                    v-for="item in member",
                                    :key="item.id"
                                  )
                                    v-col(cols="12", sm="12", md="12")
                                      v-card-title.comment-box {{ item.evaluator.name }}
                                      v-textarea(
                                        disabled,
                                        width="400",
                                        background-color="grey lighten-2",
                                        v-model="item.comment"
                                      )
                                v-col(v-if='me == primary.evaluator_id')(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                )
                                  v-card-title.comment-box 一次評価者 &ensp; {{ primary.valuatorName }}
                                  v-textarea.comment-box(
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="copiedEditedItem.comment"
                                  )
                                v-col(v-if='me == secondary.evaluator_id')(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                )
                                  v-card-title.comment-box 二次評価者 &ensp; {{ secondaryEvaluatorName }}
                                  v-textarea.comment-box(
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="copiedEditedItem.comment"
                                  )
                    v-card.comment(v-for='(item, index4) in indicators', :key='item.id' width="840", color="#FAEBCD")
                      v-row.title
                        v-col(cols="5", sm="5", md="5")
                          v-card-title.text-warning {{ indicators[index4].name }}
                      v-col.card(cols="12", sm="12", md="12")
                          v-card
                            v-row
                              v-spacer
                                v-col(cols="12", sm="12", md="12")
                                  v-card-title.comment-box {{ myEvaluationEvaluatorName }}
                                  v-textarea.comment-box(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    :value="myEvaluation.indicatorCategoryEvaluationAndFeedbacks[index4].comment"
                                  )
                                v-col(cols="12", sm="12", md="12" v-if='meId == secondary.evaluator_id')
                                  v-card-title.comment-box 一次評価者 &ensp; {{ primaryEvaluatorName }}
                                  v-textarea.comment-box(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    :value="primary.indicatorCategoryEvaluationAndFeedbacks[index4].comment"
                                  )
                                v-col(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                  v-if="secondary !== undefined && meId == primary.evaluator_id"
                                )
                                  v-card-title.comment-box 二次評価者 &ensp; {{ secondaryEvaluatorName }}
                                  v-textarea.comment-box(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    :value="secondary.indicatorCategoryEvaluationAndFeedbacks[index4].comment"
                                  )
                                v-col(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                )
                                  span#randomList.commentName(
                                    v-for="item in member",
                                    :key="item.id"
                                  )
                                    v-col(cols="12", sm="12", md="12")
                                      v-card-title.comment-box {{ item.evaluator.name }}
                                      v-textarea(
                                        disabled,
                                        width="400",
                                        background-color="grey lighten-2",
                                        :value="item.indicatorCategoryEvaluationAndFeedbacks[index4].comment"
                                      )
                                v-col(v-if='me == primary.evaluator_id')(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                )
                                  v-card-title.comment-box 一次評価者 &ensp; {{ primary.valuatorName }}
                                  v-textarea.comment-box(
                                    width="400",
                                    background-color="grey lighten-2",
                                    :value='editedItem.indicatorCategoryEvaluations[index4].comment',
                                    @input='selectComments({ categoryId:item.id , comment:copiedEditedItem.indicatorCategoryEvaluations[index4].comment  })'
                                  )
                                v-col(v-if='me == secondary.evaluator_id')(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                )
                                  v-card-title.comment-box 二次評価者 &ensp; {{ secondaryEvaluatorName }}
                                  v-textarea.comment-box(
                                    width="400",
                                    background-color="grey lighten-2",
                                    :value='editedItem.indicatorCategoryEvaluations[index4].comment',
                                    @input='selectComments({ categoryId:item.id , comment:copiedEditedItem.indicatorCategoryEvaluations[index4].comment  })'
                                  )
            v-row
              v-spacer
              v-col(cols='2', sm='2', md='2')
                v-btn(color='blue darken-1', text, @click='save') 編集保存
</template>

<script>
import { mapActions, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
export default {
  data: () => ({
    dialog: false,
    profession: '',
    rankIndex: 0,
    indicatorIndex: 0,
    profItems: ['NC'],
    isFormValid: true,
    copiedEditedItem: {},
    search: '',
    selectedPresenter: '',
    meId: '',
    selectedRanks: [],
    selectedComment: [],
  }),
  computed: {
    ...mapState({
      myEvaluationEvaluatorName: (state) => state.otherEvaluationInput.myEvaluationEvaluatorName,
      professionRanks: (state) => state.otherEvaluationInput.professionRanks,
      editedItem: (state) => state.otherEvaluationInput.editedItem,
      indicators: (state) => state.otherEvaluationInput.indicators,
      message: (state) => state.otherEvaluationInput.editedItem.indicatorCategoryEvaluations,
      presenters: (state) => state.otherEvaluationInput.presenters,
      myEvaluation: (state) => state.otherEvaluationInput.myEvaluation,
      member: (state) => state.otherEvaluationInput.member,
      primary: (state) => state.otherEvaluationInput.primary,
      secondary: (state) => state.otherEvaluationInput.secondary,
      primaryEvaluatorName: (state) => state.otherEvaluationInput.primaryEvaluatorName,
      secondaryEvaluatorName: (state) => state.otherEvaluationInput.secondaryEvaluatorName,
      myWantRank: (state) => state.otherEvaluationInput.myWantRank,
      me: (state) => state.otherEvaluationInput.me.id,
    }),
  },
  mounted() {
    this.getIndicators()
    this.getPresenters()
    this.getMe()
    this.getMyWantRank()
    this.getMyEvaluationDisplay()
  },

  methods: {
    ...mapActions({
      getMyEvaluationDisplay: 'otherEvaluationInput/getMyEvaluationDisplay',
      getMyWantRank: 'otherEvaluationInput/getMyWantRank',
      getIndicators: 'otherEvaluationInput/getIndicators',
      updateMyEvaluation: 'otherEvaluationInput/updateMyEvaluation',
      getPresenters: 'otherEvaluationInput/getPresenters',
      getMe: 'otherEvaluationInput/getMe',
    }),
    updateMessage(index, event) {
      console.log(event.target.value)
      this.$store.commit('updateMessage', event.target.value, index)
    },
    close() {
      this.dialog = false
    },
    async save() {
      await this.updateMyEvaluation({
        editedItems: this.copiedEditedItem,
        selectedRanks: this.selectedRanks,
        selectedComment: this.selectedComment,
      })
    },
    async selectItem(item) {
      this.selectedPresenter = item
      await this.getMyEvaluationDisplay(item)
      this.copiedEditedItem = cloneDeep(this.editedItem)
      this.copiedSelectedFeedbacks = cloneDeep(this.selectedFeedbacks)
    },
    selectRank({ subcategoryId, rankId }) {
      const deleteIndex = this.selectedRanks.findIndex((evaluation) => evaluation.subcategoryId === subcategoryId)
      if (deleteIndex !== -1) {
        this.selectedRanks.splice(Number(deleteIndex), Number(deleteIndex + 1))
      }
      this.selectedRanks.push({ indicator_subcategory_id: subcategoryId, rank_id: rankId })
    },
    selectComments({ categoryId, comment }) {
      const deleteIndex = this.selectedComment.findIndex(
        (evaluation) => evaluation.indicator_category_id === categoryId
      )
      if (deleteIndex !== -1) {
        this.selectedComment.splice(Number(deleteIndex), Number(deleteIndex + 1))
      }
      this.selectedComment.push({ indicator_category_id: categoryId, rank_id: comment })
      console.log(this.selectedComment)
    },
  },
}
</script>

<style lang="scss">
.title {
  height: 60px;
}
.my-evaluation-input {
  width: 100vw;
  margin-left: auto;
  margin-right: auto;
}
.name {
  display: block;
  width: 80vw;
}
.desired-rank {
  padding: 20px;
  .desired-rank-code {
    margin: 0px 0px 10px 10px;
  }
}
.evaluation-rank-cade {
  text-align: center;
  margin: auto;
}
.evaluation-rank {
  color: #f7c873;
}
.comment {
  margin: 5px;
  padding: 0;
}
.radiobtn {
  display: flex;
  justify-content: center;
  align-items: center;
}
.comment-box {
  margin: 0px 5px;
  padding: 0px;
}
.card {
  margin: auto;
  text-align: left;
}
</style>
