<script setup lang='ts'>

import '@/assets/button.styl'
import { PlusIcon } from '@heroicons/vue/24/outline';
import { useSchemaStore } from '@/stores/schema'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import SchemaPanelItem from '@/components/schemas/panel/SchemaPanelItem.vue'
import { useRouter } from 'vue-router'

const router = useRouter();
const store = useSchemaStore();
const { schemaList } = storeToRefs(store);

function onAddSchemaButtonClick() {
  router.push({ name: 'new-schema' });
}

onMounted(async () => {
  await store.fetchSchema();
})
</script>

<template lang='pug'>
aside.schema-panel
  div.schema-panel-header
    div.schema-panel-header-button.icon-button(
      @click='onAddSchemaButtonClick'
      title="Создать схему"
    )
      PlusIcon.icon
  hr
  .schema-panel-container
    SchemaPanelItem(
      v-for='schema in schemaList',
      :schema='schema'
    )
</template>

<style lang='stylus'>
@import "../../../assets/scrollbar.styl"

aside.schema-panel
  display flex
  flex-direction column
  flex-shrink 0
  width 300px
  height 100%
  background-color var(--color-background-soft)

  .schema-panel-header
    padding 4px 16px

  hr
    margin 0 8px
    border none
    height 1px
    background-color var(--color-border)

  .schema-panel-container
    scrollbar(var(--color-background-soft), var(--color-border))
    padding-left var(--scrollbar-size)
    overflow-y scroll
</style>