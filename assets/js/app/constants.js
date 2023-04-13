/* constants */
/* set any global app constants */
/* eslint-disable no-unused-vars */

const NEBYOODLE_STATE_DAILY_KEY = 'nebyoodle-state-daily'
const NEBYOODLE_STATE_FREE_KEY = 'nebyoodle-state-free'

const NEBYOODLE_SETTINGS_KEY = 'nebyoodle-settings'

const NEBYOODLE_SONG_DATA_KEY = 'nebyoodle-song-data'

const NEBYOOCOM_PROD_URL = 'https://music.nebyoolae.com'
const NEBYOOCOM_LOCAL_URL = 'https://muzcom-web.ddev.site'

const NEBYOODLE_ENV_PROD_URL = [
  'nebyoodle.fun',
  'guess.nebyoolae.com'
]
const NEBYOODLE_SHARE_URL = 'https://guess.nebyoolae.com/?r=share'
const NEBYOODLE_DAILY_SCRIPT = './assets/scripts/daily.php'
const NEBYOODLE_SONG_SCRIPT = './assets/scripts/song.php'
const NEBYOODLE_SONGID_SCRIPT = './assets/scripts/songid.php'
const NEBYOODLE_ALL_SONGS_SCRIPT = './assets/scripts/all-songs.php'

const NEBYOODLE_DUR_PCT = [0.0625, 0.1250, 0.25, 0.4375, 0.6875, 0.999]
const NEBYOODLE_SKP_TXT = ['(+1s)', '(+2s)', '(+3s)', '(+4s)', '(+5s)', '']
const NEBYOODLE_SKP_VAL = [1, 2, 4, 7, 11, 16]
const NEBYOODLE_CHANCE_MAX = 6
const NEBYOODLE_DEBUG_ENV = 'foobar'

const NEBYOODLE_DEFAULT_CONFIG = {
  'solution': null,
  'songData': null
}
const NEBYOODLE_DEFAULT_STATE = {
  'gameState': 'IN_PROGRESS',
  'guesses': [],
  'songId': null
}

const NEBYOODLE_DEFAULTS = {
  'allSongData': [],
  'config': {
    'daily': {...NEBYOODLE_DEFAULT_CONFIG},
    'free': {...NEBYOODLE_DEFAULT_CONFIG}
  },
  'state': {
    'daily': [{...NEBYOODLE_DEFAULT_STATE}],
    'free': [{...NEBYOODLE_DEFAULT_STATE}]
  },
  'settings': {
    'darkMode': false,
    'gameMode': 'daily'
  }
}

const NEBYOOAPPS_SOURCE_URL = 'https://dave.neb.host/?sites'

const NEBYOODLE_TEST_TERMS = [
  'apple', 'apple watch', 'apple macbook', 'apple macbook pro', 'iphone', 'iphone 12'
]
