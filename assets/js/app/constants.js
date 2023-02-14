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

const NEBYOODLE_DEFAULTS = {
  'config': {
    'daily': {
      retryCount: 0,
      retryMax: 5
    },
    'free': {
      retryCount: 0,
      retryMax: 5
    }
  },
  'state': {
    'daily': {
      'gameState': 'IN_PROGRESS',
      'lastCompletedTime': null,
      'lastPlayedTime': null,
      'statistics': []
    },
    'free': {
      'gameState': 'IN_PROGRESS',
      'lastCompletedTime': null,
      'lastPlayedTime': null,
      'statistics': []
    }
  },
  'settings': {
    'darkMode': false,
    'gameMode': 'free'
  }
}

const NEBYOOAPPS_SOURCE_URL = 'https://dave.neb.host/?sites'
