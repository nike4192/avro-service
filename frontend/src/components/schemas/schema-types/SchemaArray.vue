<script setup lang='ts'>

import { h } from 'vue'
import { useZIndexStack } from '@/composables/zIndexStack'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import ArrayTypeIcon from '@/components/icons/small/ArrayTypeIcon.vue'
import { findError } from '~shared/avro/utils'
import { getErrorAttrs } from '@/utils/schemas'
import Dropdown from 'primevue/dropdown'
import { PRIMITIVE_TYPES } from '~shared/avro/types'

const store = useSchemaStore();
const { selectedType } = storeToRefs(store);

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);
const { zIndexFixEventListeners } = useZIndexStack();

const props = defineProps({
  array: Object
});

function render() {
  if (props.array) {
    const { errors, path } = props.array;
    const arrayNameError = findError(errors, [...path, 'name']);
    const itemsError = findError(errors, [...path, 'items']);
    return h('div', {
      class: 'schema-array',
      selected: selectedType.value === props.array,
      ref: (el) => { props.array.el = el; }
    }, h('div', {
        class: 'schema-array-title-container',
        onDblclick() {
          selectedType.value = props.array;
        }
      },
      h(ArrayTypeIcon, { class: 'icon', title: 'Enum' }),
      h('div', {
        class: 'schema-array-name',
        ...getErrorAttrs(arrayNameError),
        contenteditable: true,
        onInput(e) {
          const value = e.target.textContent;
          if (value) {
            props.array.name = value;
          } else {
            delete props.array.name;
          }
          schemaTreeRerender.rerender();
        },
        ...zIndexFixEventListeners('.schema-tree')
      }, props.array.name),
      h(Dropdown, {
        pt: {
          input: {
            class: 'schema-type',
            ...getErrorAttrs(itemsError)
          }
        },
        options: PRIMITIVE_TYPES,
        modelValue: props.array.items,
        'onUpdate:modelValue': (t) => {
          props.array.items = t;
          schemaTreeRerender.rerender();
        }
      })
    ))
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
    text-align left
    content attr(message)
    color var(--vt-c-text-dark-2)
    background-color var(--vt-c-red)
    border-radius 16px

.schema-array
  margin auto
  padding 4px
  position absolute
  border-radius 24px
  width 228px
  background: var(--color-background-mute);

  &[selected="true"]
    box-shadow inset 0 0 0 2px var(--vt-c-blue)

  &[name]::before
    top -20px
    left 0
    text-align top
    content attr(name)

  &[error]
    box-shadow inset 0 0 0 2px var(--vt-c-red)

  .schema-array-title-container
    display flex
    justify-content space-between

    .icon
      position absolute
      top 12px
      left 16px
      width 16px
      z-index 100

    .schema-array-name
      margin 4px
      padding 8px 10px 8px 32px
      position relative
      border-radius 16px
      line-height 1rem
      outline none
      min-width 80px
      color: var(--color-text-half)

      &:empty
        background-color var(--color-background-soft)

      &:focus
        color: var(--color-text)
        background-color var(--color-background-soft)

      &[error]
        box-shadow inset 0 0 0 2px var(--vt-c-red)

    .schema-type
      margin 4px
      display: inline-block;
      padding: 2px 12px;
      border-radius: 16px;
      font-style: italic;
      color: var(--vt-c-green-dark);
      user-select: none;
      outline: none;

      &:hover, &[aria-expanded='true']
        background-color var(--color-background-soft)
</style>