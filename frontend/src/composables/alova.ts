import { createAlova } from 'alova';
import GlobalFetch from 'alova/GlobalFetch';
import VueHook from 'alova/vue';

const { BACKEND_PROTOCOL, BACKEND_HOST, BACKEND_PORT } = import.meta.env;

const BACKEND_URL = new URL('https://avro.coor.xyz');

BACKEND_URL.protocol = BACKEND_PROTOCOL ?? BACKEND_URL.protocol;
BACKEND_URL.host = BACKEND_HOST ?? BACKEND_URL.protocol;
BACKEND_URL.port = (
  BACKEND_PORT
    ? ([80, 443].includes(BACKEND_PORT) ? '' : BACKEND_PORT)
    : BACKEND_URL.port
);

export const alovaInstance = createAlova({
  // Suppose we need to interact with the server for this domain
  baseURL: BACKEND_URL.href.replace(/\/$/, ''),

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