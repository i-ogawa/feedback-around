<template lang="pug">
v-row(align='center', justify='center', no-gutters)
  v-col.text-center(cols='12')
    h1.display-1.font-weight-thin.mb-4 Logging in...
    v-progress-circular(indeterminate, color='primary', :size='70', :width='10')
</template>

<script>
export default {
  layout: 'noSideBar',
  mounted() {
    this.googleAuthenticate()
  },
  methods: {
    googleAuthenticate() {
      this.$auth.loginWith('google')
    },
  },
}
</script>
