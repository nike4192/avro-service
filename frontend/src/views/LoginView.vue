<script setup lang='ts'>
import '@/assets/form.styl'
import '@/assets/card.styl'
import { ref } from 'vue'
import { LoginResult, useProfileStore } from '@/stores/profile'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter();
const route = useRoute();

const store = useProfileStore();

const userCredentials = ref({
  username: null,
  password: null,
});

async function onLoginFormSubmit() {
  const result = await store.login(userCredentials.value);
  if (result === LoginResult.Authorized) {
    if (route.query.callback) {
      await router.replace({
        path: route.query.callback as string
      });
    } else {
      await router.replace({
        name: 'home'
      });
    }
  }
}
</script>

<template lang='pug'>
.card
  h1.card-header Login
  form.form-input-container(
    @submit.prevent='onLoginFormSubmit'
  )
    .form-input-row
      input(
        type='text',
        placeholder='username',
        v-model='userCredentials.username'
      )
    .form-input-row
      input(
        type='password',
        placeholder='password',
        v-model='userCredentials.password'
      )
    .form-input-row
      input(type='submit', value='Login')
</template>

<style lang='stylus'>
</style>