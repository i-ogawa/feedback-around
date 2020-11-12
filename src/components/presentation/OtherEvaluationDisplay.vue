<template lang="pug">
div(v-if='presenter===""')
  p 評価対象者がいません
div(v-else)
  v-row
    v-col.name(cols='6', md='6')
      v-sheet
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
  v-col.d-flex
    v-card(flat, width='100%')
      div(v-if='!selectedPresenter')
        p.subtitle-1.text--secondary 参加者を選択してください
      div(v-else)
        v-card(width="1000")
        v-container
        v-row.desired-rank
          v-card(width="500", color="#79736A")
            v-row
              v-col(cols="5", sm="5", md="6")
                v-card-text.evaluation-rank.display-1 希望ランク
              v-col(cols="5", sm="5", md="5")
                v-card(width="250")
                  v-card-text.display-1.text-white {{ myWantRank }}
        v-card.comment(width="950", color="#79736A")
          v-row
            v-col(cols="5", sm="5", md="5")
              v-card-text.evaluation-rank.display-1.text-warning 評価ランク
          v-row
            v-col(cols="12", sm="12", md="12")
              v-card.evaluation-rank-cade(width="900")
                table.evaluation-rank-cade(border="3", width="900")
                  thead
                    tr(height="60")
                      th 評価大分類
                      th 中分類
                      th 自己評価
                      th 一次評価者
                      th 二次評価者
                  tbody(v-for="(item, index) in indicators")
                    tr(height="60")
                      th(:rowspan="item.indicatorSubcategories.length") {{ item.name }}
                        v-dialog(v-model="dialog", persistent, max-width="700px")
                          template(v-slot:activator="{ on, attrs }")
                            v-icon(
                              small,
                              v-bind="attrs",
                              @click="setCommentDialog(index)"
                            ) mdi-message-text-outline
                          v-card
                            v-card-actions
                              v-spacer
                              v-btn(color="grey darken-1", text, @click="close")
                                v-icon mdi-close
                            v-card-title
                              span コメント
                              v-card-text
                              v-container
                                v-col(cols="12", sm="12", md="12")
                                  span {{ myEvaluationEvaluatorName }}
                                  v-textarea(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="myEvaluation.indicatorCategoryEvaluationAndFeedbacks[indicatorIndex].comment"
                                  )
                                v-col(cols="12", sm="12", md="12")
                                  span 一次評価者 &ensp; {{ primaryEvaluatorName }}
                                  v-textarea(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    v-model="primary.indicatorCategoryEvaluationAndFeedbacks[indicatorIndex].comment"
                                  )
                                v-col(
                                  cols="12",
                                  sm="12",
                                  md="12",
                                  v-if="secondary !== undefined"
                                )
                                  span 二次評価者 &ensp; {{ secondaryEvaluatorName }}
                                  v-textarea(
                                    disabled,
                                    width="400",
                                    background-color="grey lighten-2",
                                    :value="secondary.indicatorCategoryEvaluationAndFeedbacks[indicatorIndex].comment"
                                  )
                                v-col(cols="12", sm="12", md="12")
                                  span(v-for="members in member")
                                    span {{ members.evaluator.name }}
                                    v-textarea(
                                      disabled,
                                      width="400",
                                      background-color="grey lighten-2",
                                      v-model="members.indicatorCategoryEvaluationAndFeedbacks[indicatorIndex].comment"
                                    )
                      td {{ item.indicatorSubcategories[0].name }}
                        v-dialog(v-model="dialog", persistent, max-width="700px")
                          template(v-slot:activator="{ on, attrs }")
                            v-icon(
                              small,
                              v-bind="attrs",
                              @click="setRanksDialog(index, 0)"
                            ) mdi-equal-box
                          v-card
                            v-card-actions
                              v-spacer
                              v-btn(color="grey darken-1", text, @click="close")
                                v-icon mdi-close
                            v-card-title
                              span ランク詳細
                              v-card-text
                              v-container
                                v-col(cols="12", sm="12", md="12")
                                  span.commentName(
                                    v-for="details in indicators[indicatorIndex].indicatorSubcategories[rankIndex].indicatorSubcategoryRanks"
                                  )
                                    span {{ details.rank.code }}
                                    v-textarea(
                                      disabled,
                                      width="400",
                                      background-color="grey lighten-2",
                                      v-model="details.description"
                                    )
                      td {{ myEvaluation.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[0].rank.code }}
                      td {{ primary.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[0].rank.code }}
                      td(v-if="secondary !== undefined") {{ secondary.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[0].rank.code }}
                      td(v-else) なし
                    tr(
                      height="60",
                      v-for="(items, indexs) in item.indicatorSubcategories",
                      v-if="item.indicatorSubcategories.length > 1 && item.indicatorSubcategories[indexs + 1] !== undefined"
                    )
                      td {{ item.indicatorSubcategories[indexs + 1].name }}
                        v-icon(
                          small,
                          v-bind="attrs",
                          @click="setRanksDialog(index, indexs + 1)"
                        ) mdi-equal-box
                      td {{ myEvaluation.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs + 1].rank.code }}
                      td {{ primary.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs + 1].rank.code }}
                      td(v-if="secondary !== undefined") {{ secondary.indicatorCategoryEvaluationAndFeedbacks[index].indicatorSubcategoryEvaluations[indexs + 1].rank.code }}
                      td(v-else) なし
        v-card.comment(width="950", color="#79736A")
          v-row
            v-col(cols="5", sm="5", md="5")
              v-card-text.evaluationRank.display-1.text-warning 評価コメント
          v-row
            v-col.card(cols="12", sm="12", md="11")
              v-card(width="900")
                v-row
                  v-spacer
                  v-col(cols="12", sm="12", md="12")
                    span
                      v-col(cols="12", sm="12", md="12")
                        span {{ myEvaluationEvaluatorName }}
                        v-textarea(
                          disabled,
                          width="400",
                          background-color="grey lighten-2",
                          v-model="myEvaluation.comment"
                        )
                      v-col(cols="12", sm="12", md="12")
                        span 一次評価者 &ensp; {{ primaryEvaluatorName }}
                        v-textarea(
                          disabled,
                          width="400",
                          background-color="grey lighten-2",
                          v-model="primary.comment"
                        )
                      v-col(
                        cols="12",
                        sm="12",
                        md="12",
                        v-if="secondary !== undefined"
                      )
                        span 二次評価者 &ensp; {{ secondaryEvaluatorName }}
                        v-textarea(
                          disabled,
                          width="400",
                          background-color="grey lighten-2",
                          v-model="secondary.comment"
                        )
                    span#randomList.commentName(
                      v-for="item in member",
                      :key="item.id"
                    )
                      v-col(cols="12", sm="12", md="12")
                        span {{ item.evaluator.name }}
                        v-textarea(
                          disabled,
                          width="400",
                          background-color="grey lighten-2",
                          v-model="item.comment"
                        )
