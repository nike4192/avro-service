import { createAlova } from 'alova';
import GlobalFetch from 'alova/GlobalFetch';
import VueHook from 'alova/vue';

const { BACKEND_HOST, BACKEND_PORT } = import.meta.env;

export const alovaInstance = createAlova({
  // Suppose we need to interact with the server for this domain
  baseURL: `http://${BACKEND_HOST}:${BACKEND_PORT}`,

  // Introduce VueHook under the vue project, which can help us create request-related states that can be managed by alova using vue's ref function
  statesHook: VueHook,
  // Request adapter, here we use fetch request adapter
  requestAdapter: GlobalFetch(),

  localCache: null,

  async responded(response, config) {
    if (!response.ok) {
      // When an error is thrown here, it will enter the request failure interceptor
      throw new Error(response.message);
    }
    return await response.json();
  },
});