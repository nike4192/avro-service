<script setup lang='ts'>

import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { ref, watch } from 'vue'
import { closureTypeGetterSetter } from '@/utils/schemas'
import { COMPLEX_TYPES, PRIMITIVE_TYPES, Type, TYPES } from '~shared/avro/types'
import SchemaRecordFields from '@/components/schemas/schema-types/SchemaRecordFields.vue'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'

const props = defineProps({
  type: Object
});

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

const groupedTypes = ref([
  {
    label: 'Complex Types',
    types: COMPLEX_TYPES
      .map(t => ({ label: t, value: t }))
  },
  {
    label: 'Primitive Types',
    types: PRIMITIVE_TYPES
      .filter(t => t !== 'null')
      .map(t => ({ label: t, value: t }))
  }
]);

const fieldDropdownRef = ref(null);
const tempFieldName = ref('');
const tempFieldNameRef = ref(null);

watch(tempFieldNameRef, () => {
  if (tempFieldNameRef.value) {
    tempFieldNameRef.value.focus();
  }
});

function onSchemaFieldAddType(type, name) {
  const record = props.type;
  record.fields.push(Type.createType(type, name));
  tempFieldName.value = '';
  schemaTreeRerender.rerender();
}

function onTempFieldNameKeydown(e) {
  if (e.key === 'Enter' || (e.key === 'Tab') && !e.shiftKey) {
    e.preventDefault();
    if (fieldDropdownRef.value) {
      fieldDropdownRef.value.focus();
    }
  }
}

function onDropdownKeydown(e) {
  if(e.key === 'Tab' && e.shiftKey) {
    e.preventDefault();
    if (tempFieldNameRef.value) {
      tempFieldNameRef.value.focus();
    }
  }
}

let typeGetterSetter = null;

watch(props.type, () => {
  typeGetterSetter = closureTypeGetterSetter(props.type);
}, {
  immediate: true
});

</script>

<template lang='pug'>
.inspector-row
  .row-title Fields
  .row-container
    SchemaRecordFields(:type='type', :removable='true')
    .schema-field-add-button
      Dropdown(
        v-model='typeGetterSetter',
        option-label='label',
        option-group-label='label'
        option-group-children='types'
        :options='groupedTypes'
        :pt='{ input: { ref: (el) => fieldDropdownRef = el, onKeydown: onDropdownKeydown } }'
        @update:modelValue='({ value }) => onSchemaFieldAddType(value, tempFieldName)'
      )
        template(#header)
          InputText(
            v-model='tempFieldName',
            :pt='{ root: { ref: (el) => tempFieldNameRef = el, onKeydown: onTempFieldNameKeydown } }'
          )
        template(#value)
          PlusIcon.icon
</template>

<style lang='stylus'>
.p-dropdown-panel
  display flex
  flex-direction column
  background-color var(--color-background-mute)
  border-radius 20px

  .p-inputtext
    margin 8px
    flex 1
    background-color var(--color-background-soft)
    padding 4px 12px
    border none
    border-radius 16px
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      sans-serif;
    color var(--color-text)
    outline none

    &:focus
      background-color var(--color-card-hover)

  .p-dropdown-items
    width 320px
    padding 0 8px

  .p-dropdown-item.p-focus
    background-color var(--color-card-hover) !important

  .p-dropdown-item-group
    font-weight 500
    padding 4px

  .p-dropdown-item
    display inline-block
    margin 8px 8px 0 0
    padding 6px 12px 6px 12px
    background-color var(--color-background-soft)
    border-radius 16px
    line-height 1rem
    justify-content center
</style>