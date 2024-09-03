/* lib/localStorage */
/* functions to interact with window.localStorage */
/* global Nebyoodle */

// load state from LS -> code model
Nebyoodle._loadGame = async function () {
  /* ************************* */
  /* settings LS -> code       */
  /* ************************* */

  Nebyoodle._loadSettings()

  let dailyCreateOrLoad = ''
  let freeCreateOrLoad = ''

  /* ************************* */
  /* allSongData from LS/API   */
  /* ************************* */

  await Nebyoodle._loadAllSongData()

  /* ************************* */
  /* daily state LS -> code    */
  /* ************************* */

  const lsStateDaily = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_LS_KEY))

  if (lsStateDaily && Object.keys(lsStateDaily).length) {
    const dailyDefaults = NEBYOODLE_DEFAULTS.state.daily

    let i = 0
    lsStateDaily.forEach((lsState) => {
      Nebyoodle.__setState('gameState', lsState.gameState || dailyDefaults.gameState, 'daily', i)
      Nebyoodle.__setState('guesses', lsState.guesses || dailyDefaults.guesses, 'daily', i)
      Nebyoodle.__setState('songId', lsState.songId || dailyDefaults.songId, 'daily', i)

      i++
    })
  }

  /* ************************* */
  /* free state LS -> code     */
  /* ************************* */

  const lsStateFree = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_LS_KEY))

  if (lsStateFree && Object.keys(lsStateFree).length) {
    const freeDefaults = NEBYOODLE_DEFAULTS.state.free

    let i = 0
    lsStateFree.forEach((lsState) => {
      Nebyoodle.__setState('gameState', lsState.gameState || freeDefaults.gameState, 'free', i)
      Nebyoodle.__setState('guesses', lsState.guesses || freeDefaults.guesses, 'free', i)
      Nebyoodle.__setState('songId', lsState.songId || freeDefaults.songId, 'free', i)

      i++
    })
  }

  /* ************************* */
  /* create/load puzzle        */
  /* ************************* */

  // make sure a gameMode is set
  if (!Nebyoodle.settings.gameMode) {
    Nebyoodle.settings.gameMode = NEBYOODLE_DEFAULT_GAMEMODE
  }

  // daily load/create
  if (Nebyoodle.__getGameMode() == 'daily') {
    if (!lsStateDaily) {
      dailyCreateOrLoad = 'create'
    } else {
      /*
        special case for daily song:
        need to check to make sure time hasn't elapsed on saved progress
      */
      try {
        // console.log('FUNC _loadGame(); fetching NEBYOODLE_DAILY_SCRIPT')

        Nebyoodle.myModal = new Modal(
          'temp-api',
          ' ',
          'loading saved daily info...',
          null,
          null,
          'lds-dual-ring'
        )

        const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
        const data = await response.json()

        if (Nebyoodle.myModal) {
          Nebyoodle.myModal._destroyModal()
        }

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

              Nebyoodle.ui._refreshUI(lsDailyGuesses)

              dailyCreateOrLoad = 'load'
            }
            //  no guesses to check, so just load
            else {
              // console.log('DAILY solution not yet guessed; LOAD')

              dailyCreateOrLoad = 'load'
            }
          } else {
            dailyCreateOrLoad = 'load'
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

        Nebyoodle.__setState('guesses', [], 'daily')
        Nebyoodle.__setState('songId', null, 'daily')
      }
    }

    switch (dailyCreateOrLoad) {
      case 'create':
        await Nebyoodle._createNewSolution('daily')

        Nebyoodle._logStatus('[CREATED] /app/game(daily)')

        break
      case 'load':
        await Nebyoodle._loadExistingSolution('daily', Nebyoodle.__getSongId('daily'))

        Nebyoodle._logStatus('[LOADED] /app/game(daily)')

        break
      default:
        console.error('DAILY solution error!', Nebyoodle.__getSongId('daily'))
        break
    }

    Nebyoodle.dom.dailyDetails.classList.add('show')
  }
  // free load/create
  else {
    if (!lsStateFree) {
      freeCreateOrLoad = 'create'
    } else {
      const lsFreeGuesses = Nebyoodle.__getGuesses('free')
      const lsFreeSongId = Nebyoodle.__getSongId('free')

      // if we already have a chosen songId, then we need
      // to check if we have the correct answer already
      if (lsFreeSongId) {
        await Nebyoodle.__setSolution('songId', lsFreeSongId)

        if (lsFreeGuesses.length) {
          Nebyoodle.ui._refreshUI(lsFreeGuesses)
        }

        freeCreateOrLoad = 'load'
      }
      // no chosen song yet, so create new puzzle
      else {
        freeCreateOrLoad = 'create'
      }
    }

    switch (freeCreateOrLoad) {
      case 'create':
        await Nebyoodle._createNewSolution('free', true)

        Nebyoodle._logStatus('[CREATED] /app/game(free)')

        break
      case 'load':
        await Nebyoodle._loadExistingSolution('free', Nebyoodle.__getSongId('free'))

        Nebyoodle._logStatus('[LOADED] /app/game(free)')

        break
      default:
        console.error('FREE solution error!', Nebyoodle.__getSongId('free'))
        break
    }
  }

  if (Nebyoodle.__getState().gameState != 'GAME_OVER') {
    Nebyoodle.modalOpen('readysetguess')
  }

  if (Nebyoodle.settings.firstTime) {
    Nebyoodle.modalOpen('start')
  }

  Nebyoodle._saveGame(Nebyoodle.__getGameMode())
}
// save state from code model -> LS
Nebyoodle._saveGame = function (lsType, src = 'unknown') {
  switch (lsType) {
    case 'daily':
      let curDailyState = Nebyoodle.__getStateObj('daily')

      curDailyState.forEach((sesh) => {
        Object.keys(sesh).forEach((key) => {
          if (sesh[key] === undefined) {
            sesh[key] = null
          }
        })
      })

      localStorage.setItem(NEBYOODLE_STATE_DAILY_LS_KEY, JSON.stringify(curDailyState))

      break

    case 'free':
      let curFreeState = Nebyoodle.__getStateObj('free')

      curFreeState.forEach((sesh) => {
        Object.keys(sesh).forEach((key) => {
          if (sesh[key] === undefined) {
            sesh[key] = null
          }
        })
      })

      localStorage.setItem(NEBYOODLE_STATE_FREE_LS_KEY, JSON.stringify(curFreeState))

      break

    case 'settings':
      localStorage.setItem(NEBYOODLE_SETTINGS_LS_KEY, JSON.stringify(curSettings))

      break
  }

  Nebyoodle._logStatus(`[SAVED] game(${lsType})`, src)
}

