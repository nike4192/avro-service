<script setup lang='ts'>

import { h, ref } from 'vue'
import { useZIndexStack } from '@/composables/zIndexStack'
import SchemaRecordField from '@/components/schemas/schema-types/SchemaRecordField.vue'
import { findError } from '~shared/avro/utils'
import { getErrorAttrs } from '@/utils/schemas'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import RecordTypeIcon from '@/components/icons/small/RecordTypeIcon.vue'
import SchemaRecordFields from '@/components/schemas/schema-types/SchemaRecordFields.vue'

const { zIndexFixEventListeners } = useZIndexStack();
const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

const store = useSchemaStore();
const { selectedType } = storeToRefs(store);

const props = defineProps({
  record: Object,
});

const emit = defineEmits(['update:record', 'remove:record']);

function render() {
  if (props.record) {
    const record = props.record;
    const { path, errors } = record;

    // console.log('render record', record);
    const schemaRecordTitleContainer = ref(null);

    const recordError = findError(errors, path);
    const recordNameError = findError(errors, [...path, 'name']);

    return (
      h('div', {
          class: 'schema-record',
          selected: record === selectedType.value || null,
          ...getErrorAttrs(recordError),
          ref: (el) => { record.el = el; }
        },
        h('div', {
            class: 'schema-record-title-container',
            ref: (el) => schemaRecordTitleContainer.value = el,
            onMousedown(e) {
              if (e.button === 0 && e.target === schemaRecordTitleContainer.value) {
                selectedType.value = record;
              }
            }
          },
          [
            h(RecordTypeIcon, { class: 'icon' }),
            h('div', {
              class: 'schema-record-name',
              spellcheck: false,
              ...getErrorAttrs(recordNameError),
              contenteditable: true,
              onInput(e) {
                record.name = e.target.textContent
                schemaTreeRerender.rerender()
              },
              ...zIndexFixEventListeners('.schema-tree')
            }, record.name)
          ]
        ),
        h(SchemaRecordFields, {
          type: record,
          removable: false,
        })
      )
    );
  }
}

</script>

<template lang='pug'>
render
</template>

<style lang='stylus'>

[error="true"][message][hovered],
[error="true"][message]:focus
  &::after
    padding 6px 12px
    position absolute
    left 0
    top calc(100% + 4px)
    width 212px
    content attr(message)
    color var(--vt-c-text-dark-2)
    background-color var(--vt-c-red)
    border-radius 16px

.schema-record
  padding 4px
  position absolute
  min-width 220px
  border-radius 24px

  &[selected="true"]
    box-shadow inset 0 0 0 2px var(--vt-c-blue)

  &[name]::before
    top -20px
    left 0
    text-align top
    content attr(name)

  &[error]
    box-shadow inset 0 0 0 2px var(--vt-c-red)

  .schema-record-title-container
    display flex
    justify-content space-between

    .icon
      position absolute
      top 12px
      left 16px
      width 16px
      z-index 100

    .schema-record-name
      margin 4px
      padding 8px 10px 8px 32px
      position relative
      border-radius 16px
      line-height 1rem
      outline none
      min-width 80px
      color: var(--color-text-half)

      &:focus
        color: var(--color-text)
        background-color var(--color-background-soft)

      &[error]
        box-shadow inset 0 0 0 2px var(--vt-c-red)
</style>