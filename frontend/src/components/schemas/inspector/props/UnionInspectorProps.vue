<script setup lang='ts'>

import TimesCircleIcon from 'primevue/icons/timescircle'
import Chip from 'primevue/chip'
import AutoComplete from 'primevue/autocomplete'
import { getType } from '@/utils/schemas'
import { ref, watch } from 'vue'
import { Type, TYPE_NAMES } from '~shared/avro/types'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'

const props = defineProps({
  type: Array
});

const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

// For union
const suggestionTypes = ref([]);
const filteredSuggestionTypes = ref([]);
const suggestionValue = ref('');

const search = (event) => {
  const { query } = event;
  filteredSuggestionTypes.value = suggestionTypes.value.filter(t => t.match(query));
}

function onRemoveType(value) {
  console.log(value, props.type);
  const indexOf = props.type.indexOf(value);
  if (indexOf !== -1) {
    props.type.splice(indexOf, 1);
  }
  schemaTreeRerender.rerender()
}

function onAutoComplete({ value }) {
  props.type.push(Type.createType(value).type);
  console.log(props.type);
  suggestionValue.value = '';
  schemaTreeRerender.rerender();
}

watch(props.type, () => {
  console.log('Union', props.type.map(getType));
  suggestionTypes.value = [...TYPE_NAMES].filter(t => !props.type.includes(t));
}, {
  immediate: true
});

</script>

<template lang='pug'>
.inspector-row
  .row-title Types
  .row-container
    .union-types
      Chip(
        v-for='(t, index) of type'
        :removable='true'
        :key="index"
        :label='getType(t)'
      )
        template(#removeicon)
          TimesCircleIcon.p-icon.p-chip-remove-icon(@click="onRemoveType(t)")
    AutoComplete(
      :delay='0'
      v-model='suggestionValue'
      :suggestions="filteredSuggestionTypes"
      @item-select='onAutoComplete'
      @complete='search'
    )
</template>

<style lang='stylus'>
.union-types
  .p-chip
    margin 0 8px 8px 0
    padding 4px 6px 4px 12px
    display inline-flex
    border-radius 16px
    line-height 1rem
    justify-content center
    background-color var(--color-background-mute)

    .p-chip-remove-icon
      margin-left 4px
      width 18px
      height 18px
      color var(--color-text)

.p-autocomplete-input
  width 100%

.p-autocomplete-panel
  background-color var(--color-background-mute)
  border-radius 16px

  .p-autocomplete-empty-message
    padding 8px 16px

  .p-autocomplete-item
    padding 8px 16px

    &.p-focus
      background-color var(--color-background-soft)
</style>