import { createRouter, createWebHistory } from 'vue-router'
import SchemaView from '@/views/SchemaView.vue'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/auth/login',
      name: 'auth-login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/schema/new',
      name: 'new-schema',
      props: { createNew: true },
      component: SchemaView,
    },
    {
      path: '/schemas/:schemaName?',
      name: 'schemas',
      component: SchemaView,
      children: [
        {
          path: 'versions/:version',
          name: 'versions',
          component: SchemaView
        },
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const store = useProfileStore();
  const { profile } = storeToRefs(store);

  if (to.name !== 'auth-login' && !profile.value) {
    await store.fetchProfile();
    if (!profile.value) {
      const callback = to.fullPath;
      const query = callback.startsWith('/auth') ? null : { callback };
      next({ name: 'auth-login', query });
    } else {
      next();
    }
  } else if (to.name == 'auth-login' && !profile.value) {
    await store.fetchProfile();
    if (profile.value) {
      if (to.query.callback) {
        await next({
          path: to.query.callback as string
        });
      } else {
        await next({
          name: 'home'
        });
      }
    } else {
      next();
    }
  } else {
    next();
  }
})

export default router
