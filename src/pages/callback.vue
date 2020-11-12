<template lang="pug">
v-row(align='center', justify='center', no-gutters)
  v-col.text-center(cols='12')
    h1.display-1.font-weight-thin.mb-4 Calling back...
    v-progress-circular(indeterminate, color='primary', :size='70', :width='10')
</template>

<script>
export default {
  layout: 'noSideBar',
}
</script>
