/* constants */
/* set any global app constants */
/* eslint-disable no-unused-vars */

const NEBYOODLE_STATE_DAILY_KEY = 'nebyoodle-state-daily'
const NEBYOODLE_STATE_FREE_KEY = 'nebyoodle-state-free'

const NEBYOODLE_SETTINGS_KEY = 'nebyoodle-settings'

const NEBYOODLE_ENV_PROD_URL = 'nebyoodle.fun'
const NEBYOODLE_DAILY_SCRIPT = './assets/scripts/daily.php'


const NEBYOODLE_DEFAULTS = {
  'config': {
    'daily': {

    },
    'free': {

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
