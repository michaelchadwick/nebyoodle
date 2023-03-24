/* main */
/* app entry point and main functions */
/* global Nebyoodle */

// global check to see if we've shown this already
// once we show it, we toggle this until the next
// time that the app is loaded
Nebyoodle.showStartModal = true

// settings: web app global settings saved between sessions in LOCAL STORAGE
Nebyoodle.settings = {}

// state: game data saved between sessions LOCAL STORAGE
Nebyoodle.state = {}
Nebyoodle.state.daily = {}
Nebyoodle.state.free = {}

// config: only saved while game is loaded
Nebyoodle.allSongData = []
Nebyoodle.config = {}
Nebyoodle.config.daily = NEBYOODLE_DEFAULTS.config.daily
Nebyoodle.config.free = NEBYOODLE_DEFAULTS.config.free

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
async function modalOpen(type, data = null) {
  let modalText = ''

  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Play Nebyoodle',
        `
          <p>Listen to the intro of a Nebyoolae song, and then find the correct title/album in the list.</p>

          <p>Skipped or incorrect attempts unlock more of the song.</p>

          <p>Answer in as few tries as possible and share your score!</p>

          <h4>Daily</h4>
          <p>One new song to guess each day.</p>

          <h4>Free</h4>
          <p>Keep guessing as many songs as you want! Go for the longest combo!</p>

          <hr />

          <p><strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>.</p>
        `,
        null,
        null
      )
      break

    case 'stats':
      // let dailyWins = 0
      // let dailyTotal = 0
      // let dailyStreakCur = 0
      // let dailyStreakBroken = false
      // let dailyStreakMax = 0
      // let dailyStreakMaxBest = 0

      // Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex()].statistics.map(stat => {
      //   if (stat.score > 0) {
      //     dailyWins += 1
      //   }

      //   dailyTotal += 1
      // })

      // Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex()].statistics.slice(0).reverse().map(stat => {
      //   if (stat.score > 0) {
      //     if (!dailyStreakBroken) {
      //       dailyStreakCur += 1
      //     }
      //     dailyStreakMax += 1
      //     dailyStreakMaxBest = dailyStreakMax
      //   } else {
      //     dailyStreakCur = 0
      //     dailyStreakBroken = true
      //     dailyStreakMax = 0
      //   }
      // })

      // let freeWins = 0
      // let freeTotal = 0
      // let freeStreakCur = 0
      // let freeStreakBroken = false
      // let freeStreakMax = 0
      // let freeStreakMaxBest = 0

      // Nebyoodle.state.free[Nebyoodle.__getLastPlayIndex()].statistics.map(stat => {
      //   if (stat.score > 0) {
      //     freeWins += 1
      //   }

      //   freeTotal += 1
      // })

      // Nebyoodle.state.free[Nebyoodle.__getLastPlayIndex()].statistics.slice(0).reverse().map(stat => {
      //   if (stat.score > 0) {
      //     if (!freeStreakBroken) {
      //       freeStreakCur += 1
      //     }

      //     freeStreakMax += 1
      //     freeStreakMaxBest = freeStreakMax
      //   } else {
      //     freeStreakCur = 0
      //     freeStreakBroken = true
      //     freeStreakMax = 0
      //   }
      // })

      modalText = `
        <div class="container">

          <div class="statistic-header">Daily</div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">N/A</div>
              <div class="statistic-label"></div>
            </div>
          </div>

          <div class="statistic-header">Free Play</div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">N/A</div>
              <div class="statistic-label"></div>
            </div>
          </div>
        </div>
      `
      this.myModal = new Modal('perm', 'Statistics (TODO)',
        modalText,
        null,
        null,
        false
      )
      break

    case 'win':
      modalText = `
        <div class="container">
      `
      modalText += await Nebyoodle._getWinMarkup(data)
      modalText += `
          <div class="share">
            <button class="share" onclick="Nebyoodle._shareResults()">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>
      `

      this.myModal = new Modal('perm', 'Win',
        modalText,
        null,
        null,
        false
      )
      break

    case 'settings':
      this.myModal = new Modal('perm', 'Settings',
        `
          <div id="settings">
            <!-- dark mode -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Dark Mode</div>
                <div class="description">Change colors to better suit low light</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-dark-mode"
                    data-status=""
                    class="switch"
                    onclick="Nebyoodle._changeSetting('darkMode')"
                  >
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        null,
        null
      )


      Nebyoodle._loadSettings()

      break

    case 'get-song':
      Nebyoodle._getSong()
      break

    case 'get-songs':
      Nebyoodle._getSongs()
      break

    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Game Config (code model only)',
        Nebyoodle._displayGameConfig(),
        null,
        null
      )
      break

    case 'show-state':
      this.myModal = new Modal('perm-debug', 'Game State (load/save to LS)',
        Nebyoodle._displayGameState(),
        null,
        null
      )
      break

    case 'show-solution':
      this.myModal = new Modal('perm-debug', 'Correct Solution',
        Nebyoodle._displayGameSolution(),
        null,
        null
      )
      break

    case 'shared':
      this.myModal = new Modal('temp', null,
        'Results copied to clipboard',
        null,
        null
      )
      break
    case 'no-clipboard-access':
      this.myModal = new Modal('temp', null,
        'Sorry, but access to clipboard not available',
        null,
        null
      )
      break

    case 'win-game':
      this.myModal = new Modal('temp', null,
        'Congratulations!',
        null,
        null
      )
      break

    case 'win-game-hax':
      this.myModal = new Modal('temp', null,
        'Hacking the game, I see',
        null,
        null
      )
      break
  }
}

// start the engine
Nebyoodle.initApp = async () => {
  // console.log('Nebyoodle init started')

  // set env
  Nebyoodle.env = document.location.hostname == NEBYOODLE_ENV_PROD_URL ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (Nebyoodle.env == 'local') {
    Nebyoodle._initDebug()

    document.title = '(LH) ' + document.title
  }

  // attach event listeners to DOM elements
  Nebyoodle._attachEventListeners()

  // load localStorage game state
  Nebyoodle._loadGame()

  // get global nebapps
  Nebyoodle._getNebyooApps()

  // console.log('Nebyoodle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// load state/statistics from LS -> code model
Nebyoodle._loadGame = async function() {
  /* ************************* */
  /* settings LS -> code       */
  /* ************************* */
  Nebyoodle._loadSettings()

  /* ************************* */
  /* allSongData from LS       */
  /* ************************* */
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_KEY)

  if (lsSongData) {
    Nebyoodle.allSongData = JSON.parse(lsSongData)
  }

  let dailyCreateOrLoad = ''
  let freeCreateOrLoad = ''

  /* ************************* */
  /* TODO: daily state LS -> code    */
  /* ************************* */

  const lsStateDaily = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY))

  // if we have previous daily LS values, sync them to code model
  if (lsStateDaily) {
    Nebyoodle.state.daily = lsStateDaily

    const dailySolution = Nebyoodle.config.daily[Nebyoodle.__getLastPlayIndex('daily')].solution

    // console.log('DAILY state loaded from LS')

  //   // special case for daily song: need to check
  //   // to make sure time hasn't elapsed on saved progress
  //   try {
  //     console.log('_loadGame->fetching NEBYOODLE_DAILY_SCRIPT')

  //     const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
  //     const data = await response.json()
  //     const dailySong = data['song']

  //     // saved song and daily song are the same? still working on it
  //     if (dailySong == lsStateDaily.songId) {
  //       Nebyoodle.state.daily = lsStateDaily
  //       Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex()].guesses = lsStateDaily.guesses
  //       Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex()].songId = lsStateDaily.songId

  //       console.log(`Song for ${Nebyoodle.__getTodaysDate()}:`, dailySong)

  //       dailyCreateOrLoad = 'load'
  //     }
  //     // time has elapsed on daily puzzle, and new one is needed
  //     else {
  //       console.log('LS song and dailySong do not match, so create new puzzle')

  //       Nebyoodle.state.daily.gameState = 'IN_PROGRESS'
  //       Nebyoodle.state.daily.guesses = []

  //       console.log('SAVE 1: _loadGame() after checking on dailySong')
  //       Nebyoodle._saveGame()

  //       dailyCreateOrLoad = 'create'
  //     }

  //     Nebyoodle.__updateDailyDetails(data['index'])
  //   } catch (e) {
  //     console.error('could not get daily song', e)
  //   }
  } else {
    Nebyoodle.state.daily = NEBYOODLE_DEFAULTS.state.daily

    // console.log('DAILY localStorage state key NOT found; defaults set')
    // console.log('DAILY solution to be created with daily song')

    dailyCreateOrLoad = 'create'
  }

  /* ************************* */
  /* free state LS -> code     */
  /* ************************* */

  const lsStateFree = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_KEY))

  // if we have previous free LS values, sync them to code model
  if (lsStateFree) {
    Nebyoodle.state.free = lsStateFree

    const lsFreeGuesses = Nebyoodle.__getGuesses('free')
    const lsFreeSongId = Nebyoodle.__getSongId('free')

    // if we already have a chosen songId, then we need
    // to check if we have the correct answer already
    if (lsFreeSongId) {
      console.log('FREE solution already chosen', lsFreeSongId)

      // load answer from songId and set to solution
      await Nebyoodle.__setSolution('songId', lsFreeSongId)

      // if we already have previous guesses, check for correct answer
      if (lsFreeGuesses.length) {
        console.log('FREE existing guesses found')

        const answers = lsFreeGuesses.map(g => g.answer)

        console.log('answers', answers)

        // grab solution as title
        const freeSolution = Nebyoodle.__getSolution('free')

        console.log('freeSolution', freeSolution)

        // if answer has already been found, skip to win animation
        if (answers.includes(freeSolution)) {
          Nebyoodle._refreshUI(lsFreeGuesses)

          modalOpen('win')
        }
        // otherwise, populate UI with current guesses
        else {
          console.log('correct answer not found, so keep playing')

          Nebyoodle._refreshUI(lsFreeGuesses)

          freeCreateOrLoad = 'load'
        }
      } else {
        console.log('FREE no previous guesses found')

        freeCreateOrLoad = 'load'
      }
    }
    // no chosen song yet, so create new puzzle
    else {
      console.log('FREE solution not yet chosen; CREATE')

      freeCreateOrLoad = 'create'
    }
  }
  // no existing state found, so create with defaults
  else {
    Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

    console.log('FREE localStorage state key NOT found; defaults set')
    console.log('FREE solution to be randomly chosen')

    freeCreateOrLoad = 'create'
  }

  /* ********************** */
  /* create/load solution   */
  /* ********************** */

  // daily mode
  if (Nebyoodle.__getGameMode() == 'daily') {
    console.log('TODO: create/load daily solution')

    // Nebyoodle.dom.dailyDetails.classList.add('show')

    // if (dailyCreateOrLoad == 'load') {
    //   await Nebyoodle._loadExistingSolution('daily', Nebyoodle.__getSongId('daily'))
    // } else {
    //   await Nebyoodle._createNewSolution('daily')
    // }

    // console.log('DAILY solution loaded!', Nebyoodle.__getSongId('daily'))
  }
  // free mode
  else {
    if (freeCreateOrLoad == 'load') {
      await Nebyoodle._loadExistingSolution('free', Nebyoodle.__getSongId('free'))
    } else if (freeCreateOrLoad == 'create') {
      await Nebyoodle._createNewSolution('free')
    }
  }

  console.log('SAVE 2: end of _loadGame()')
  Nebyoodle._saveGame()
}

// on refresh of site and saved data found, refresh UI
Nebyoodle._refreshUI = function(lsFreeGuesses) {
  lsFreeGuesses.forEach((guessObject, index) => {
    const guess = guessObject.answer

    switch (guess) {
      case '':
        Nebyoodle._updateStatus('skipped', null, index)

        break
      default:
        const solution = Nebyoodle.__getSolution()

        // console.log('_loadGame: solution', solution)

        if (guess == solution) {
          Nebyoodle._updateStatus('correct', guess, index)
        } else {
          Nebyoodle._updateStatus('wrong', guess, index)
        }

        break
    }
  })
}

// save game state/settings from code model -> LS
Nebyoodle._saveGame = function() {
  // console.log('saving game state and global settings to localStorage...')

  // save daily game state
  try {
    localStorage.setItem(NEBYOODLE_STATE_DAILY_KEY, JSON.stringify(Nebyoodle.state.daily))

    // console.log('DAILY localStorage state saved!', JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY)))
  } catch(error) {
    console.error('localStorage DAILY state save failed', error)
  }

  // save free game state
  try {
    localStorage.setItem(NEBYOODLE_STATE_FREE_KEY, JSON.stringify(Nebyoodle.state.free))

    // console.log('FREE localStorage state saved!', JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_KEY)))
  } catch(error) {
    console.error('localStorage FREE state save failed', error)
  }

  // save global game settings
  try {
    localStorage.setItem(NEBYOODLE_SETTINGS_KEY, JSON.stringify(Nebyoodle.settings))

    // console.log('localStorage settings saved!', JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_KEY)))
  } catch(error) {
    console.error('localStorage global settings save failed', error)
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
    case 'gameMode':
      switch (value) {
        case 'daily':
          // console.log('**** switchING game mode to DAILY ****')

          // get song for today
          if (!Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex()].songId) {
            try {
              // console.log('_changeSetting->fetching NEBYOODLE_DAILY_SCRIPT')

              const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
              const data = await response.json()

              Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex()].songId = data['song']

              Nebyoodle.__updateDailyDetails(data['index'])
            } catch (e) {
              console.error('could not get daily song', e)
            }
          }

          Nebyoodle._saveSetting('gameMode', 'daily')

          Nebyoodle.dom.interactive.btnCreateNew.disabled = true

          // set dom status
          Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = true
          Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = false
          Nebyoodle.dom.dailyDetails.classList.add('show')

          await Nebyoodle._loadExistingSolution('daily', Nebyoodle.__getSongId('daily'))

          console.log('SAVE 3a: _changeSetting() after switching gameMode to daily')
          Nebyoodle._saveGame()

         //  console.log('**** switchED game mode to DAILY ****')

          break

        case 'free':
          // console.log('**** switchING game mode to FREE ****')

          Nebyoodle._saveSetting('gameMode', 'free')

          Nebyoodle.dom.interactive.btnCreateNew.disabled = false

          // set dom status
          Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = false
          Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = true
          Nebyoodle.dom.dailyDetails.classList.remove('show')

          await Nebyoodle._loadExistingSolution('free', Nebyoodle.__getSongId('free'))

          console.log('SAVE 3b: _changeSetting() after switching gameMode to free')
          Nebyoodle._saveGame()

          // console.log('**** switched game mode to FREE ****')

          break
      }

      break

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

  localStorage.setItem(NEBYOODLE_SETTINGS_KEY, JSON.stringify(settings))

  // console.log('localStorage setting saved!', Nebyoodle.settings)
}

// add debug stuff if local
Nebyoodle._initDebug = function() {
  // if debug buttons are in template
  if (Nebyoodle.dom.interactive.debug.all) {
    // show debug buttons
    Nebyoodle.dom.interactive.debug.all.style.display = 'flex'
    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll('button.icon').forEach((btn) => {
      btn.style.fontSize = '16px'
    })
  }

  let qd = {}

  if (location.search) location.search.substr(1).split("&").forEach(function(item) {
    let s = item.split("="),
        k = s[0],
        v = s[1] && decodeURIComponent(s[1]); // null-coalescing / short-circuit
    //(k in qd) ? qd[k].push(v) : qd[k] = [v]
    (qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
  })

  if (qd.debugCSS && qd.debugCSS == 1) {
    let debugStyles = document.createElement('link')

    debugStyles.rel = 'stylesheet'
    debugStyles.href = './assets/css/debug.css'
    document.head.appendChild(debugStyles)
  }
}

// create new solution, which resets progress
Nebyoodle._createNewSolution = async function(gameMode) {
  console.log(`**** creatING new '${gameMode}' solution ****`)

  // set state to defaults
  Nebyoodle.state[gameMode] = NEBYOODLE_DEFAULTS.state[gameMode]

  // get random song
  Nebyoodle._getSong()
}

// load existing solution, which retains past progress
Nebyoodle._loadExistingSolution = async function(gameMode) {
  const songId = Nebyoodle.__getSongId(gameMode)

  console.log(`**** loadING existing '${gameMode}' solution ****`, songId)

  Nebyoodle._getSong(songId)
}

// ask to create new free gamemode puzzle
Nebyoodle._confirmFreeCreateNew = async function() {
  const myConfirm = new Modal('confirm', 'Create New Puzzle?',
    'Are you <strong>sure</strong> you want to create a new puzzle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    const confirmed = await myConfirm.question()

    if (confirmed) {
      Nebyoodle._resetFreeProgress()
      await Nebyoodle._createNewSolution('free')
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// reset config, state, and LS for free play
Nebyoodle._resetFreeProgress = async function() {
  console.log('resetting free play progress...')

  // set config and state to defaults
  Nebyoodle.config.free = NEBYOODLE_DEFAULTS.config.free
  Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

  // save those defaults to localStorage
  console.log('SAVE 4: _resetFreeProgress()')
  Nebyoodle._saveGame()
}

Nebyoodle._disableUI = function() {
  Object.values(Nebyoodle.dom.mainUI).forEach(elem => {
    if (elem.id !== 'button-play-pause-icon') {
      elem.setAttribute('disabled', '')
    }
  })
}

Nebyoodle._enableUI = function() {
  Object.values(Nebyoodle.dom.mainUI).forEach(elem => {
    if (elem.id !== 'button-play-pause-icon' && elem.id !== 'button-submit') {
      elem.removeAttribute('disabled')
      elem.classList.remove('disabled')
    }
  })
}

// get a single random valid song from music.nebyoolae.com
Nebyoodle._getSong = async function(songId = null) {
  // add loading animation until fetch is done
  Nebyoodle.dom.songData.innerHTML = ''
  Nebyoodle.dom.songData.classList.add('show')
  Nebyoodle.dom.songData.classList.add('lds-dual-ring')

  let temp = null
  let response = null

  if (songId) {
    response = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}&songId=${songId}`)
  } else {
    response = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}`)
  }

  if (response) {
    const song = await response.json()

    if (song.data[0]) {
      Nebyoodle.dom.songData.classList.remove('lds-dual-ring')

      // const baseURL = Nebyoodle.env == 'prod' ? NEBYOOCOM_PROD_URL : NEBYOOCOM_LOCAL_URL
      const baseURL = NEBYOOCOM_PROD_URL
      const data = song.data[0]

      // console.log('data', data)

      Nebyoodle.__setSongData(data)

      const randomSongId = data.drupal_internal__nid
      const randomSongName = data.title
      const randomAlbumName = data.field_album_id.name
      const randomAudioUrl = data.field_local_link
        ? `${baseURL}${data.field_local_link.uri.split('internal:')[1]}`
        : ''

      Nebyoodle.dom.songData.innerHTML = Nebyoodle._getWinMarkup(data)

      // load song into audio-element
      Nebyoodle.dom.audioElem.src = randomAudioUrl
      Nebyoodle.dom.audioElem.load()

      // add song to config.solution
      Nebyoodle.__setSolution('string', `${randomSongName} - ${randomAlbumName}`)

      // add randomSongId to state.songId
      console.log('SAVE 5: end of _getSong()')
      Nebyoodle.__setSongId(randomSongId)
      Nebyoodle._saveGame()
    } else {
      console.error('fetched song has invalid data')

      Nebyoodle.dom.songData.classList.remove('lds-dual-ring')
      Nebyoodle.dom.songData.innerHTML = `got song, but it's wonky :(`
    }
  } else {
    console.error('could not fetch song from remote source')

    Nebyoodle.dom.songData.classList.remove('lds-dual-ring')
    Nebyoodle.dom.songData.innerHTML = 'could not get song :('
  }
}

