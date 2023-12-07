<script setup lang='ts'>

import Textarea from 'primevue/textarea'
import { useSchemaStore } from '@/stores/schema'
import { storeToRefs } from 'pinia'
import { h, onUpdated, toRaw } from 'vue'
import EnumInspectorProps from '@/components/schemas/inspector/props/EnumInspectorProps.vue'
import RecordInspectorProps from '@/components/schemas/inspector/props/RecordInspectorProps.vue'
import UnionInspectorProps from '@/components/schemas/inspector/props/UnionInspectorProps.vue'
import SchemaNameInspectorProps from '@/components/schemas/inspector/props/SchemaNameInspectorProps.vue'
import DocumentationInspectorProps from '@/components/schemas/inspector/props/DocumentationInspectorProps.vue'
import { PRIMITIVE_TYPES, Type } from '~shared/avro/types'
import ArrayInspectorProps from '@/components/schemas/inspector/props/ArrayInspectorProps.vue'
import LogicalTypeInspectorProps from '@/components/schemas/inspector/props/LogicalTypeInspectorProps.vue'

const store = useSchemaStore()
const { selectedType } = storeToRefs(store)

const inspectorTypeProps = {
  record: {
    props: [
      { component: SchemaNameInspectorProps },
      { component: RecordInspectorProps },
      { component: DocumentationInspectorProps }
    ]
  },
  enum: {
    props: [
      { component: SchemaNameInspectorProps },
      { component: EnumInspectorProps },
      { component: DocumentationInspectorProps }
    ]
  },
  union: {
    overridden: true,
    props: [
      { component: SchemaNameInspectorProps },
      { component: UnionInspectorProps, subType: true },  // type.type
      { component: DocumentationInspectorProps }
    ]
  },
  array: {
    overridden: true,
    props: [
      { component: SchemaNameInspectorProps },
      { component: ArrayInspectorProps, subType: true },  // type.type
      { component: DocumentationInspectorProps }
    ]
  },
  fixed: {
    props: [
      { component: SchemaNameInspectorProps }
    ]
  },
  map: {
    props: [
      { component: SchemaNameInspectorProps }
    ]
  },
  default: {
    props: [
      { component: SchemaNameInspectorProps },
      { component: LogicalTypeInspectorProps, types: PRIMITIVE_TYPES },
      { component: DocumentationInspectorProps },
    ]
  }
};

function render() {
  if (selectedType.value) {
    let type = selectedType.value;
    let typeName = Type.getType(type);

    console.log(typeName, selectedType.value);

    if (!typeName) {
      const subTypeName = Type.getType(type.type);
      if (
        subTypeName &&
        inspectorTypeProps[subTypeName] &&
        inspectorTypeProps[subTypeName].overridden
      ) {
        typeName = subTypeName;
      }
    }

    const inspectorType = typeName && inspectorTypeProps[typeName] ? typeName : 'default';
    const inspectorProps = inspectorTypeProps[inspectorType].props;

    return inspectorProps
      .filter(c => c.types
        ? c.types.includes(typeName) || c.types.includes(Type.getType(type.type))
        : true)
      .map(c => h(c.component, {
        type: c.subType ? type.type : type
      }))
  }
}
</script>

<template lang='pug'>
aside.schema-panel-inspector
  template(v-if='selectedType')
    render
  template(v-else)
    .center.color-half Double click on type to inspect
</template>

<style lang='stylus'>
.schema-panel-inspector
  padding 8px 16px
  position relative
  display flex
  flex-direction column
  width 300px
  background-color var(--color-background-soft)
  overflow-y auto

  .inspector-row
    display flex
    flex-direction column
    position relative

    &:not(:last-of-type)::after
      margin 8px 0
      position relative
      content ''
      width 100%
      height 1px
      background-color var(--color-background)

    .row-title
      font-size 1.15rem
      margin 0 0 8px 0

    .row-container
      display flex
      flex-direction column

      &.flex-row
        flex-direction row
        justify-content space-between

  input, textarea
    padding 8px 16px
    border none
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
    outline none
    color var(--color-text)
    border-radius 16px
    background-color var(--color-background-mute)

    &:focus
      background-color var(--color-card-hover)

  textarea
    min-width 100%
    max-width 100%
</style>