<script setup lang='ts'>

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { COMPLEX_TYPES, PRIMITIVE_TYPES, Type } from '~shared/avro/types'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { watch } from 'vue'
import { closureTypeGetterSetter } from '@/utils/schemas'

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree)

const props = defineProps({
  type: Object
});

let typeGetterSetter = null;

function setSchemaType(value) {
  if (props.type?.type?.logicalType) {
    props.type.type.type = value;
  } else {
    props.type.type = value;
  }
  console.log(value);
}

watch(props.type, () => {
  typeGetterSetter = closureTypeGetterSetter(props.type);
}, {
  immediate: true
});

</script>

<template lang='pug'>
.inspector-row
  .row-title Name
  .row-container.flex-row.schema-name-container
    // rerender for show errors in SchemaTree
    InputText.schema-name(
      type='text'
      v-model='type.name'
      @input='schemaTreeRerender.rerender'
    )
    template(v-if='type.type && (PRIMITIVE_TYPES.includes(type.type) || PRIMITIVE_TYPES.includes(type.type.type))')
      Dropdown(
        :pt="{ input: { class: 'schema-type' }}"
        :model-value='Type.getType(type.type)',
        @update:model-value='setSchemaType'
        :options='PRIMITIVE_TYPES.filter(t => t !== "null")'
      )
    template(v-else)
      span.schema-type {{ Type.getType(type.type) }}
</template>

<style lang='stylus'>
.schema-name-container
  gap 8px

  .schema-name
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