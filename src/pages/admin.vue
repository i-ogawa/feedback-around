<template lang="pug">
div
  v-row(justify='center')
    v-col(v-if='me.is_admin', cols='11')
      AdminTabs
    v-col(v-else, cols='11')
      p 管理者権限がありません
</template>

<script>
import { mapActions, mapState } from 'vuex'
import AdminTabs from '~/components/admin/AdminTabs.vue'

export default {
  components: {
    AdminTabs,
  },
  computed: {
    ...mapState('me', ['me']),
  },
  async mounted() {
    await this.getMe()
    if (!this.me.is_admin) {
      location.href = '/'
    }
  },
  methods: {
    ...mapActions('me', ['getMe']),
  },
}
</script>
