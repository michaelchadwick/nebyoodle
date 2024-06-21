/* lib/localStorage */
/* functions to interact with window.localStorage */
/* global Nebyoodle */

// load state/statistics from LS -> code model
Nebyoodle._loadGame = async function(mode = null) {
  let dailyCreateOrLoad = ''
  let freeCreateOrLoad = ''

  if (!mode) {
    /* ************************* */
    /* allSongData from LS       */
    /* ************************* */
    await Nebyoodle._loadAllSongData()

    /* ************************* */
    /* settings LS -> code       */
    /* ************************* */
    Nebyoodle._loadSettings()
  }

  // console.log('daily state', Nebyoodle.state.daily)

  const gameMode = mode ? mode : Nebyoodle.__getGameMode()
  const lsStateDaily = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY))
  const lsStateFree = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_KEY))

  if (lsStateDaily) {
    Nebyoodle.state.daily = lsStateDaily
  }
  if (lsStateFree) {
    Nebyoodle.state.free = lsStateFree
  }

  if (gameMode == 'daily') {
    // no existing daily state found, so create with defaults
    if (!lsStateDaily) {
      Nebyoodle.state.daily = NEBYOODLE_DEFAULTS.state.daily

      // console.log('DAILY: LS state NOT found; defaults set; solution to be created with daily song', Nebyoodle.state.daily)

      dailyCreateOrLoad = 'create'
    }
    // if we have previous daily LS values, sync them to code
    else {
      // console.log('FUNC _loadGame(): found previous DAILY data')

      /*
        special case for daily song:
        need to check to make sure time hasn't elapsed on saved progress
      */
      try {
        // console.log('FUNC _loadGame(); fetching NEBYOODLE_DAILY_SCRIPT')

        Nebyoodle.myModal = new Modal('temp-api', ' ',
          'loading saved daily info...',
          null,
          null,
          'lds-dual-ring'
        )

        const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
        const data = await response.json()

        if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

        const dailySongId = data['songId']
        const savedSongId = lsStateDaily[Nebyoodle.__getSessionIndex()].songId

        // console.log(`dailySongId: ${dailySongId}, savedSongId: ${savedSongId}`)

        // still working on same day
        if (dailySongId == savedSongId) {
          // console.log('FUNC _loadGame(); dailySongId is same as savedSongId')

          const lsDailyGuesses = Nebyoodle.__getGuesses('daily')
          const lsDailySongId = Nebyoodle.__getSongId('daily')

          if (lsDailySongId) {
            // console.log(`Song for ${Nebyoodle.__getTodaysDate()}:`, dailySongId)

            // load answer from songId and set to solution
            await Nebyoodle.__setSolution('songId', lsDailySongId)

            // if we already have previous guesses, check for correct answer
            if (lsDailyGuesses.length) {
              // console.log('DAILY existing guesses found')

              Nebyoodle._refreshUI(lsDailyGuesses)

              dailyCreateOrLoad = 'load'
            }
            //  no guesses to check, so just load
            else {
              // console.log('DAILY solution not yet guessed; LOAD')

              dailyCreateOrLoad = 'load'
            }
          }
        }
        // time has elapsed on daily puzzle, and new one is needed
        else {
          // console.log('FUNC _loadGame(); dailySongId and savedSongId do not match; creating new puzzle')

          dailyCreateOrLoad = 'create'
        }

        Nebyoodle.__updateDailyDetails(data['index'])
      } catch (e) {
        console.error('could not get daily song', e)

        Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].guesses = []
        Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].songId = null
      }
    }

    // console.log('creating/loading DAILY solution:', dailyCreateOrLoad)

    switch (dailyCreateOrLoad) {
      case 'create':
        await Nebyoodle._createNewSolution('daily')
        // console.log('DAILY solution created!', Nebyoodle.__getSongId('daily'))
        break
      case 'load':
        await Nebyoodle._loadExistingSolution('daily', Nebyoodle.__getSongId('daily'))
        // console.log('DAILY solution loaded!', Nebyoodle.__getSongId('daily'))
        break
      default:
        break
    }

    Nebyoodle.dom.dailyDetails.classList.add('show')

    // console.log('SAVE: end of _loadGame(daily)')
    Nebyoodle._saveGame('daily')
  }

  if (gameMode == 'free') {
    // no existing free state found, so create with defaults
    if (!lsStateFree) {
      Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

      // console.log('FREE: LS state NOT found; defaults set; solution to be randomly chosen', Nebyoodle.state.free)

      freeCreateOrLoad = 'create'
    }
    // if we have previous free LS values, sync them to code
    else {
      // console.log('FUNC _loadGame(): found previous FREE data')

      Nebyoodle.state.free = lsStateFree

      const lsFreeGuesses = Nebyoodle.__getGuesses('free')
      const lsFreeSongId = Nebyoodle.__getSongId('free')

      // if we already have a chosen songId, then we need
      // to check if we have the correct answer already
      if (lsFreeSongId) {
        // console.log('FREE solution songId already chosen; loading', lsFreeSongId)

        // load answer from songId and set to solution
        await Nebyoodle.__setSolution('songId', lsFreeSongId)

        // if we already have previous guesses, check for correct answer
        if (lsFreeGuesses.length) {
          // console.log('FREE existing guesses found')

          Nebyoodle._refreshUI(lsFreeGuesses)

          freeCreateOrLoad = 'load'
        } else {
          // console.log('FREE no previous guesses found')

          freeCreateOrLoad = 'load'
        }
      }
      // no chosen song yet, so create new puzzle
      else {
        // console.log('FREE solution not yet chosen; CREATE')

        freeCreateOrLoad = 'create'
      }
    }

    // console.log('creating/loading FREE solution:', freeCreateOrLoad)

    switch (freeCreateOrLoad) {
      case 'create':
        await Nebyoodle._createNewSolution('free', true)
        // console.log('FREE solution created!', Nebyoodle.__getSongId('free'))
        break
      case 'load':
        await Nebyoodle._loadExistingSolution('free', Nebyoodle.__getSongId('free'))
        // console.log('FREE solution loaded!', Nebyoodle.__getSongId('free'))
        break
      default:
        break
    }

    // console.log('SAVE: end of _loadGame(free)')
    Nebyoodle._saveGame('free')
  }

  if (Nebyoodle.__getGameState() != 'GAME_OVER') {
    Nebyoodle.modalOpen('readysetguess')
  }

  // console.log('Nebyoodle.settings', Nebyoodle.settings)

  if (Nebyoodle.settings.firstTime) {
    Nebyoodle.modalOpen("start")

    Nebyoodle._saveSetting("firstTime", false)
  }
}
// save game state/settings from code model -> LS
Nebyoodle._saveGame = function(mode = null) {
  // console.log('saving game state and global settings to localStorage...')

  // save global game settings
  try {
    localStorage.setItem(NEBYOODLE_SETTINGS_KEY, JSON.stringify(Nebyoodle.settings))

    // console.log('localStorage settings saved!', JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_KEY)))
  } catch(error) {
    console.error('localStorage global settings save failed', error)
  }

  // save daily game state
  if (mode == null || mode == 'daily') {
    try {
      // console.log('DAILY localStorage state being saved with', JSON.stringify(Nebyoodle.state.daily))

      localStorage.setItem(NEBYOODLE_STATE_DAILY_KEY, JSON.stringify(Nebyoodle.state.daily))

      // console.log('DAILY localStorage state saved!', JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY)))
    } catch(error) {
      console.error('localStorage DAILY state save failed', error)
    }
  }

  // save free game state
  if (mode == null || mode == 'free') {
    try {
      // console.log('FREE localStorage state being saved with', JSON.stringify(Nebyoodle.state.free))

      localStorage.setItem(NEBYOODLE_STATE_FREE_KEY, JSON.stringify(Nebyoodle.state.free))

      // console.log('FREE localStorage state saved!', JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_KEY)))
    } catch(error) {
      console.error('localStorage FREE state save failed', error)
    }
  }
}

