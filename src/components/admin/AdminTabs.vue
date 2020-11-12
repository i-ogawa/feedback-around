<template lang="pug">
.div
  v-card(flat)
    v-card-text
      p.display-1.text--primary 管理者設定({{ title }})

  v-tabs(background-color='white', color='primary', left)
    v-tab(@click='changeTitle("ユーザ")') ユーザ
    v-tab(@click='changeTitle("職種")') 職種
    v-tab(@click='changeTitle("ランク")') ランク
    v-tab(@click='changeTitle("評価")') 評価
    v-tab(@click='changeTitle("プレゼンテーション")') プレゼンテーション

    v-tab-item
      Users
    v-tab-item
      Professions
    v-tab-item
      Ranks
    v-tab-item
      Evaluations
    v-tab-item
      Presentations
</template>

<script>
import { mapActions } from 'vuex'
import Users from './Users.vue'
import Professions from './Professions.vue'
import Ranks from './Ranks.vue'
import Evaluations from './Evaluations.vue'
import Presentations from './Presentations.vue'

export default {
  components: {
    Professions,
    Ranks,
    Evaluations,
    Presentations,
    Users,
  },
  data: () => {
    return {
      title: 'ユーザ', // 初期値は一番左のタブ名を設定する
    }
  },
  mounted() {
    this.getRankSelectOptions()
    this.getProfessionSelectOptions()
    this.getUserSelectOptions()
  },
  methods: {
    ...mapActions('ranks', ['getRankSelectOptions']),
    ...mapActions('users', ['getUserSelectOptions']),
    ...mapActions('professions', ['getProfessionSelectOptions']),
    changeTitle(title) {
      this.title = title
    },
  },
}
</script>
