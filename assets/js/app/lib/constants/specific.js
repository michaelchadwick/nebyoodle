/* lib/constants/specific */
/* global specific constants */
/* eslint-disable no-unused-vars */

const NEBYOOCOM_PROD_URL = 'https://music.nebyoolae.com'
const NEBYOOCOM_LOCAL_URL = 'https://muzcom-web.ddev.site'

const NEBYOODLE_DEBUG_SCRIPT = './assets/php/debug.php'
const NEBYOODLE_SONG_SCRIPT = './assets/php/song.php'
const NEBYOODLE_SONGID_SCRIPT = './assets/php/songid.php'
const NEBYOODLE_ALL_SONGS_SCRIPT = './assets/php/all-songs.php'

const NEBYOODLE_DEFAULT_GAMEMODE = 'daily'

const NEBYOODLE_DEFAULT_CONFIG = {
  solution: null,
  songData: null,
}
const NEBYOODLE_DEFAULT_STATE = {
  gameState: 'IN_PROGRESS',
  guesses: [],
  songId: null,
}
const NEBYOODLE_DEFAULT_SETTINGS = {
  darkMode: false,
  firstTime: true,
  gameMode: 'daily',
}

const NEBYOODLE_DEFAULTS = {
  allSongData: [],
  config: {
    daily: { ...NEBYOODLE_DEFAULT_CONFIG },
    free: { ...NEBYOODLE_DEFAULT_CONFIG },
  },
  state: {
    daily: [{ ...NEBYOODLE_DEFAULT_STATE }],
    free: [{ ...NEBYOODLE_DEFAULT_STATE }],
  },
  settings: NEBYOODLE_DEFAULT_SETTINGS,
}

const NEBYOODLE_DUR_PCT = [0.0625, 0.125, 0.25, 0.4375, 0.6875, 0.999]
const NEBYOODLE_SKP_TXT = ['(+1s)', '(+2s)', '(+3s)', '(+4s)', '(+5s)', '']
const NEBYOODLE_SKP_VAL = [1, 2, 4, 7, 11, 16]
const NEBYOODLE_CHANCE_MAX = 6
