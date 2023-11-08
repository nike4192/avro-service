<script setup lang="ts">
import SchemaPanel from '@/components/schemas/panel/SchemaPanel.vue';
import SchemaViewBox from '@/components/schemas/SchemaViewBox.vue';
import SchemaTypeInspector from '@/components/schemas/inspector/SchemaTypeInspector.vue'

const props = defineProps({
  createNew: Boolean
});
</script>

<template lang='pug'>
SchemaPanel
SchemaViewBox(:create-new='createNew')
SchemaTypeInspector
</template>
