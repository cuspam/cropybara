/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';
import { WebShareTarget } from '../lib/WebShareTarget';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files, // everything in `static`
];

sw.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname.endsWith('/share_target')) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        // Delete previous data if it wasn't processed for some reason
        await caches.delete(WebShareTarget.CacheName);

        const images = formData.getAll('image');
        const mediaCache = await caches.open(WebShareTarget.CacheName);

        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          if (typeof image === 'string') continue;
          await mediaCache.put(
            i.toString(),
            new Response(image, {
              headers: {
                [WebShareTarget.TypeHeader]: image.type,
                [WebShareTarget.FilenameHeader]: image.name,
              },
            }),
          );
        }

        return Response.redirect('./?source=share-target', 303);
      })(),
    );
  }

  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);

      if (response) {
        return response;
      }
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      // if we're offline, fetch can return a value that is not a Response
      // instead of throwing - and we can't pass this non-Response to respondWith
      if (!(response instanceof Response)) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('invalid response from fetch');
      }

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (err) {
      const response = await cache.match(event.request);

      if (response) {
        return response;
      }

      // if there's no cache, then just error out
      // as there is nothing we can do to respond to this request
      throw err;
    }
  }

  event.respondWith(respond());
});
