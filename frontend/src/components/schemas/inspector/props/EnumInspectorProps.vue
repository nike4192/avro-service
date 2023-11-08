<script setup lang='ts'>

import Chips from 'primevue/chips'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { onUpdated } from 'vue'

const props = defineProps({
  type: Object
});

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

onUpdated(() => console.log(props.type));

</script>

<template lang='pug'>
.inspector-row
  .row-title Symbols
  .row-container.enum-symbols
    Chips(
      v-model='type.symbols'
      @update:modelValue='schemaTreeRerender.rerender'
      separator=','
    )
</template>

<style lang='stylus'>
.enum-symbols
  .p-chips
    flex 1

    .p-inputtext
      flex 1

    .p-chips-token
      margin 0 8px 8px 0
      padding 6px 6px 6px 12px
      border-radius 16px
      line-height 1rem
      justify-content center
      background-color var(--color-background-mute)

    .p-chips-token-label
      margin-right 8px

    &.p-disabled
      .p-chips-token
        padding 6px 12px
        min-width 40px

        .p-chips-token-label
          margin-right 0

      .p-chips-token-icon
        display none

    .p-chips-input-token
      width 100%
</style>