// check for song data, and load it appropriately
Nebyoodle._loadAllSongData = async function() {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_KEY)

  if (lsSongData) {
    console.log('Song data loaded (localStorage)!')

    // Nebyoodle.myModal = new Modal('temp', null,
    //   'Song data loaded',
    //   null,
    //   null
    // )

    Nebyoodle.allSongData = JSON.parse(lsSongData)
  } else {
    await Nebyoodle._getSongs()
  }
}

// load settings (gear icon) from localStorage
Nebyoodle._loadSettings = function() {
  // console.log('loading settings from LS...')

  const lsSettings = JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_KEY))

  if (lsSettings) {
    // console.log('found previous settings')

    Nebyoodle.settings.darkMode = lsSettings.darkMode

    if (Nebyoodle.settings.darkMode) {
      document.body.classList.add('dark-mode')

      const setting = document.getElementById('button-setting-dark-mode')

      if (setting) {
        setting.dataset.status = 'true'
      }
    }

    Nebyoodle.settings.gameMode = lsSettings.gameMode || 'daily'
  } else {
    // console.log('no previous settings found -- setting to defaults...')

    Nebyoodle.settings = NEBYOODLE_DEFAULTS.settings

    Nebyoodle.modalOpen('start')

    localStorage.setItem(NEBYOODLE_SETTINGS_KEY, JSON.stringify(Nebyoodle.settings))
  }

  // STATE->GAMEMODE
  if (Nebyoodle.settings.gameMode == 'free') {
    if (Nebyoodle.dom.interactive.gameModeDailyLink) {
      Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = false
    }
    if (Nebyoodle.dom.interactive.gameModeFreeLink) {
      Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = true
    }
    Nebyoodle.dom.dailyDetails.classList.remove('show')
  }

  // console.log('loaded settings from LS!', Nebyoodle.settings)
}
// change a setting (gear icon) value
Nebyoodle._changeSetting = async function(setting, value, event) {
  switch (setting) {
    case 'darkMode':
      const st = document.getElementById('button-setting-dark-mode').dataset.status

      if (st == '' || st == 'false') {
        document.getElementById('button-setting-dark-mode').dataset.status = 'true'
        document.body.classList.add('dark-mode')

        Nebyoodle._saveSetting('darkMode', true)
      } else {
        document.getElementById('button-setting-dark-mode').dataset.status = 'false'
        document.body.classList.remove('dark-mode')

        Nebyoodle._saveSetting('darkMode', false)
      }

      break

    case 'gameMode':
      // if at end-state and a gameMode is clicked
      // make sure to close the open modal
      const dialog = document.getElementsByClassName('modal-dialog')[0]
      if (dialog) dialog.remove()
      if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

      const currentGameMode = Nebyoodle.__getGameMode()

      if (currentGameMode != value) {
        Nebyoodle._disableUI()

        Nebyoodle._saveSetting('gameMode', value)

        Nebyoodle._loadGame(value)
      }

      break
  }
}
// save a setting (gear icon) to localStorage
Nebyoodle._saveSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  let settings = JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_KEY))

  // set temp obj that will go to LS
  settings[setting] = value
  // set internal code model
  Nebyoodle.settings[setting] = value

  if (setting == 'gameMode') {
    if (value == 'daily') {
      // console.log('**** switchING game mode to DAILY ****')

      // set dom status
      Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = true
      Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = false
      Nebyoodle.dom.dailyDetails.classList.add('show')
    }

    if (value == 'free') {
      // console.log('**** switchING game mode to FREE ****')

      // set dom status
      Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = false
      Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = true
      Nebyoodle.dom.dailyDetails.classList.remove('show')
    }

    Nebyoodle._refreshUI(Nebyoodle.__getGuesses())
  }

  localStorage.setItem(NEBYOODLE_SETTINGS_KEY, JSON.stringify(settings))

  // console.log('localStorage setting saved!', Nebyoodle.settings)
}

