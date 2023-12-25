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

const store = useSchemaStore();
const { selectedType } = storeToRefs(store);

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);
const { zIndexFixEventListeners } = useZIndexStack();

const props = defineProps({
  enum: Object
});

function render() {
  if (props.enum) {
    const { path, errors } = props.enum;
    const enumError = findError(errors, path, 1);

    const schemaEnumTitleContainerRef = ref();
    return h('div', {
      class: 'schema-enum',
      selected: selectedType.value === props.enum,
      ...getErrorAttrs(enumError),
      ref: (el) => { props.enum.el = el; }
    }, h('div', {
        class: 'schema-enum-title-container',
        ref: (el) => schemaEnumTitleContainerRef.value = el,
        onMousedown(e) {
          if (e.button === 0 && e.target === schemaEnumTitleContainerRef.value) {
            selectedType.value = props.enum;
          }
        }
      },
      h(EnumTypeIcon, { class: 'icon', title: 'Enum' }),
      h('div', {
        class: 'schema-enum-name',
        contenteditable: true,
        onInput(e) {
          props.enum.name = e.target.textContent;
          schemaTreeRerender.rerender();
        },
        ...zIndexFixEventListeners('.schema-tree')
      }, props.enum.name)
    ), h('div', {
      class: 'schema-enum-symbols'
    }, props.enum.symbols.map((symbol, i) => {
      const symbolError = findError(props.enum.errors, [...props.enum.path, 'symbols', i]);
      return h('div', {
        class: 'schema-enum-symbol',
        ...getErrorAttrs(symbolError),
        ...zIndexFixEventListeners('.schema-tree')
      }, symbol)
    })))
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

.schema-enum
  margin auto
  padding 4px
  position absolute
  width 220px
  border-radius 22px 22px 26px 26px

  &[selected="true"]
    box-shadow inset 0 0 0 2px var(--vt-c-blue)

  &[name]::before
    top -20px
    left 0
    text-align top
    content attr(name)

  &[error]
    box-shadow inset 0 0 0 2px var(--vt-c-red)

  .schema-enum-title-container
    display flex
    justify-content space-between
    padding-bottom 2px

    .icon
      position absolute
      top 12px
      left 16px
      width 16px
      z-index 100

    .schema-enum-name
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

  .schema-enum-symbols
    padding 8px 4px 0 8px
    position relative
    min-height calc(1rem + 20px)
    box-sizing content-box
    background-color var(--color-background-mute)
    border-radius 22px

    .schema-enum-symbol
      display inline-block
      margin 0 8px 8px 0
      padding 6px 12px
      min-width 20px
      border-radius 16px
      line-height 1rem
      justify-content center
      text-align center
      background-color var(--color-background-soft)

      &[error]
        box-shadow inset 0 0 0 2px var(--vt-c-red)
</style>