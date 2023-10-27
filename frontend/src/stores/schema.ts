import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { alovaInstance } from '@/composables/alova';
import { useRoute } from 'vue-router'
import { Type } from 'avsc'

export const useSchemaStore = defineStore('schema', () => {
  const schemaData = alovaInstance.Get<[]>('/schema', {
    credentials: 'include'
  });

  const route = useRoute();

  const schemaList = ref([]);

  const selectedSchema: null | any = computed(() => {
    return schemaList.value.find(
      s => s.name === route.params.schemaName
    );
  });

  const selectedVersion: null | any = ref(null);

  watch(
    () => [route.params.schemaName, route.params.version],
    async () => {
      const { schemaName, version } = route.params;
      if (schemaName && version) {
        const versionData = alovaInstance.Get(`/schema/${schemaName}/versions/${version}`, {
          credentials: 'include'
        });
        const versionEntity = await versionData.send();
        versionEntity.records = [];
        Type.forSchema(versionEntity.schema, {
          typeHook(schema, opts) {
            if (schema && schema.type === 'record') {
              versionEntity.records.push(schema);
            }
            return;
          }
        });
        selectedVersion.value = versionEntity;
      } else {
        selectedVersion.value = null;
      }
  }, {
    immediate: true
  });

  async function fetchSchema() {
    schemaList.value = await schemaData.send();
  }

  async function updateSchema(schema) {
    const { name } = schema;
    const updatedSchema = await alovaInstance.Patch<any>('/schema/' + schema.id, {
      name
    }, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }).send();

    const indexOf = schemaList.value.findIndex(s => s.id === schema.id);
    if (indexOf !== -1) {
      schemaList.value.splice(indexOf, 1, updatedSchema);
    }
  }

  return {
    schemaList,
    selectedSchema,
    selectedVersion,
    fetchSchema,
    updateSchema
  }
})
