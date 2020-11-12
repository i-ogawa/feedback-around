<template lang="pug">
div
  v-row(justify='center')
    v-col(cols='12')
      h1 {{ presentation.name }}
      PresentationTabs
</template>

<script>
import { mapActions, mapState } from 'vuex'
import PresentationTabs from '~/components/presentation/PresentationTabs.vue'

export default {
  components: {
    PresentationTabs,
  },
  data: () => ({}),
  computed: {
    ...mapState('presentationTabs', ['presentation']),
    ...mapState('snackbar', ['isErr']),
  },
  mounted() {
    this.getPresentation(this.$route.params.id)
  },
  methods: {
    ...mapActions('presentationTabs', ['getPresentation']),
  },
}
</script>
