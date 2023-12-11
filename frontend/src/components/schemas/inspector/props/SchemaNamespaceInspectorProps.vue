<script setup lang='ts'>

import InputText from 'primevue/inputtext'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { ref, useAttrs, watch } from 'vue'
import { getErrorAttrs } from '@/utils/schemas'
import { findError } from '~shared/avro/utils'

const attrs = useAttrs()
const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree)

const props = defineProps({
  type: Object
});

const errorAttrs = ref({});

watch(props, () => {
  const { errors, path } = props.type;
  const namespaceError = findError(errors, [...path, 'namespace']);
  errorAttrs.value = getErrorAttrs(namespaceError);
})

</script>

<template lang='pug'>
.inspector-row
  .row-title Namespace
  .row-container.schema-namespace-container(
    :error='errorAttrs.error'
    :message='errorAttrs.message'
    )
    InputText.schema-namespace(
      type='text'
      spellcheck="false"
      v-model='type.namespace'
      @input='schemaTreeRerender.rerender'
    )
</template>

<style lang='stylus'>
.schema-namespace-container
  padding 2px
  border-radius 18px
  gap 8px

  &[error]
    box-shadow inset 0 0 0 2px var(--vt-c-red)

  .schema-namespace
    flex 1

  .schema-type
    font-style italic
    color var(--vt-c-green-dark)
    font-family JetBrainsMono
    font-weight 300
    font-size 13px
    line-height 21px
    vertical-align bottom
    user-select none
    outline none
    display: inline-block;
    padding: 6px 12px;
    border-radius: 16px;

    &.p-dropdown-label
      &:hover, &[aria-expanded='true']
        background-color var(--color-background-mute)
</style>