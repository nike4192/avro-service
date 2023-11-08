<script setup lang='ts'>

import { h, ref } from 'vue'
import { useZIndexStack } from '@/composables/zIndexStack'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import EnumTypeIcon from '@/components/icons/small/EnumTypeIcon.vue'
import { findError } from '~shared/avro/utils'
import { getErrorAttrs } from '@/utils/schemas'
import FixedTypeIcon from '@/components/icons/small/FixedTypeIcon.vue'
import InputNumber from 'primevue/inputnumber'

const store = useSchemaStore();
const { selectedType } = storeToRefs(store);

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);
const { zIndexFixEventListeners } = useZIndexStack();

const props = defineProps({
  fixed: Object
});

function render() {
  if (props.fixed) {
    const { errors, path } = props.fixed;
    const fixedNameError = findError(errors, [...path, 'name']);

    return h('div', {
      class: 'schema-fixed',
      selected: selectedType.value === props.fixed,
      ref: (el) => { props.fixed.el = el; },
    }, h('div', {
        class: 'schema-fixed-title-container',
        onMousedown(e) {
          if (e.button === 0) {
            selectedType.value = props.fixed;
          }
        }
      },
      h(FixedTypeIcon, { class: 'icon', title: 'Enum' }),
      h('div', {
        class: 'schema-fixed-name',
        ...getErrorAttrs(fixedNameError),
        contenteditable: true,
        onInput(e) {
          props.fixed.name = e.target.textContent;
          schemaTreeRerender.rerender();
        },
        ...zIndexFixEventListeners('.schema-tree')
      }, props.fixed.name),
      h(InputNumber, {
        pt: {
          input: { class: 'schema-fixed-size' }
        },
        min: 0,
        modelValue: props.fixed.size,
        'onUpdate:modelValue': (value) => {
          console.log(value);
          props.fixed.size = value;
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

.schema-fixed
  margin auto
  padding 4px
  position absolute
  min-width 220px
  border-radius 24px
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

  .schema-fixed-title-container
    display flex
    justify-content space-between
    gap 10px

    .icon
      position absolute
      top 12px
      left 16px
      width 16px
      z-index 100

    .schema-fixed-name
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

    .schema-fixed-size
      margin 4px
      padding 8px 10px 8px 10px
      position relative
      border-radius 16px
      line-height 16px
      outline none
      border none
      width 90px
      text-align right
      background-color transparent
      color: var(--color-text-half)

      &:focus
        color: var(--color-text)
        background-color var(--color-background-soft)

      &[error]
        box-shadow inset 0 0 0 2px var(--vt-c-red)
</style>