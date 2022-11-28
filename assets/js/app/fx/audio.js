/* audio */
/* sound playing mechanisms */
/* global Nebyoodle */

const NEBYOODLE_CACHE_AUDIO_KEY = 'bogdle-cache-audio'
const NEBYOODLE_ASSET_DATA_PATH = '/assets/audio'

// Try to get data from the cache, but fall back to fetching it live.
async function getAudio(cacheName, url) {
  let cachedAudio = await getCachedAudio(cacheName, url);

  if (cachedAudio) {
    // console.log('Retrieved cached audio', cachedAudio);
    return cachedAudio;
  }

  // console.log('Fetching fresh data');

  const cacheStorage = await caches.open(cacheName);
  await cacheStorage.add(url);
  cachedAudio = await getCachedAudio(cacheName, url);
  await deleteOldCaches(cacheName);

  return cachedAudio;
}

// Get data from the cache.
async function getCachedAudio(cacheName, url) {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }

  return await cachedResponse.arrayBuffer();
}

// Delete any old caches to respect user's disk space.
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys();

  for (const key of keys) {
    const isOurCache = NEBYOODLE_CACHE_AUDIO_KEY;

    if (currentCache === key || !isOurCache) {
      continue;
    }

    caches.delete(key);
  }
}

// use CacheStorage to check cache
async function useCache(url) {
  const context = new AudioContext();
  const gainNode = context.createGain();
  const source = context.createBufferSource();

  try {
    const audioBuffer = await getAudio(NEBYOODLE_CACHE_AUDIO_KEY, url)

    gainNode.gain.value = 0.3;
    source.buffer = await context.decodeAudioData(audioBuffer);

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();
  } catch (error) {
    console.error(error)
  }
}

// use direct fetch(url)
async function useFetch(url) {
  const context = new AudioContext();
  const gainNode = context.createGain();
  const source = context.createBufferSource();

  const audioBuffer = await fetch(url)
    .then(response => response.arrayBuffer())
    .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

    gainNode.gain.value = 0.5;
    source.buffer = audioBuffer;

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();
}

Nebyoodle._initAudio = async function() {
  const path = NEBYOODLE_ASSET_DATA_PATH

  await caches.open(NEBYOODLE_CACHE_AUDIO_KEY).then(cache => {
    cache.keys().then(function(keys) {
      if (!keys.length) {
        // console.info(`${NEBYOODLE_CACHE_AUDIO_KEY} is empty. Adding files to it...`)

        cache.addAll([
          `${path}/doo-dah-doo.wav`,
          `${path}/haaahs1.wav`,
          `${path}/haaahs2.wav`,
          `${path}/haaahs3.wav`,
          `${path}/tile_click.wav`,
          `${path}/tile_delete.wav`
        ])
      } else {
        // console.info(`${NEBYOODLE_CACHE_AUDIO_KEY} is full, so no need to initialize.`)
      }
    })
  })
}

Nebyoodle._audioPlay = async soundId => {
  if (Nebyoodle.settings.noisy) {
    const path = NEBYOODLE_ASSET_DATA_PATH;
    const format = 'wav';
    const url = `${path}/${soundId}.${format}`

    if ('caches' in self) {
      useCache(url)
    } else {
      useFetch(url)
    }
  }
};
