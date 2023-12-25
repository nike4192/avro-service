<script setup lang='ts'>

import { XMarkIcon } from '@heroicons/vue/24/outline';
import { capitalize, computed, h, toRaw } from 'vue'
import { findError } from '~shared/avro/utils'
import { closureTypeGetterSetter, getErrorAttrs, getType } from '@/utils/schemas'
import { useZIndexStack } from '@/composables/zIndexStack'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import Dropdown from 'primevue/dropdown'
import { PRIMITIVE_TYPES, TYPES } from '~shared/avro/types'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'

const store = useSchemaStore();
const { selectedType } = storeToRefs(store);

const props = defineProps({
  field: Object,
  path: Array,
  errors: Array,
  removable: Boolean
});

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

const emit = defineEmits(['update:field', 'remove:field']);

const { zIndexFixEventListeners } = useZIndexStack();

function render() {
  const { field, path, errors } = props;

  if (field && path && errors) {
    const recordFieldError = findError(errors, path, 1);
    const recordFieldNameError = findError(errors, [...path, 'name']);

    const typeGetterSetter = closureTypeGetterSetter(field);

    return h('div', {
      class: 'schema-record-field',
      selected: field === selectedType.value || null,
      onClick(e) {
        if (e.target.closest('.schema-tree')) {
          selectedType.value = field;
          schemaTreeRerender.rerender();
        }
      },
      ...getErrorAttrs(recordFieldError),
      ref: (el) => {
        field.el = el
      }
    }, [
      // Name
      h('span', {
        class: 'schema-record-field-name',
        contenteditable: true,
        ...getErrorAttrs(recordFieldNameError),
        onInput(e) {
          field.name = e.target.textContent;
          schemaTreeRerender.rerender();
        },
        ...zIndexFixEventListeners('.schema-tree')
      }, field.name),
      // Type
      PRIMITIVE_TYPES.includes(field.type) || PRIMITIVE_TYPES.includes(field.type.type)
        ? h(Dropdown, {
          pt: {
            input: {
              class: 'schema-type',
              tabIndex: -1
            }
          },
          options: PRIMITIVE_TYPES.filter(t => t !== 'null'),
          disabled: !PRIMITIVE_TYPES.includes(typeGetterSetter.value),
          modelValue: typeGetterSetter.value,
          'onUpdate:modelValue': (t) => {
            typeGetterSetter.value = t
            schemaTreeRerender.rerender()
          }
        })
        : h('span', {
          class: 'schema-type'
        }, typeGetterSetter.value),
      props.removable && h('button', {
        class: 'schema-field-remove-button',
        tabIndex: -1,
        onClick(e) {
          emit('remove:field', field);
        }
      }, h(XMarkIcon, { class: 'icon' })
      )
    ])
  }
}
</script>

<template lang='pug'>
render
</template>

<style lang='stylus'>

.p-dropdown-trigger
  display none

.p-dropdown-item
  padding 4px 8px

.schema-record-field
  gap 16px
  display flex
  position relative
  justify-content space-between
  padding 4px 4px
  border-radius 16px

  &[selected="true"]
    box-shadow inset 0 0 0 2px var(--vt-c-blue)

  &[error]
    box-shadow inset 0 0 0 2px var(--vt-c-red)

  span
    display inline-block
    padding 2px 12px
    border-radius 16px

    &.schema-record-field-name
      position relative
      flex 1
      min-width 80px
      line-height 28px
      outline none

      &:focus, &:empty
        background-color var(--color-card-hover)

      &[error]
        box-shadow inset 0 0 0 2px var(--vt-c-red)

    &.schema-type
      min-width 40px
      font-family JetBrainsMono
      font-style italic
      font-weight 300
      font-size 13px
      text-align center
      line-height 24px
      vertical-align bottom
      color var(--vt-c-green-dark)
      user-select none
      outline none

  &:hover .schema-field-remove-button
    visibility visible

  .schema-field-remove-button
    padding 2px
    right -13px
    top 50%
    margin-left -13px
    margin-top -11px
    position absolute
    height 18px;
    width 18px;
    box-sizing content-box
    background-color var(--color-background-mute)
    box-shadow  0 0 0 2px var(--color-background-soft), inset 0 0 0 1px var(--vt-c-red)
    color var(--vt-c-red)
    border none
    border-radius 50%

    visibility hidden

    &:hover
      background-color var(--vt-c-red)
      color var(--color-text)
</style>