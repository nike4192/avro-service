<script setup lang='ts'>

import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline'
import { LogoutResult, useProfileStore } from '@/stores/profile'
import { useRouter } from 'vue-router'

const router = useRouter();

const store = useProfileStore();

async function onLogoutButtonClick() {
  const result = await store.logout();
  if (result === LogoutResult.Unauthorized) {
    await router.push({ name: 'auth-login' });
  }
}
</script>

<template lang='pug'>
.icon-button.logout.red(
  title='Выйти'
  @click='onLogoutButtonClick'
)
  ArrowLeftOnRectangleIcon.icon
</template>

<style scoped lang='stylus'>

</style>