<script setup lang='ts'>

import Dropdown from 'primevue/dropdown'
import { COMPLEX_TYPES, PRIMITIVE_TYPES, Type, TYPE_NAMES } from '~shared/avro/types'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import { computed, ref, watch } from 'vue'
import { closureTypeGetterSetter, getType } from '@/utils/schemas'
import UnionInspectorProps from '@/components/schemas/inspector/props/UnionInspectorProps.vue'

const props = defineProps({
  type: Object
});

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

function onTypeSelected(type, { value }) {
  console.log(type, value);
  type.items = Type.createType(value).type;
  schemaTreeRerender.rerender();
}

let typeGetterSetter = null;

const fieldDropdownRef = ref(null);
const tempFieldNameRef = ref(null);

const groupedTypes = ref([
  {
    label: 'Complex Types',
    types: COMPLEX_TYPES
      .map(t => ({ label: t, value: t }))
  },
  {
    label: 'Primitive Types',
    types: PRIMITIVE_TYPES
      .map(t => ({ label: t, value: t }))
  }
]);

function onDropdownKeydown(e) {
  if(e.key === 'Tab' && e.shiftKey) {
    e.preventDefault();
    if (tempFieldNameRef.value) {
      tempFieldNameRef.value.focus();
    }
  }
}

function unwrapArray(type) {
  const types = [];
  (function recursiveUnwrap(type) {
    const typeName = Type.getType(type);
    types.push(type);
    if (typeName === 'array') {
      recursiveUnwrap(type.items);
    }
  })(type);

  console.log('unwrapArray', types);

  return types;
}

const unwrappedArray = computed(() => unwrapArray(props.type));
const lastUnwrappedArrayType = computed(() => unwrappedArray.value[unwrappedArray.value.length - 1]);

watch(props.type, () => {
  typeGetterSetter = closureTypeGetterSetter(props.type.items);
  console.log(unwrapArray[unwrapArray.length - 1]);
}, {
  immediate: true
});

</script>

<template lang='pug'>
.inspector-row
  .row-title Items
  .row-container
    .array-type
      Dropdown(
        v-for='(t, i) in unwrappedArray.slice(1)'
        :model-value='{ label: Type.getType(t), value: Type.getType(t)}'
        option-label='label',
        option-group-label='label'
        option-group-children='types'
        :options='groupedTypes'
        :pt='{ input: { class: "schema-type", ref: (el) => fieldDropdownRef = el, onKeydown: onDropdownKeydown } }'
        @update:model-value='v => onTypeSelected(unwrappedArray[i], v)'
      )
template(v-if='Type.getType(lastUnwrappedArrayType) === "union"')
  UnionInspectorProps(:type='lastUnwrappedArrayType')
</template>

<style lang='stylus'>
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