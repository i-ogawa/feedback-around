<template lang="pug">
div
  v-snackbar(:value='isShow', :color='color', :timeout='snackTimeout')
    span
      v-icon.mr-3 {{ this.icon }}
    span {{ this.message }}
    template(v-slot:action='{ attrs }')
      v-btn(color='white', text, small, v-bind='attrs', @click.stop='$emit("close")')
        v-icon(small) mdi-window-close
</template>

<script>
export default {
  props: {
    isShow: Boolean,
    message: {
      type: String,
      required: false,
      default: '',
    },
  },
  data: () => ({
    snackTimeout: -1,
    color: 'error',
    icon: 'mdi-alert-circle',
  }),
}
</script>
