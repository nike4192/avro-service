<script setup lang='ts'>

import { TrashIcon, ArrowUpCircleIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
import '@/assets/button.styl'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { computed, onUpdated, ref } from 'vue'
import type { Ref } from 'vue'
import SchemaTree from '@/components/schemas/tree/SchemaTree.vue'
import LogoutButton from '@/components/buttons/LogoutButton.vue'
import { useEventListener } from '@/composables/events'
import { cloneDeepWith } from 'lodash'
import { walkThroughComplexTypes } from '@/utils/schemas'

const props = defineProps({
  createNew: Boolean
});

const viewContainerRef = ref(null);

const schemaNameRef: Ref<HTMLDivElement | null> = ref(null);
const router = useRouter();

const store = useSchemaStore();
const { selectedType, selectedSchema, selectedVersion } = storeToRefs(store);

const schema = computed(() => selectedVersion.value?.schema);

async function onSchemaNameKeydown(e) {
  switch (e.key) {
    case 'Escape':
      e.target.blur();
      e.target.textContent = selectedSchema.value.name;
      break;
    case 'Enter':
      e.target.blur();
      if (props.createNew) {
        createSchema();
      } else {
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
      }
      break;
  }
}


function clearSchema(schema) {
  const cleaner = (value) => {
    if (value && typeof value === 'object') {
      let clonedValue;
      if (Array.isArray(value)) {
        clonedValue = value.map(value => cloneDeepWith(value, cleaner));
      } else {
        clonedValue = { ...value };
        ['el', 'path', 'errors'].map(k => delete clonedValue[k]);
        for (const key in clonedValue) {
          clonedValue[key] = cloneDeepWith(clonedValue[key], cleaner);
        }
      }
      return clonedValue;
    }
  }

  return cloneDeepWith(schema, cleaner);
}

function createSchema() {
  console.log(schemaNameRef.value.textContent);
  const schema = {
    name: schemaNameRef.value.textContent,
    type: 'record',
    fields: [],
  };
  store.pushSchema(schema);
}

function pushSchema(schema) {
  const clearedSchema = clearSchema(schema);
  store.pushSchema(clearedSchema);
}

function removeSchemaVersion() {
  if (selectedVersion.value) {
    store.removeSchemaVersion(selectedVersion.value);
  } else if (selectedSchema.value) {
    store.removeSchema(selectedSchema.value);
  }
}

onUpdated(() => {
  if (props.createNew) {
    schemaNameRef.value?.focus();
  }
});

function schemaViewBoxMouseDown(e) {
  if (e.button === 0 && e.target === viewContainerRef.value) {
    selectedType.value = null;
  }
}

// useEventListener(window, 'keydown', (e) => {
//   if (e.key === 'Escape') {
//     selectedType.value = null;
//   }
// });

</script>

<template lang='pug'>
.schema-view-box
  .view-header
    .view-header-button-container
      div.icon-button.red(
        v-if='selectedSchema || selectedVersion'
        title='Remove'
        @click='removeSchemaVersion()'
      )
        TrashIcon.icon
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
      div.icon-button(
        v-if='schema'
        title='Push'
        @click='pushSchema(schema)'
      )
        ArrowUpCircleIcon.icon
      button.icon-button(
        v-else-if='createNew'
        title='Create',
        :disabled='!schemaNameRef?.textContent ?? null'
        @click='createSchema()'
      )
        PlusCircleIcon.icon
    LogoutButton.view-header-button
  .view-container(ref='viewContainerRef', @mousedown='schemaViewBoxMouseDown')
    SchemaTree(:schema='schema')
</template>

<style lang='stylus'>
@import '../../assets/scrollbar.styl'

.schema-view-box
  flex 1
  min-width 300px
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
          padding 4px 14px
          background-color var(--color-background-soft)
          border-radius 20px

      span.version
        padding 2px 8px
        border 1px solid var(--color-border)
        border-radius 12px
        line-height 1rem

  .view-container
    scrollbar(var(--color-background), var(--color-background-mute))
    padding 30px
    display grid
    height 100%
    overflow-y auto
</style>