<script setup lang='ts'>

import AutoComplete from 'primevue/autocomplete'
import Checkbox from 'primevue/checkbox'
import { computed, onMounted, onUpdated, ref } from 'vue'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'

const props = defineProps({
  type: Object
});

const r = ref(null);
const schemaTreeRerender = useHardRerender(HardRerender.SchemaTree);

const suggestions = ref([
  'decimal',
  'uuid',
  'date',
  'time-millis',
  'time-micros',
  'timestamp-millis',
  'timestamp-micros',
  'local-timestamp-millis',
  'local-timestamp-micros',
  'duration'
]);

const filteredSuggestions = ref([]);

function toggleLogicalType(value) {
  if (value) {
    const type = props.type.type
    props.type.type = { type, logicalType: '' };
  } else {
    const { logicalType, ...data } = props.type.type;
    Object.assign(props.type, data);
    console.log(props.type, data);
  }
  schemaTreeRerender.rerender();
}

function search(event) {
  filteredSuggestions.value = suggestions.value.filter(s => s.match(event.query));
}

const isLogicalType = computed(() => props.type?.type?.logicalType !== undefined);

onMounted(() => console.log(props.type));

</script>

<template lang='pug'>
.inspector-row
  .row-title Logical Type
  .row-container.flex-row.logical-type
    Checkbox(
      :binary='true'
      :model-value='isLogicalType'
      @input='toggleLogicalType'
    )
    AutoComplete(
      v-model='type.type.logicalType'
      :suggestions='filteredSuggestions'
      :loading='false'
      :delay='0'
      :disabled='!isLogicalType'
      @complete='search'
    )
</template>

<style lang='stylus'>
.logical-type
  align-items center
  gap 12px

  .p-checkbox {
    width: 20px;
    height: 20px;
  }
  .p-checkbox .p-checkbox-box {
    border: 2px solid var(--color-border);
    background: #0e1315;
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.87);
    border-radius: 6px;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
  }
  .p-checkbox .p-checkbox-box .p-checkbox-icon {
    transition-duration: 0.3s;
    color: #121212;
    font-size: 14px;
  }
  .p-checkbox .p-checkbox-box .p-checkbox-icon.p-icon {
    width: 14px;
    height: 14px;
  }
  .p-checkbox .p-checkbox-box.p-highlight {
    border-color: var(--vt-c-green-dark);
    background: var(--vt-c-green-dark);
  }
  .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
    border-color: var(--vt-c-green-darker);
  }
  .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-focus {
    outline: 0 none;
    outline-offset: 0;
    box-shadow: 0 0 0 1px var(--vt-c-green-dark);
    border-color: var(--vt-c-green-dark);
  }
  .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-highlight:hover {
    border-color: var(--vt-c-green-dark);
    background: var(--vt-c-green-dark);
    color: #121212;
  }
  .p-checkbox.p-invalid > .p-checkbox-box {
    border-color: #f78c79;
  }

  .p-input-filled .p-checkbox .p-checkbox-box {
    background-color: var(--color-border);
  }
  .p-input-filled .p-checkbox .p-checkbox-box.p-highlight {
    background: var(--vt-c-green-dark);
  }
  .p-input-filled .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
    background-color: var(--color-border);
  }
  .p-input-filled .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-highlight:hover {
    background: var(--vt-c-green-dark);
  }

  .p-autocomplete
    flex 1

  .p-inputtext
    flex 1
</style>