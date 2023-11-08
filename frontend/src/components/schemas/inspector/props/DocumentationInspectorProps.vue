<script setup lang='ts'>

import Textarea from 'primevue/textarea'

const props = defineProps({
  type: Object
});

</script>

<template lang='pug'>
.inspector-row
  .row-title Documentation
  .row-container
    Textarea(v-model='type.doc' auto-resize rows='5')
</template>

<style scoped lang='stylus'>

</style>