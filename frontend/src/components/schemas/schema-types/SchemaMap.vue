<script setup lang='ts'>

import { h } from 'vue'
import { useZIndexStack } from '@/composables/zIndexStack'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import EnumTypeIcon from '@/components/icons/small/EnumTypeIcon.vue'
import { findError } from '~shared/avro/utils'
import { closureTypeGetterSetter, getErrorAttrs } from '@/utils/schemas'
import FixedTypeIcon from '@/components/icons/small/FixedTypeIcon.vue'
import InputNumber from 'primevue/inputnumber'
import MapTypeIcon from '@/components/icons/small/MapTypeIcon.vue'
import Dropdown from 'primevue/dropdown'
import { PRIMITIVE_TYPES, TYPES } from '~shared/avro/types'

const store = useSchemaStore();
const { selectedType } = storeToRefs(store);

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);
const { zIndexFixEventListeners } = useZIndexStack();

const props = defineProps({
  map: Object
});

function render() {
  if (props.map) {
    const { errors, path } = props.map;
    const mapNameError = findError(errors, [...path, 'name']);
    const valuesError = findError(errors, [...path, 'values']);
    return h('div', {
      class: 'schema-map',
      selected: selectedType.value === props.map,
      ref: (el) => { props.map.el = el; }
    }, h('div', {
        class: 'schema-map-title-container',
        onMousedown(e) {
          if (e.button === 0) {
            selectedType.value = props.map;
          }
        }
      },
      h(MapTypeIcon, { class: 'icon', title: 'Enum' }),
      h('div', {
        class: 'schema-map-name',
        ...getErrorAttrs(mapNameError),
        contenteditable: true,
        onInput(e) {
          const value = e.target.textContent;
          if (value) {
            props.map.name = value;
          } else {
            delete props.map.name;
          }
          schemaTreeRerender.rerender();
        },
        ...zIndexFixEventListeners('.schema-tree')
      }, props.map.name),
      h(Dropdown, {
        pt: {
          input: {
            class: 'schema-type',
            ...getErrorAttrs(valuesError)
          }
        },
        options: PRIMITIVE_TYPES,
        modelValue: props.map.values,
        'onUpdate:modelValue': (t) => {
          props.map.values = t;
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

.schema-map
  margin auto
  padding 4px
  position absolute
  border-radius 24px
  width 238px
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

  .schema-map-title-container
    display flex
    justify-content space-between

    .icon
      position absolute
      top 12px
      left 16px
      width 16px
      z-index 100

    .schema-map-name
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
      font-style italic
      color var(--vt-c-green-dark)
      font-family JetBrainsMono
      font-weight 300
      font-size 13px
      line-height 28px
      vertical-align bottom
      user-select none
      outline none
      margin 4px
      display: inline-block;
      padding: 2px 12px;
      border-radius: 16px;

      &:hover, &[aria-expanded='true']
        background-color var(--color-background-soft)
</style>