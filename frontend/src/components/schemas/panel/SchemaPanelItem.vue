<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const props = defineProps({
  schema: Object,
});

const router = useRouter();

const store = useSchemaStore();
const { selectedSchema, selectedVersion } = storeToRefs(store);

function onSchemaClickHandle(schema) {
  if (schema.name !== selectedSchema.value?.name) {
    const { versions } = schema;

    if (versions && versions.length) {
      const version = versions[versions.length - 1].number;
      router.push({
        name: 'versions',
        params: {
          schemaName: schema.name,
          version
        }
      });
    } else {
      router.push({
        name: 'schemas',
        params: {
          schemaName: schema.name,
        }
      });
    }
  }
}

function onVersionClickHandle(version) {
  if (selectedSchema.value) {
    router.push({
      name: 'versions',
      params: {
        schemaName: selectedSchema.value.name,
        version: version.number.toString(),
      }
    });
  }
}

// watch(selectedVersion, () => {
//   console.log(props.schema, selectedVersion.value?.number);
// })

</script>

<template lang='pug'>
div.schema-panel-item(
  @click='onSchemaClickHandle(schema)'
  :selected='schema.name === selectedSchema?.name'
)
  div.schema-name {{ schema.name }}
  div.versions
    div.version(
      v-for='version in schema.versions'
      @click='onVersionClickHandle(version)'
      :selected='version.number === selectedVersion?.number'
    )
      | v{{ version.number }}
</template>

<style lang='stylus'>
.schema-panel-item
  margin 12px 4px
  padding 12px 18px
  border 1px solid var(--color-border)
  border-radius 24px
  color var(--color-text)
  cursor default
  transition border 120ms

  .schema-name
    font-weight 500

  &[selected='true']
    border 1px solid var(--vt-c-green-dark)

  &:not([selected='true'])
    &:hover
      border 1px solid var(--color-border-hover)
    .versions
      display none

  .versions
    margin-top 12px
    margin-bottom -8px

    .version
      display inline-block
      margin-right 8px
      margin-bottom 8px
      padding 4px 10px
      border 1px solid var(--color-border)
      border-radius 16px
      line-height 1rem

      &[selected='true']
        border 1px solid var(--vt-c-green-dark)
</style>