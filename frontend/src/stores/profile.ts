import { defineStore } from 'pinia'
import { alovaInstance } from '@/composables/alova'
import { ref } from 'vue'
import type { Ref } from 'vue'

export enum LoginResult {
  Unauthorized,
  Authorized
}

export enum LogoutResult {
  Failed,
  Unauthorized
}

export const useProfileStore = defineStore('profile', () => {
  const profileData = alovaInstance.Get('/profile', {
    credentials: 'include'
  });

  const profile: Ref<any | null> = ref(null);

  async function fetchProfile() {
    try {
      profile.value = await profileData.send();
    } catch (e) {}
  }

  async function login(credentials) {
    const { username, password } = credentials;

    try {
      await alovaInstance.Post('/auth/login', {
        username, password,
      }, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        credentials: 'include'
      }).send();

      await fetchProfile();

      return LoginResult.Authorized;
    } catch (e) {
      return LoginResult.Unauthorized;
    }
  }

  async function logout() {
    try {
      await alovaInstance.Post('/auth/logout', undefined, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        credentials: 'include'
      }).send();

      profile.value = null;

      return LogoutResult.Unauthorized;
    } catch (e) {
      return LogoutResult.Failed;
    }
  }

  return {
    profile,
    login,
    logout,
    fetchProfile
  }
})