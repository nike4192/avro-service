<script setup lang='ts'>

import Textarea from 'primevue/textarea'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { ref, toRaw, watch } from 'vue'
import { findError } from '~shared/avro/utils'
import { getErrorAttrs } from '@/utils/schemas'

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

const props = defineProps({
  type: Object
});

const errorAttrs = ref({});

watch(props.type, () => {
  const { errors, path } = props.type;
  if (errors && path) {
    const namespaceError = findError(errors, [...path, 'doc']);
    errorAttrs.value = getErrorAttrs(namespaceError);
  }
}, {
  immediate: true,
})

</script>

<template lang='pug'>
.inspector-row
  .row-title Documentation
  .row-container.doc-field(
    :error='errorAttrs.error'
    :message='errorAttrs.message'
  )
    Textarea(
      v-model='type.doc'
      @update:model-value='schemaTreeRerender.rerender'
      auto-resize
      rows='5'
    )
</template>

<style lang='stylus'>
.row-container.doc-field
  &[error] .p-inputtextarea
    box-shadow inset 0 0 0 2px var(--vt-c-red)
</style>