// load settings (gear icon) from localStorage
Nebyoodle._loadSettings = function () {
  const lsSettings = JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_LS_KEY))

  if (lsSettings && Object.keys(lsSettings).length) {
    if (lsSettings.darkMode !== undefined) {
      Nebyoodle.settings.darkMode = lsSettings.darkMode

      if (Nebyoodle.settings.darkMode) {
        document.body.classList.add('dark-mode')

        const setting = document.getElementById('button-setting-dark-mode')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }

    if (lsSettings.firstTime !== undefined) {
      Nebyoodle.settings.firstTime = lsSettings.firstTime
    }

    if (lsSettings.gameMode !== undefined) {
      Nebyoodle.settings.gameMode = lsSettings.gameMode
    }
  } else {
    Nebyoodle.modalOpen('start')
  }

  // STATE->GAMEMODE
  if (Nebyoodle.__getGameMode() == 'free') {
    if (Nebyoodle.dom.interactive.gameModeDailyLink) {
      Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = false
    }
    if (Nebyoodle.dom.interactive.gameModeFreeLink) {
      Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = true
    }
    Nebyoodle.dom.dailyDetails.classList.remove('show')
  }

  Nebyoodle._logStatus('[LOADED] /app/ls(settings)')
}
// change a setting (gear icon) value
Nebyoodle._changeSetting = async function (setting, value) {
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
      Nebyoodle.ui._removeModalVestige()

      if (Nebyoodle.__getGameMode() != value) {
        Nebyoodle.ui._disableUI()

        Nebyoodle._saveSetting('gameMode', value)

        Nebyoodle._loadGame(value)
      }

      break
  }

  Nebyoodle._saveGame('settings', '_changeSetting')
}
// save a setting (gear icon) to localStorage
Nebyoodle._saveSetting = function (setting, value) {
  const settings = JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_LS_KEY))

  if (settings) {
    // set internal code model
    Nebyoodle.settings[setting] = value

    // set temp obj that will go to LS
    settings[setting] = value

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

      Nebyoodle.ui._refreshUI(Nebyoodle.__getGuesses())
    }

    localStorage.setItem(NEBYOODLE_SETTINGS_LS_KEY, JSON.stringify(settings))

    // Nebyoodle._logStatus(`[SAVED] setting(${setting}, ${value})`)
  } else {
    console.error('could not parse local storage key', NEBYOODLE_SETTINGS_LS_KEY)
  }
}