// get a single random valid song from music.nebyoolae.com
Nebyoodle._getSong = async function(songId = null) {
  // console.log('FUNC _getSong()')

  let songIdToFetch = songId
  let getSongResponse = null

  if (Nebyoodle.__getGameMode() == 'daily') {
    // Nebyoodle.myModal = new Modal('temp-api', ' ',
    //   'loading daily script...',
    //   null,
    //   null,
    //   'lds-dual-ring'
    // )

    getSongResponse = await fetch(`${NEBYOODLE_DAILY_SCRIPT}?env=${Nebyoodle.env}`)
    const json = await getSongResponse.json()

    // Nebyoodle.myModal._destroyModal()

    Nebyoodle.__updateDailyDetails(json.index)

    songIdToFetch = json.songId
  }

  // Nebyoodle.myModal = new Modal('temp-api', ' ',
  //   'loading song script...',
  //   null,
  //   null,
  //   'lds-dual-ring'
  // )

  if (songIdToFetch) {
    getSongResponse = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}&songId=${songIdToFetch}`)
  } else {
    getSongResponse = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}`)
  }

  // Nebyoodle.myModal._destroyModal()

  if (getSongResponse) {
    // Nebyoodle.myModal = new Modal('temp-api', ' ',
    //   'loading song script response...',
    //   null,
    //   null,
    //   'lds-dual-ring'
    // )

    const song = await getSongResponse.json()

    // Nebyoodle.myModal._destroyModal()

    if (song.data[0]) {
      // const baseURL = Nebyoodle.env == 'prod' ? NEBYOOCOM_PROD_URL : NEBYOOCOM_LOCAL_URL
      const baseURL = NEBYOOCOM_PROD_URL
      const data = song.data[0]

      // set song data (id, name, album, etc.) for current gameMode
      Nebyoodle.__setSongData(data)

      const randomSongId = data.drupal_internal__nid
      const randomSongName = data.title
      const randomAlbumName = data.field_album_id.name
      const randomAudioUrl = data.field_local_link
        ? `${baseURL}${data.field_local_link.uri.split('internal:')[1]}`
        : ''

      // load song into audio-element
      Nebyoodle.dom.audioElem.src = randomAudioUrl
      Nebyoodle.dom.audioElem.load()

      const title = `${randomSongName} - ${randomAlbumName}`

      // set config.solution
      let solution = false

      if (!Nebyoodle.__getSolution()) {
        solution = await Nebyoodle.__setSolution('string', title)
      } else {
        solution = true
      }

      if (solution) {
        Nebyoodle.__setSongId(randomSongId)
      } else {
        console.error('not able to set config.solution')
      }

      // console.log('Nebyoodle.state.daily', Nebyoodle.__getState('daily'))
      // console.log('Nebyoodle.state.free', Nebyoodle.__getState('free'))

      // console.log('SAVE: end of _getSong()')
      Nebyoodle._saveGame()
    } else {
      console.error('fetched song has invalid data')

      if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

      Nebyoodle.myModal = new Modal('temp', null,
        'Could not load song!',
        null,
        null
      )
    }
  } else {
    console.error('could not fetch song from remote source')
  }
}
// get all valid songs from music.nebyoolae.com
Nebyoodle._getSongs = async function() {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_KEY)

  if (!lsSongData) {
    console.warn('Need to download song data...')

    Nebyoodle.allSongData = []

    Nebyoodle.myModal = new Modal('temp-api', ' ',
      'loading song data...',
      null,
      null,
      'lds-dual-ring'
    )

    const getSongsResponse = await fetch(NEBYOODLE_ALL_SONGS_SCRIPT)
    const songs = await getSongsResponse.json()

    if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

    if (songs && songs.status != 'error') {
      songs.data.forEach((song, index) => {
        const songName = song.title
        const albumName = song.field_album_id.name

        Nebyoodle.allSongData.push({ song: songName, album: albumName })
      })

      localStorage.setItem(NEBYOODLE_SONG_DATA_KEY, JSON.stringify(Nebyoodle.allSongData))

      Nebyoodle.myModal = new Modal('temp', null,
        'Song data loaded',
        null,
        null
      )
    } else {
      Nebyoodle.myModal = new Modal('temp', null,
        'Could not load songs!',
        null,
        null
      )

      console.error('could not fetch songs from remote source')
    }
  } else {
    console.log('Song data loaded (localStorage)!')

    // Nebyoodle.myModal = new Modal('temp', null,
    //   'Song data loaded',
    //   null,
    //   null
    // )

    Nebyoodle.allSongData = JSON.parse(lsSongData)
  }
}

Nebyoodle._getNebyooApps = async function() {
  const response = await fetch(NEBYOOAPPS_SOURCE_URL)
  const json = await response.json()
  const apps = json.body
  const appList = document.querySelector('.nav-list')

  Object.values(apps).forEach(app => {
    const appLink = document.createElement('a')
    appLink.href = app.url
    appLink.innerText = app.title
    appLink.target = '_blank'
    appList.appendChild(appLink)
  })
}
