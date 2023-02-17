/* constants */
/* set any global app constants */
/* eslint-disable no-unused-vars */

const NEBYOODLE_STATE_DAILY_KEY = 'nebyoodle-state-daily'
const NEBYOODLE_STATE_FREE_KEY = 'nebyoodle-state-free'

const NEBYOODLE_SETTINGS_KEY = 'nebyoodle-settings'

const NEBYOOCOM_BASE_URL = 'https://music.nebyoolae.com'
const NEBYOODLE_ENV_PROD_URL = [
  'nebyoodle.fun',
  'guess.nebyoolae.com'
]
const NEBYOODLE_DAILY_SCRIPT = './assets/scripts/daily.php'
const NEBYOODLE_SONG_SCRIPT = './assets/scripts/song.php'
const NEBYOODLE_SONGS_SCRIPT = './assets/scripts/songs.php'

const NEBYOODLE_DUR_PCT = [0.0625, 0.1250, 0.25, 0.4375, 0.6875, 0.999]
const NEBYOODLE_SKP_TXT = ['(+1s)', '(+2s)', '(+3s)', '(+4s)', '(+5s)', '']
const NEBYOODLE_SKP_VAL = [1, 2, 4, 7, 11, 16]

const NEBYOODLE_DEFAULTS = {
  'allSongData': [],
  'config': {
    'daily': {},
    'free': {}
  },
  'state': {
    'daily': {
      durationMax: 1,
      gameState: 'IN_PROGRESS',
      lastCompletedTime: null,
      lastPlayedTime: null,
      skips: 0,
      skipsVal: NEBYOODLE_SKP_VAL[0],
      statistics: []
    },
    'free': {
      durationMax: 1,
      gameState: 'IN_PROGRESS',
      lastCompletedTime: null,
      lastPlayedTime: null,
      skips: 0,
      skipsVal: NEBYOODLE_SKP_VAL[0],
      statistics: []
    }
  },
  'settings': {
    darkMode: false,
    gameMode: 'free'
  }
}

const NEBYOOAPPS_SOURCE_URL = 'https://dave.neb.host/?sites'

const NEBYOODLE_TEST_TERMS = [
  'apple', 'apple watch', 'apple macbook', 'apple macbook pro', 'iphone', 'iphone 12'
]
