<template lang="pug">
.div
  v-row(justify='end', no-gutters)
    v-col(cols='7', md='4')
      v-img(contain, width='100%', height='80', src='/logo_transparent_small_half.png')
  v-tabs(background-color='sub', color='secondary', grow, fixed)
    v-tab 評価参照
    v-tab 自己評価入力
    v-tab 評価者評価入力
    v-tab フィードバック入力

    //-自己評価参照
    v-tab-item
      v-row(justify='center')
        div(v-if='presentation.status !== AFTER_PUBLISHING')
          p 対象期間ではありせん
        div(v-else)
          MyEvaluationDisplay

    //-自己評価入力
    v-tab-item
      v-row(justify='center')
        div(v-if='presentation.status !== BETWEEN_ENTERING_AND_PUBLISHING')
          p 対象期間ではありません
        div(v-else)
          MyEvaluationInput

    //-評価者評価入力
    v-tab-item
      v-row(justify='center')
        OtherEvaluationInput

    //-フィードバック入力
    v-tab-item
      v-row(justify='center')
        Feedbacks
</template>

<script>
import { mapState } from 'vuex'
import consts from '../../const/const.js'
import MyEvaluationDisplay from './MyEvaluationDisplay.vue'
import MyEvaluationInput from './MyEvaluationInput.vue'
import OtherEvaluationDisplay from './OtherEvaluationDisplay.vue'
import OtherEvaluationInput from './OtherEvaluationInput.vue'
import Feedbacks from './Feedbacks.vue'

export default {
  components: {
    MyEvaluationDisplay,
    MyEvaluationInput,
    OtherEvaluationDisplay,
    OtherEvaluationInput,
    Feedbacks,
  },
  data: () => ({
    BETWEEN_ENTERING_AND_PUBLISHING: consts.BETWEEN_ENTERING_AND_PUBLISHING,
    AFTER_PUBLISHING: consts.AFTER_PUBLISHING,
  }),
  computed: {
    ...mapState({
      presentation: (state) => state.presentationTabs.presentation,
    }),
  },
}
</script>

<style>
/*
タブ幅が溢れると左右のスクロールバーが出てくるためOFFにする
scopedにすると効かなくなるのでグローバルにする
https://github.com/vuetifyjs/vuetify/issues/8875
*/
.v-slide-group__prev {
  display: none !important;
}
</style>
