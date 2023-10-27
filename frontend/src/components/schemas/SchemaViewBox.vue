<script setup lang='ts'>

import '@/assets/button.styl'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { onUpdated, ref, watch } from 'vue'
import type { Ref } from 'vue'
import SchemaTree from '@/components/schemas/SchemaTree.vue'
import LogoutButton from '@/components/buttons/LogoutButton.vue'

const props = defineProps({
  createNew: Boolean
});

const schemaNameRef: Ref<HTMLDivElement | null> = ref(null);
const router = useRouter();

const store = useSchemaStore();
const { selectedSchema, selectedVersion } = storeToRefs(store);

async function onSchemaNameKeydown(e) {
  switch (e.key) {
    case 'Escape':
      e.target.blur();
      e.target.textContent = selectedSchema.value.name;
      break;
    case 'Enter':
      e.target.blur();
      if (selectedSchema.value.name !== e.target.textContent) {
        const schema = {
          id: selectedSchema.value.id,
          name: e.target.textContent
        };

        const version = selectedVersion.value?.number?.toString();
        await store.updateSchema(schema);

        if (selectedVersion.value) {
          await router.replace({
            name: 'versions',
            params: {
              schemaName: schema.name,
              version,
            }
          });
        } else {
          await router.replace({
            name: 'schemas',
            params: {
              schemaName: schema.name,
            }
          });
        }
      }
      break;
  }
}

onUpdated(() => {
  if (props.createNew) {
    schemaNameRef.value?.focus();
  }
})

</script>

<template lang='pug'>
.schema-view-box
  .view-header
    .view-header-button.icon-button
    .view-header-title-container
      .schema(
        v-if='selectedSchema || createNew'
        ref='schemaNameRef'
        @keydown='onSchemaNameKeydown'
        contenteditable='true'
      )
        | {{ selectedSchema?.name }}
      span.version(v-if='selectedVersion')
        | v{{ selectedVersion?.number }}
    LogoutButton.view-header-button
  .view-container
    SchemaTree(:schema='selectedVersion?.schema', :records='selectedVersion?.records')
</template>

<style lang='stylus'>
.schema-view-box
  flex 1
  display flex
  flex-direction column

  .view-header
    padding 0 6px
    flex-shrink 0
    height 48px
    display flex
    justify-content space-between
    align-items center

    .view-header-title-container
      padding 0 8px
      display flex
      align-items center
      gap 8px
      // box-shadow inset 0 -1px 0 0 var(--color-border)

      .schema
        font-size 1.25rem
        outline none
        text-align center
        transition padding 120ms

        &:empty
          min-width 150px

        &:focus, &:empty
          padding 2px 12px
          background-color var(--color-background-soft)
          border-radius 4px

      span.version
        padding 2px 8px
        border 1px solid var(--color-border)
        border-radius 4px
        line-height 1rem

  .view-container
    flex 1
    display flex
    justify-content center
    align-items center
    overflow auto
</style>