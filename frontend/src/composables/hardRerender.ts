import { ref } from 'vue'
import type { Ref } from 'vue'
import type { HardRerender } from '@/types/schema'

type RegistryRecord = {
  flag: Ref<boolean>,  // Put it in :key="flag" of element for rerender
  rerender: () => void
}

const registry: Ref<{
  [keys: HardRerender]: RegistryRecord
}> = ref({});

export function useHardRerender(key: HardRerender): RegistryRecord {
  if (registry.value[key]) {
    const { flag, rerender } = registry.value[key];

    return { flag, rerender };
  } else {
    const flag = ref(false);
    const rerender = () => flag.value = !flag.value;

    registry.value[key] = { flag, rerender };

    return { flag, rerender };
  }
}