// get all valid songs from music.nebyoolae.com
Nebyoodle._getSongs = async function() {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_KEY)

  if (!lsSongData) {
    this.myModal = new Modal('temp-api', null,
      'Please wait for song data from Nebyoolae Music to be loaded...',
      null,
      null
    )

    Nebyoodle.allSongData = []

    const response = await fetch(NEBYOODLE_SONGS_SCRIPT)
    const songs = await response.json()

    if (songs && songs.status != 'error') {
      songs.data.forEach((song, index) => {
        const songName = song.title
        const albumName = song.field_album_id.name

        Nebyoodle.allSongData.push({ song: songName, album: albumName })
      })



      localStorage.setItem(NEBYOODLE_SONG_DATA_KEY, JSON.stringify(Nebyoodle.allSongData))

      this.myModal._destroyModal()
    } else {
      this.myModal._destroyModal()

      this.myModal = new Modal('temp', null,
        'Could not load songs!',
        null,
        null
      )

      console.error('could not fetch songs from remote source')
    }
  } else {
    this.myModal = new Modal('temp', null,
      'Song data already loaded',
      null,
      null
    )

    Nebyoodle.allSongData = JSON.parse(lsSongData)
  }
}

// modal: debug: display Nebyoodle.config
Nebyoodle._displayGameConfig = function() {
  const configs = Nebyoodle.config

  let html = ''

  html += `<h3>GLOBAL (ENV: ${Nebyoodle.env})</h3>`
  html += '<h3>----------------------------</h3>'

  html += '<dl>'

  Object.keys(configs).forEach(config => {
    html += `<h4>CONFIG: ${config}</h4>`

    configs[config].forEach(configObject => {
      html += `<dd><code>${config}: {</code><dl>`

      Object.keys(configObject).forEach(key => {
        const label = key
        const value = configObject[key]

        html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
      })

      html += '</dl><code>}</code></dd>'
    })

    // console.log(`Nebyoodle.__getSolution()`, Nebyoodle.__getSolution())
  })

  html += '</dl>'

  return html
}
// modal: debug: display Nebyoodle.state
Nebyoodle._displayGameState = function() {
  const states = Nebyoodle.state

  let html = ''

  html += '<dl>'

  Object.keys(states).forEach(state => {
    html += `<h4>STATE: ${state}</h4>`

    Object.keys(states[state][0]).forEach(key => {
      const value = states[state][0][key]

      if (typeof value == 'object'
        && !Array.isArray(value)
        && value != null
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        if (key == 'statistics') {
          Object.keys(states[state][key]).forEach(subkey => {
            value = states[state][key][subkey]

            html += `<dd><code>${subkey}:</code></dd><dt>${value}</dt>`
          })

          html += '</dl><code>}</code></dd>'
        }
        else {
          Object.keys(states[state][key]).forEach(subkey => {
            value = states[state][key][subkey]

            if (subkey == 'lastCompletedTime' || subkey == 'lastPlayedTime') {
              value = Nebyoodle.__getFormattedDate(new Date(value))
            }

            if (value) {
              html += `<dd><code>${subkey}:</code></dd><dt>${value.join(', ')}</dt>`
            }
          })

          html += '</dl><code>}</code></dd>'
        }
      } else {
        // special cases
        if (key == 'lastCompletedTime' || key == 'lastPlayedTime') {
          if (value) {
            value = Nebyoodle.__getFormattedDate(new Date(value))
          }
        } else {
          html += `<dd><code>${key}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += '</dl>'

  return html
}

Nebyoodle._getWinMarkup = async function() {
  // const baseURL = Nebyoodle.env == 'prod' ? NEBYOOCOM_PROD_URL : NEBYOOCOM_LOCAL_URL
  const baseURL = NEBYOOCOM_PROD_URL

  let data = Nebyoodle.__getSongData()

  if (!data) {
    const response = await fetch(`${NEBYOODLE_SONGID_SCRIPT}?songId=${Nebyoodle.__getSongId()}`)
    const json = await response.json()

    data = json.data[0]
  }

  // console.log('_getWinMarkup', data)

  const songId = data.drupal_internal__nid
  const songName = data.title
  const songPath = data.path.alias
  const songLink = `${baseURL}${songPath}`

  const artistName = data.field_artist_id.name
  const artistLink = `${baseURL}/artist/${artistName.toLowerCase()}`

  const albumName = data.field_album_id.name
  const albumNameInternal = data.field_album_id.path.alias.split('/album/')[1].replaceAll('-','_')
  const albumPath = data.field_album_id.path.alias
  const albumLink = `${baseURL}${albumPath}`
  const albumCoverFull = `${baseURL}${data.field_album_id.field_album_cover.uri.url}`.split('files/')
  const albumCoverSmall = albumCoverFull[0] + 'files/nebyoodle/' + albumNameInternal + '.jpg'

  const duration = new Date(data.field_duration * 1000).toISOString().slice(14,19)
  const released = data.field_release_date
  const description = new DOMParser().parseFromString(data.body, "text/html").body.textContent

  // html markup to display
  let html = ''
  html += `<div class="song-win-block">`
  html += `\t<div class='song-main'>`
  html += `\t\t<a href="${albumLink}" target="_blank">`
  html += `\t\t\t<img src="${albumCoverSmall}" />`
  html += `\t\t</a>`
  html += `\t\t<div class='song-main-text'>`
  html += `\t\t\t<div><strong>Title</strong>: <a href="${songLink}" target="_blank">${songName}</a></div>`
  html += `\t\t\t<div><strong>Artist</strong>: <a href="${artistLink}">${artistName}</a></div>`
  html += `\t\t\t<div><strong>Album</strong>: <a href="${albumLink}" target="_blank">${albumName}</a></div>`
  html += `\t\t\t<div><strong>Duration</strong>: ${duration}</div>`
  html += `\t\t\t<div><strong>Released</strong>: ${released}</div>`
  html += `\t\t</div>`
  html += `\t</div>`
  html += `\t<div class='song-misc'>`
  html += `\t\t${description}`
  html += `\t</div>`
  html += `</div>`

  return html
}

/*************************************************************************
 * public event handler methods *
 *************************************************************************/

// handle duration of audio element
Nebyoodle._handleAudioDuration = function(event) {
  const currentTime = event.target.currentTime
  const durationMax = Nebyoodle.__getDurationMax()
  const durVal = NEBYOODLE_DUR_PCT[Nebyoodle.__getGuesses().length]
  const fillVal = (currentTime / durationMax) * durVal

  Nebyoodle.dom.timelinePlayed.setAttribute('fill', fillVal)
  Nebyoodle.dom.timelinePlayed.style.transform = `scaleX(${fillVal})`
  Nebyoodle.dom.playSeconds.innerText = Math.floor(currentTime).toString().padStart(2, '0')

  if (currentTime >= durationMax) {
    // console.log('durationMax reached. stopping audio', this)

    // "stop" the audio, i.e. pause and reset back to beginning
    Nebyoodle.dom.audioElem.pause()
    Nebyoodle.dom.audioElem.currentTime = 0
    Nebyoodle._togglePlayPauseButton()
  }
}

// handle both clicks and touches outside of modals
Nebyoodle._handleClickTouch = function(event) {
  const dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    const isConfirm = dialog.classList.contains('modal-confirm')
    const isTempApi = dialog.classList.contains('temp-api')

    // only close if not a confirmation (and not a special temp-api)!
    if (event.target == dialog && !isConfirm && !isTempApi) {
      dialog.remove()
    }
  }

  if (event.target == Nebyoodle.dom.navOverlay) {
    Nebyoodle.dom.navOverlay.classList.toggle('show')
  }
}

Nebyoodle._handlePlayButton = function() {
  if (Nebyoodle.dom.audioElem.paused) {
    Nebyoodle._playAudio()
  } else {
    Nebyoodle.dom.audioElem.pause()
    Nebyoodle.dom.audioElem.currentTime = 0
    Nebyoodle._togglePlayPauseButton()
  }
}

Nebyoodle._handleGuessInput = function(event) {
  const value = event.target.value

  if (value == '') {
    Nebyoodle.dom.mainUI.btnSubmit.setAttribute('disabled', 'true')
    Nebyoodle.dom.mainUI.guessResult.style.display = 'none'
    Nebyoodle.dom.mainUI.guessResultCounter.innerHTML = 'No results yet'
  } else {
    Nebyoodle.dom.mainUI.guessResultList.innerHTML = ''

    const terms = Nebyoodle.__autocompleteMatch(value)

    let list = ''

    Nebyoodle.dom.mainUI.guessResultCounter.innerHTML = `${terms.length} results found for '${value}'.`

    for (i = 0; i < terms.length; i++) {
      list += '<li><strong>' + terms[i].song + '</strong> - ' + terms[i].album + '</strong></li>'
    }

    Nebyoodle.dom.mainUI.btnGuessClear.style.display = 'block'
    Nebyoodle.dom.mainUI.guessResult.style.display = 'block'
    Nebyoodle.dom.mainUI.guessResultList.innerHTML = list
  }
}

Nebyoodle._handleGuessList = function(event) {
  let elem = null

  if (event.target.computedRole == 'strong') {
    elem = event.target.parentElement
  } else {
    elem = event.target
  }

  const choiceText = new DOMParser().parseFromString(elem.innerHTML, 'text/html').body.textContent

  Nebyoodle.dom.mainUI.guessInput.value = choiceText

  Nebyoodle.dom.mainUI.guessResult.style.display = 'none'

  Nebyoodle.dom.mainUI.btnSubmit.removeAttribute('disabled')
}



Nebyoodle._clearGuess = function() {
  Nebyoodle.dom.mainUI.guessInput.value = ''
  Nebyoodle.dom.mainUI.btnGuessClear.style.display = 'none'
  Nebyoodle.dom.mainUI.guessResult.style.display = 'none'
  Nebyoodle.dom.mainUI.btnSubmit.setAttribute('disabled', true)
}

Nebyoodle._togglePlayPauseButton = function() {
  if (Nebyoodle.dom.mainUI.btnPlayPauseIcon.classList.contains('fa-pause')) {
    Nebyoodle.dom.mainUI.btnPlayPauseIcon.classList.remove('fa-pause')
    Nebyoodle.dom.mainUI.btnPlayPauseIcon.classList.add('fa-play')
  } else {
    Nebyoodle.dom.mainUI.btnPlayPauseIcon.classList.remove('fa-play')
    Nebyoodle.dom.mainUI.btnPlayPauseIcon.classList.add('fa-pause')
  }
}

// copy results to clipboard for sharing
Nebyoodle._shareResults = async function() {
  const mode = Nebyoodle.__getGameMode()

  let shareText = Nebyoodle.__getShareText(mode)

  if (navigator.canShare) {
    navigator.share({ text: shareText })

    modalOpen('shared')
  } else {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        modalOpen('shared')
      }).catch(() => {
        console.error('could not copy text to clipboard')

        modalOpen('no-clipboard-access')

        return
      })

      // const canWrite = await navigator.permissions.query({ name: 'clipboard-write' })

      // if (canWrite.state == 'granted') {
      //   navigator.clipboard.writeText(shareText).then(() => {
      //     modalOpen('shared')
      //   }).catch(() => console.error('could not copy text to clipboard'))
      // } else {
      //   console.warn('clipboard access was denied')

      //   modalOpen('no-clipboard-access')
      // }
    } else {
      console.warn('no sharing or clipboard access available')

      modalOpen('no-clipboard-access')

      return
    }
  }
}

// play audio from beginning to durationMax
Nebyoodle._playAudio = async function() {
  try {
    // console.log('trying to play audioElem', Nebyoodle.dom.audioElem.src)

    Nebyoodle._togglePlayPauseButton()

    Nebyoodle.dom.audioElem.play()
  } catch (err) {
    console.error('could not play audioElem')

    Nebyoodle._togglePlayPauseButton()
  }
}

// debug: beat game to check win state
Nebyoodle._winGame = function(state = null) {
  const solution = Nebyoodle.__getSolution()

  modalOpen('win-game-hax')

  console.log('HAX! Winning game immediately...')

  // set to winning
  const now = new Date().getTime()
  Nebyoodle.state[Nebyoodle.__getGameMode()] = [
    {
      gameState: 'GAME_OVER',
      guesses: [
        {
          answer: solution,
          isCorrect: true,
          isSkipped: false
        }
      ]
    }
  ]

  console.log('SAVE 6: _winGame() debuggery')
  Nebyoodle._saveGame()

  Nebyoodle._checkWinState()
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

// submit guess with blank
Nebyoodle._handleSkipButton = function() {
  // submit blank guess
  Nebyoodle._submitGuess()
}

// submit guess with text
Nebyoodle._handleSubmitButton = function() {
  const guess = Nebyoodle.dom.mainUI.guessInput.value

  // submit actual guess
  Nebyoodle._submitGuess(guess)
}

// submit a guess if game still IN_PROGRESS
Nebyoodle._submitGuess = function(guess = '') {
  if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
    Nebyoodle._checkWinState(guess)
  } else {
    console.error('current game is over -- no more guesses!')
  }
}

// check latest guess to see if correct and if game is won
Nebyoodle._checkWinState = function(guess = null) {
  const solution = Nebyoodle.__getSolution()

  // console.log(`_checkWinState: guess: '${guess}', solution: '${solution}'`)

  if (solution) {
    // guess was skipped
    if (!guess) {
      // console.log('_checkWinState: SKIP')

      // add blank guess for skip
      Nebyoodle.__addGuess({
        answer: '',
        isCorrect: false,
        isSkipped: true
      })

      // update skip button and audio file durationMax, if necessary
      Nebyoodle._updateStatus('skipped', null)

      // save to local storage
      console.log('SAVE 7a: _checkWinState() adding skip')
      Nebyoodle._saveGame()

      return false
    }
    // guess is correct and game has been won
    else if (guess == solution) {
      // console.log('_checkWinState: CORRECT')

      // add guess (actual guess if submit, '' if skip)
      Nebyoodle.__addGuess({
        answer: guess,
        isCorrect: true,
        isSkipped: false
      })

      console.log('game won!')

      // set state stuff
      if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
        // make sure to only increment wins if we are going from
        // IN_PROGRESS -> GAME_OVER (ignores page refreshes)
        Nebyoodle.__setGameState('GAME_OVER')

        // clear the lookup input
        Nebyoodle._clearGuess()

        // update skip button and audio file durationMax, if necessary
        Nebyoodle._updateStatus('correct', guess)

        // save to local storage
        console.log('SAVE 7b: _checkWinState() guess is correct')
        Nebyoodle._saveGame()
      }

      modalOpen('win-game')

      Nebyoodle.__winAnimation().then(() => {
        // disable inputs (until future re-enabling)
        Nebyoodle._disableUI()

        // display modal win thingy
        modalOpen('win')

        return true
      })
    }
    // guess is not correct and game is still going
    else {
      // console.log('_checkWinState: WRONG')

      // add guess (actual guess if submit, '' if skip)
      Nebyoodle.__addGuess(
        {
          answer: guess,
          isCorrect: false,
          isSkipped: false
        }
      )

      // clear the lookup input
      Nebyoodle._clearGuess()

      // update skip button and audio file durationMax, if necessary
      Nebyoodle._updateStatus('wrong', guess)

      // save to local storage
      console.log('SAVE 7c: _checkWinState() guess is wrong')
      Nebyoodle._saveGame()

      return false
    }
  } else {
    console.error('game is broken! solution not found')

    return false
  }
}

// on guesses or skips, update the status of the game
Nebyoodle._updateStatus = function(type, guessText = null, guessIndex = null) {
  let selector

  if (guessIndex != null) {
    selector = `#guesses-container div[data-guess-id='${guessIndex}']`
  } else {
    selector = `#guesses-container div[data-guess-id='${Nebyoodle.__getLastGuessIndex()}']`
  }

  const guessDiv = document.querySelector(selector)

  let symbol = document.createElement('div')
  symbol.classList.add('symbol')

  let svg = document.createElement('img')
  svg.setAttribute('width', '16')
  svg.setAttribute('height', '16')

  let title = document.createElement('span')
  title.classList.add('title')

  switch (type) {
    case 'skipped':
      svg.src = '/assets/images/square.svg'
      svg.classList.add('skipped')
      title.innerHTML = 'SKIPPED'

      break
    case 'wrong':
      svg.src = '/assets/images/cross.svg'
      svg.classList.add('wrong')
      title.innerHTML = guessText

      break
    case 'correct':
      svg.src = '/assets/images/checkmark.svg'
      svg.classList.add('correct')
      title.innerHTML = guessText

      break
  }

  symbol.appendChild(svg)
  guessDiv.appendChild(symbol)
  guessDiv.appendChild(title)

  // if game is not yet won, AND we still have skips left, then update audio and UI
  if (Nebyoodle.__getGameState() == 'IN_PROGRESS' && Nebyoodle.__getGuesses().length < 6) {
    // set new duration
    Nebyoodle.__setDurationMax(NEBYOODLE_SKP_VAL[
      Nebyoodle.__getGuesses().length - 1
    ])

    // update timeline
    const fillVal = NEBYOODLE_DUR_PCT[Nebyoodle.__getGuesses().length]

    Nebyoodle.dom.timelineUnplayed.setAttribute('fill', fillVal)
    Nebyoodle.dom.timelineUnplayed.style.transform = `scaleX(${fillVal})`

    // update skip button
    Nebyoodle.dom.mainUI.skipSeconds.innerText = NEBYOODLE_SKP_TXT[
      Nebyoodle.__getGuesses().length - 1
    ]
  } else {
    Nebyoodle.__setGameState('GAME_OVER')

    Nebyoodle.dom.mainUI.btnSkip.setAttribute('disabled', true)
    Nebyoodle.dom.mainUI.btnSubmit.setAttribute('disabled', true)
  }
}

// add event listeners to DOM
Nebyoodle._attachEventListeners = function() {
  // {} header icons to open modals
  Nebyoodle.dom.interactive.btnNav.addEventListener('click', () => {
    Nebyoodle.dom.navOverlay.classList.toggle('show')
  })
  Nebyoodle.dom.interactive.btnNavClose.addEventListener('click', () => {
    Nebyoodle.dom.navOverlay.classList.toggle('show')
  })
  Nebyoodle.dom.interactive.btnHelp.addEventListener('click', () => {
    modalOpen('help')
  })
  Nebyoodle.dom.interactive.btnStats.addEventListener('click', () => {
    modalOpen('stats')
  })
  Nebyoodle.dom.interactive.btnSettings.addEventListener('click', () => {
    modalOpen('settings')
  })

  // listen for when audio empties
  Nebyoodle.dom.audioElem.addEventListener('emptied', () => {
    // console.log('audioElem got emptied')

    Nebyoodle._disableUI()
  })
  // now listen for when it gets loaded again
  Nebyoodle.dom.audioElem.addEventListener('canplaythrough', () => {
    // console.log('audioElem can now play again')

    // set durationMax back to 1
    Nebyoodle.__setDurationMax(NEBYOODLE_SKP_VAL[
      Nebyoodle.__getGuesses().length
    ])

    Nebyoodle._enableUI()
  })

  // check for currentTime changes and update timeline accordingly
  Nebyoodle.dom.audioElem.addEventListener('timeupdate', Nebyoodle._handleAudioDuration)

  // audio play/pause control
  Nebyoodle.dom.mainUI.btnPlayPause.addEventListener('click', Nebyoodle._handlePlayButton, false)

  // guesses
  Nebyoodle.dom.mainUI.guessInput.addEventListener('keyup', Nebyoodle._handleGuessInput, false)
  Nebyoodle.dom.mainUI.guessResultList.addEventListener('click', Nebyoodle._handleGuessList, false)
  Nebyoodle.dom.mainUI.btnGuessClear.addEventListener('click', Nebyoodle._clearGuess)
  // skip/submit
  Nebyoodle.dom.mainUI.btnSkip.addEventListener('click', Nebyoodle._handleSkipButton, false)
  Nebyoodle.dom.mainUI.btnSubmit.addEventListener('click', Nebyoodle._handleSubmitButton, false)

  // local debug buttons
  if (Nebyoodle.env == 'local') {
    if (Nebyoodle.dom.interactive.debug.all) {
      // 🪣 get single Nebyoolae song from music.nebyoolae.com
      if (Nebyoodle.dom.interactive.debug.btnGetSong) {
        Nebyoodle.dom.interactive.debug.btnGetSong.addEventListener('click', () => {
          modalOpen('get-song')
        })
      }
      // 🪣 get all Nebyoolae songs from music.nebyoolae.com
      if (Nebyoodle.dom.interactive.debug.btnGetSongs) {
        Nebyoodle.dom.interactive.debug.btnGetSongs.addEventListener('click', () => {
          modalOpen('get-songs')
        })
      }

      // 🪣 reset free progress
      if (Nebyoodle.dom.interactive.debug.btnResetFree) {
        Nebyoodle.dom.interactive.debug.btnResetFree.addEventListener('click', () => {
          Nebyoodle._resetFreeProgress()
        })
      }

      // ⚙️ show current Nebyoodle config
      if (Nebyoodle.dom.interactive.debug.btnShowConfig) {
        Nebyoodle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
          modalOpen('show-config')
        })
      }

      // 🎚️ show current Nebyoodle state
      if (Nebyoodle.dom.interactive.debug.btnShowState) {
        Nebyoodle.dom.interactive.debug.btnShowState.addEventListener('click', () => {
          modalOpen('show-state')
        })
      }

      // 🏆 win game immediately
      if (Nebyoodle.dom.interactive.debug.btnWinGame) {
        Nebyoodle.dom.interactive.debug.btnWinGame.addEventListener('click', () => {
          Nebyoodle._winGame()
        })
      }
      // 🏅 almost win game (post-penultimate move)
      if (Nebyoodle.dom.interactive.debug.btnWinGameAlmost) {
        Nebyoodle.dom.interactive.debug.btnWinGameAlmost.addEventListener('click', () => {
          Nebyoodle._winGame('almost')
        })
      }
      // 🏁 display win tile animation
      if (Nebyoodle.dom.interactive.debug.btnWinAnimation) {
        Nebyoodle.dom.interactive.debug.btnWinAnimation.addEventListener('click', () => {
          Nebyoodle.__winAnimation().then(() => Nebyoodle.__resetTilesDuration())
        })
      }
    }
  }

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Nebyoodle._handleClickTouch)
  window.addEventListener('touchend', Nebyoodle._handleClickTouch)

  // console.log('added event listeners')
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

Nebyoodle.__autocompleteMatch = function(input) {
  if (input == '') {
    return []
  }

  const reg = new RegExp(input, 'i')
  const songs = Nebyoodle.allSongData

  return Object.values(songs).filter(song => {
    const term = `${song.song} - ${song.album}`

    if (term.match(reg)) {
      return term
    }
  })
}

Nebyoodle.__getDailyIndex = function() {
  // TODO
  return 1
}
Nebyoodle.__getFreeStreak = function() {
  // TODO
  return 1
}
Nebyoodle.__getScoreCard = function() {
  const guesses = Nebyoodle.__getGuesses()

  let html = ''

  guesses.forEach(guess => {
    if (guess.isSkipped) {
      html += '⬛'
    } else if (guess.isCorrect) {
      html += '🟩'
    } else {
      html += '🟥'
    }
  })

  let spaceLeft = NEBYOODLE_CHANCE_MAX - guesses.length

  while (spaceLeft > 0) {
    html += '⬜'

    spaceLeft--
  }

  return html
}

Nebyoodle.__getDurationMax = function() {
  return Nebyoodle
    .state[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .durationMax
}
Nebyoodle.__setDurationMax = function(durationMax) {
  Nebyoodle
    .state[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .durationMax = durationMax
}

Nebyoodle.__getGameState = function() {
  return Nebyoodle
    .state[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .gameState
}
Nebyoodle.__setGameState = function(gameState) {
  Nebyoodle
    .state[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .gameState = gameState
}

Nebyoodle.__getGuesses = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .guesses
}
Nebyoodle.__addGuess = function(guess) {
  Nebyoodle
    .state[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .guesses
    .push(guess)
}

Nebyoodle.__getSongId = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .songId
}
Nebyoodle.__setSongId = function(songId) {
  Nebyoodle
    .state[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .songId = songId
}

Nebyoodle.__getSongData = function(mode = null) {
  return Nebyoodle
    .config[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .songData
}
Nebyoodle.__setSongData = function(data, mode = null) {
  Nebyoodle
    .config[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .songData = data
}

Nebyoodle.__getSolution = function(mode = null) {
  return Nebyoodle
    .config[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .solution
}
Nebyoodle.__setSolution = async function(method, solution) {
  if (method == 'string') {
    Nebyoodle
      .config[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
      .solution = solution
  } else {
    // console.log('getting solution with fetch', solution)

    const response = await fetch(`${NEBYOODLE_SONGID_SCRIPT}?songId=${solution}`)
    const json = await response.json()
    const data = json.data[0]

    const title = `${data.title} - ${data.field_album_id.name}`

    // console.log('__setSolution title:', title)

    if (title) {
      Nebyoodle
      .config[Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
      .solution = title
    }

    return title
  }
}

Nebyoodle.__getLastGuessIndex = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .guesses
    .length - 1
}

Nebyoodle.__getLastPlayIndex = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()]
    .length - 1
}

// timestamp to display date
Nebyoodle.__getFormattedDate = function(date) {
  let formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
}

Nebyoodle.__getShareText = function(mode = null) {
  const index = Nebyoodle.__getDailyIndex()
  const cubes = Nebyoodle.__getScoreCard()

  let html = ''

  if (mode == 'daily') {
    html = `Nebyoodle #${index}\n`
    html += '\n\n'
    html += cubes
    html += '\n\n'
    html += NEBYOODLE_SHARE_URL
  }
  // free mode
  else {
    const streak = Nebyoodle.__getFreeStreak()

    html = `My longest streak at Nebyoodle is ${streak} song(s) in a row. Can you beat that?`
    html += '\n\n'
    html += NEBYOODLE_SHARE_URL
  }

  return html
}

// get displayable string for today's date
Nebyoodle.__getTodaysDate = function() {
  const d = new Date(Date.now())
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// shorter gameMode deducer
Nebyoodle.__getGameMode = function() {
  return Nebyoodle.settings.gameMode
}

Nebyoodle.__updateDailyDetails = function(index) {
  Nebyoodle.dom.dailyDetails.querySelector('.index').innerHTML = (parseInt(index) + 1).toString()
  Nebyoodle.dom.dailyDetails.querySelector('.day').innerHTML = Nebyoodle.__getTodaysDate()
}

Nebyoodle.__winAnimation = async function() {
  console.log('TODO: add win animation')
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Nebyoodle.initApp()
