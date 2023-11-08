<script setup lang='ts'>

import { h, toRaw } from 'vue'
import SchemaRecordField from '@/components/schemas/schema-types/SchemaRecordField.vue'
import { removeRecord } from '@/utils/schemas'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'

const props = defineProps({
  type: Object,
  removable: Boolean,
});

const store = useSchemaStore();
const { selectedVersion } = storeToRefs(store);

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

function render() {
  if (props.type && props.type.type === 'record') {
    const record = props.type;
    const { path, errors } = record;

    return h('div', {
      class: 'schema-record-fields'
    }, record.fields.filter(v => v).map((field, j) => {
      const fieldPath = [...path, 'fields', j]

      return h(SchemaRecordField, {
        field: field,
        path: fieldPath,
        errors: errors,
        removable: props.removable,
        'onUpdate:field': () => schemaTreeRerender.rerender(),
        'onRemove:field': (field) => {
          const indexOf = record.fields.indexOf(field)
          if (indexOf !== -1) {
            record.fields.splice(indexOf, 1)
            if (record.fields.length === 0 && selectedVersion.value) {
              removeRecord(toRaw(selectedVersion.value.schema), toRaw(record));
            }
            schemaTreeRerender.rerender();
          }
        }
      })
    }))
  }
}

</script>

<template lang='pug'>
render
</template>

<style lang='stylus'>
.schema-record-fields
  position relative
  display flex
  flex-direction column
  width 100%
  background-color var(--color-background-mute)
  border-radius 20px

  &:not(:empty)
    margin-top 2px

  .schema-record-field
    background-color var(--color-background-mute)
    border-radius 20px

    .schema-record-name
      padding 4px 12px
      border-radius 16px

    .schema-type
      min-width 40px
      font-style italic
      display inline-block
      box-sizing content-box
      color var(--vt-c-green-dark)
      font-family JetBrainsMono
      font-weight 300
      font-size 13px
      line-height 28px
      text-align center
      vertical-align bottom
      user-select none
      outline none

.schema-field-add-button
  margin 8px auto 0 auto
  box-sizing content-box
  border none
  border-radius 20px

  .p-dropdown
    float left
    background-color transparent

  .p-dropdown-label
    opacity 1
    display flex
    justify-content center
    padding 4px 12px
    min-width 100px
    border-radius 16px
    background-color var(--color-background-mute)
    outline none

    .icon
      width 24px

    &:focus
      box-shadow inset 0 0 0 1px var(--vt-c-green)

      .icon
        color var(--vt-c-green)
</style>