</template>
<script>
import { mapActions, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
export default {
  data: () => ({
    dialog: false,
    search: '',
    selectedPresenter: '',
    profession: '',
    rankIndex: 0,
    indicatorIndex: 0,
    professionRanks: '',
    profItems: ['NC'],
    isFormValid: true,
    copiedSelectedFeedbacks: '',
  }),
  computed: {
    ...mapState({
      myEvaluation: (state) => state.otherEvaluationDisplay.myEvaluation,
      member: (state) => state.otherEvaluationDisplay.member,
      primary: (state) => state.otherEvaluationDisplay.primary,
      secondary: (state) => state.otherEvaluationDisplay.secondary,
      myWantRank: (state) => state.otherEvaluationDisplay.myWantRank,
      indicators: (state) => state.otherEvaluationDisplay.indicators,
      myEvaluationEvaluatorName: (state) => state.otherEvaluationDisplay.myEvaluationEvaluatorName,
      primaryEvaluatorName: (state) => state.otherEvaluationDisplay.primaryEvaluatorName,
      secondaryEvaluatorName: (state) => state.otherEvaluationDisplay.secondaryEvaluatorName,
      presenters: (state) => state.otherEvaluationDisplay.presenters,
    }),
  },
  mounted() {
    this.getMyEvaluationDisplay()
    this.getMyWantRank()
    this.getMe()
    this.getIndicators()
    this.getPresenters()
    this.getSelectedFeedbacks()
    console.log(this.presenters)
  },

  methods: {
    ...mapActions({
      getMe: 'otherEvaluationDisplay/getMe',
      getMyEvaluationDisplay: 'otherEvaluationDisplay/getMyEvaluationDisplay',
      getMyWantRank: 'otherEvaluationDisplay/getMyWantRank',
      getIndicators: 'otherEvaluationDisplay/getIndicators',
      getPresenters: 'otherEvaluationDisplay/getPresenters',
      getSelectedFeedbacks: 'otherEvaluationDisplay/getSelectedFeedbacks',
    }),
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    setCommentDialog(index) {
      this.indicatorIndex = index
      this.dialog = true
    },
    setRanksDialog(indicatorIndex, index) {
      this.indicatorIndex = indicatorIndex
      this.rankIndex = index
      this.dialog = true
    },
    async selectItem(item) {
      this.selectedPresenter = item
      await this.getSelectedFeedbacks(item)
      this.copiedSelectedFeedbacks = cloneDeep(this.selectedFeedbacks)
    },
  },
}
</script>

<style lang="scss">
.desired-rank {
  padding: 20px;
  .desiredRankCode {
    margin: 0px 0px 10px 10px;
  }
}
.evaluationRankCade {
  text-align: center;
  margin: auto;
}
.evaluationRank {
  color: #f7c873;
}
.comment {
  margin: 20px;
}
.card {
  margin: auto;
  text-align: left;
}
.name {
  display: block;
  width: 80vw;
}
</style>