// check for song data, and load it appropriately
Nebyoodle._loadAllSongData = async function () {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_LS_KEY)

  if (lsSongData) {
    Nebyoodle.allSongData = JSON.parse(lsSongData)
  } else {
    await Nebyoodle._getSongs()
  }
}
// get a single random valid song from music.nebyoolae.com
Nebyoodle._getSong = async function (songId = null) {
  let songIdToFetch = songId
  let getSongResponse = null

  if (Nebyoodle.__getGameMode() == 'daily') {
    getSongResponse = await fetch(`${NEBYOODLE_DAILY_SCRIPT}?env=${Nebyoodle.env}`)
    const json = await getSongResponse.json()

    Nebyoodle.__updateDailyDetails(json.index)

    songIdToFetch = json.songId
  }

  if (songIdToFetch) {
    // console.log('getting song: existing id:', songIdToFetch)

    getSongResponse = await fetch(
      `${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}&songId=${songIdToFetch}`
    )
  } else {
    // console.log('getting song: new id')

    getSongResponse = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}`)
  }

  if (getSongResponse) {
    const song = await getSongResponse.json()

    if (song.data[0]) {
      const baseURL = NEBYOOCOM_PROD_URL
      const data = song.data[0]

      // set song data (id, name, album, etc.) for current gameMode
      Nebyoodle.__setConfig('songData', data, Nebyoodle.__getGameMode())

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
        Nebyoodle.__setState('songId', randomSongId, Nebyoodle.__getGameMode())
      } else {
        console.error('not able to set config.solution')
      }

      Nebyoodle._saveGame(Nebyoodle.__getGameMode())
    } else {
      console.error('fetched song has invalid data')

      if (Nebyoodle.myModal) {
        Nebyoodle.myModal._destroyModal()
      }

      Nebyoodle.myTempModal = new Modal('temp', null, 'Could not load song!', null, null)
    }
  } else {
    console.error('could not fetch song from remote source')
  }
}
// get all valid songs from music.nebyoolae.com
Nebyoodle._getSongs = async function () {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_LS_KEY)

  if (!lsSongData) {
    console.warn('Need to download song data...')

    Nebyoodle.allSongData = []

    Nebyoodle.myTempModal = new Modal(
      'temp-api',
      ' ',
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

      localStorage.setItem(NEBYOODLE_SONG_DATA_LS_KEY, JSON.stringify(Nebyoodle.allSongData))

      Nebyoodle.myTempModal = new Modal('temp', null, 'Song data loaded', null, null)
    } else {
      Nebyoodle.myModal = new Modal(
        'perm',
        null,
        'Could not load song data! Please try refreshing your browser.',
        null,
        null
      )

      console.error('could not fetch songs from remote source')
    }
  } else {
    // console.log('Song data loaded (localStorage)!')

    // Nebyoodle.myModal = new Modal('temp', null,
    //   'Song data loaded',
    //   null,
    //   null
    // )

    Nebyoodle.allSongData = JSON.parse(lsSongData)
  }
}
