<template lang="pug">
v-row.pa-4
  v-col(cols='12', md='4')
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
      template(v-for='(item, i) in filteredPresenters')
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
        v-card-text
          h4.title.mb-2 {{ selectedPresenter.user.name }}({{ selectedPresenter.user.name_index }})
        v-divider
        .mr-4.ml-4(v-for='(feedback, k) in copiedSelectedFeedbacks.feedbacks', :key='k')
          v-row.a1text-left(tag='v-card-text')
            v-col(tag='strong', cols='12') {{ feedback.indicator_category_name }}
            v-textarea.body-2(
              background-color='grey lighten-2',
              rows='7',
              v-model='feedback.comment',
              :disabled='presentation.status !== BETWEEN_ENTERING_AND_PUBLISHING'
            )
        .mr-4.ml-4
          v-row.a1text-left(tag='v-card-text')
            v-col(tag='strong', cols='12') コメント
            v-textarea.body-2(
              background-color='grey lighten-2',
              rows='7',
              v-model='copiedSelectedFeedbacks.comment',
              :disabled='presentation.status !== BETWEEN_ENTERING_AND_PUBLISHING'
            )
        div
          v-row(justify='end')
            v-card-actions.mr-10
              v-btn(
                v-show='presentation.status === BETWEEN_ENTERING_AND_PUBLISHING',
                color='blue darken-1',
                text,
                @click='saveFeedbacks()'
              ) 編集保存
</template>

<script>
import { mapActions, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import consts from '../../const/const.js'

export default {
  data: () => ({
    BETWEEN_ENTERING_AND_PUBLISHING: consts.BETWEEN_ENTERING_AND_PUBLISHING,
    search: '',
    searchPresenter: [],
    selectedPresenter: '',
    copiedSelectedFeedbacks: [],
  }),

  computed: {
    filteredPresenters() {
      return this.searchPresenter.filter((presenter) => {
        return presenter.user.name.match(this.search) || presenter.user.name_index.match(this.search)
      })
    },
    ...mapState('feedbacks', ['presenters', 'selectedFeedbacks']),
    ...mapState('presentationTabs', ['presentation']),
  },

  async mounted() {
    await this.getPresenters()
    await this.getIndicatorCategories()
    await this.getFeedbacks()
    setTimeout(() => (this.searchPresenter = this.presenters))
  },
  methods: {
    ...mapActions('feedbacks', [
      'getPresenters',
      'getFeedbacks',
      'getSelectedFeedbacks',
      'updateFeedbacks',
      'getIndicatorCategories',
    ]),
    async selectItem(item) {
      this.selectedPresenter = item
      await this.getSelectedFeedbacks(item)
      this.copiedSelectedFeedbacks = cloneDeep(this.selectedFeedbacks)
    },
    async saveFeedbacks() {
      this.updateFeedbacks(this.copiedSelectedFeedbacks)
      this.getPresenters()
      await this.getFeedbacks()
    },
  },
}
</script>
