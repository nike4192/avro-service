import { computed, ref, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { alovaInstance } from '@/composables/alova'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue';

export const useSchemaStore = defineStore('schema', () => {
  const route = useRoute();

  const schemaList = ref([]);

  const selectedSchema: null | any = computed(() => {
    return schemaList.value.find(
      s => s.name === route.params.schemaName
    );
  });

  const selectedType: Ref<any | null> = ref(null);
  const selectedVersion: null | any = shallowRef(null);

  watch(
    () => [route.params.schemaName, route.params.version],
    fetchSelectedVersion,
    { immediate: true }
  );

  async function fetchSelectedVersion() {
    const { schemaName, version } = route.params;
    if (schemaName && version) {
      const versionData = alovaInstance.Get(`/schema/${schemaName}/versions/${version}`, {
        credentials: 'include'
      });
      selectedVersion.value = await versionData.send();
    } else {
      selectedVersion.value = null;
    }
    selectedType.value = null;
  }

  async function fetchSchema() {
    schemaList.value = await alovaInstance.Get<[]>('/schema', {
      credentials: 'include'
    }).send();
  }

  async function pushSchema(schema) {
    await alovaInstance.Post(`/schema/${schema.name}/versions`, {
      schema
    }, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      credentials: 'include'
    }).send();
    await fetchSchema();
  }

  async function removeSchema(schema) {
    await alovaInstance.Delete(`/schema/${schema.name}`, null, {
      credentials: 'include'
    }).send();
    await fetchSchema();
  }

  async function removeSchemaVersion(version) {
    await alovaInstance.Delete(`/schema/versions/${version.id}`, null, {
      credentials: 'include'
    }).send();
    await fetchSchema();
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
    selectedType,
    fetchSchema,
    updateSchema,
    pushSchema,
    removeSchemaVersion,
    removeSchema,
  }
})
