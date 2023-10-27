<script setup lang="ts">
import SchemaPanel from '@/components/schemas/SchemaPanel.vue'
import SchemaViewBox from '@/components/schemas/SchemaViewBox.vue'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const props = defineProps({
  createNew: Boolean
});

watch(() => props.createNew, () => console.log(props.createNew));

const store = useSchemaStore();
const { selectedSchema } = storeToRefs(store);
</script>

<template lang='pug'>
SchemaPanel
SchemaViewBox(:create-new='createNew')
</template>
