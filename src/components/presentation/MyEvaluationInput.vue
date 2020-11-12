<template lang="pug">
div(v-if="editedItem===''")
  p プレゼンターではありません
div(v-else)
  v-card.my-evaluation-input(width='1000')
    v-container
      v-row.desired-rank
        v-card(width='500', color='#79736A', height='90')
          v-row
            v-col(cols='4', sm='4', md='6')
              v-card-text.evaluation-rank.display-1 希望ランク
            v-col(cols='6', sm='6', md='5')
              v-autocomplete(
                v-model='copiedEditedItem.want_rank_id',
                :items='professionRanks',
                :label='editedItem.want_rank_id',
                color='white',
                solo
              )
      v-row.desired-rank
        v-card(width='1000', color='#79736A')
          v-row
            v-card-text.evaluation-rank.display-1.text-warning 評価ランク
              v-row.desired-rank(v-for='(item, index) in indicators')
                v-card(width='900', color='#FAEBCD')
                  v-card-text.evaluation-rank.display-1.text-warning {{ item.name }}
                    v-row.desired-rank(v-for='(items, indexs) in item.indicatorSubcategories')
                      v-card(width='900')
                        v-card-title {{ items.name }}
                        v-card-text
                          v-radio-group
                            v-row(v-for='(indicaterRank, index1) in items.indicatorSubcategoryRanks')
                              v-col(cols='2', sm='2', md='2')
                                v-radio(
                                  :label='indicaterRank.rank.code',
                                  :input-value='indicaterRank.rank_id',
                                  @change='selectRank({ subcategoryId: items.id, rankId: indicaterRank.rank_id })'
                                )
                              v-col(cols='10', sm='10', md='10')
                                div 【 {{ indicaterRank.description }} 】

      v-row.desired-rank
        v-card(width='1000', color='#79736A')
          v-row
            v-card-text.evaluation-rank.display-1.text-warning 評価コメント
              v-col(cols='12', sm='12', md='12')
                span
                  v-col(cols='12', sm='12', md='12')
                    v-card(width='900')
                      v-row
                      v-spacer
                        v-card-title.comment フリーコメント
                        v-col
                          v-textarea.comment(
                            width='400',
                            background-color='grey lighten-2',
                            v-model='copiedEditedItem.comment'
                          )
                      v-row
                      v-spacer(v-for='(item, index4) in indicators', :key='item.id')
                        v-card-title.comment {{ indicators[index4].name }}
                        v-col
                          v-textarea.comment(
                            width='400',
                            background-color='grey lighten-2',
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
    selectedRanks: [],
    selectedComment: [],
  }),
  computed: {
    ...mapState({
      myEvaluationEvaluatorName: (state) => state.myEvaluationInput.myEvaluationEvaluatorName,
      professionRanks: (state) => state.myEvaluationInput.professionRanks,
      editedItem: (state) => state.myEvaluationInput.editedItem,
      indicators: (state) => state.myEvaluationInput.indicators,
      message: (state) => state.myEvaluationInput.editedItem.indicatorCategoryEvaluations,
    }),
  },
  async mounted() {
    await this.getMyEvaluationDisplay()
    await this.getIndicators()
    this.copiedEditedItem = cloneDeep(this.editedItem)
  },

  methods: {
    ...mapActions({
      getMyEvaluationDisplay: 'myEvaluationInput/getMyEvaluationDisplay',
      getMyWantRank: 'myEvaluationInput/getMyWantRank',
      getIndicators: 'myEvaluationInput/getIndicators',
      updateMyEvaluation: 'myEvaluationInput/updateMyEvaluation',
    }),
    updateMessage(index, event) {
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
.radio {
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #333333;
}
.card {
  margin: auto;
  text-align: left;
}
</style>
