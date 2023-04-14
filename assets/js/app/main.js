/* main */
/* app entry point and main functions */
/* global Nebyoodle */

// settings: web app global settings saved between sessions in LOCAL STORAGE
if (!Nebyoodle.settings) {
  Nebyoodle.settings = {}
}

// config: only saved while game is loaded
if (!Nebyoodle.allSongData) {
  Nebyoodle.allSongData = []
}
if (!Nebyoodle.config) {
  Nebyoodle.config = {}
  Nebyoodle.config.daily = NEBYOODLE_DEFAULTS.config.daily
  Nebyoodle.config.free = NEBYOODLE_DEFAULTS.config.free
}

// state: game data saved between sessions LOCAL STORAGE
if (!Nebyoodle.state) {
  Nebyoodle.state = {}
  Nebyoodle.state.daily = [{
    'gameState': 'IN_PROGRESS',
    'guesses': [],
    'songId': null
  }]
  Nebyoodle.state.free = [{
    'gameState': 'IN_PROGRESS',
    'guesses': [],
    'songId': null
  }]
}

Nebyoodle.myModal = null
Nebyoodle.myConfirm = null
Nebyoodle.showDebugMenu = false

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
async function modalOpen(type, data = null) {
  let modalText = ''

  switch(type) {
    case 'start':
    case 'help':
      Nebyoodle.myModal = new Modal('perm', 'How to Play Nebyoodle',
        `
          <p>Listen to the intro of a Nebyoolae song, and then find the correct title/album in the list.</p>

          <p>Skipped or incorrect attempts unlock more of the song.</p>

          <p>Answer in as few tries as possible, and then share your score!</p>

          <h4>Daily</h4>
          <p>One new song to guess each day.</p>

          <h4>Free Play</h4>
          <p>Keep guessing as many songs as you want! Go for the longest combo!</p>

          <hr />

          <p><strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. Find all music at
          <a href="https://music.nebyoolae.com" target="_blank">NebyooMusic</a>.</p>
        `,
        null,
        null
      )
      break

    case 'stats':
      modalText = `
        <div class="container">

          <div class="statistic-header">Daily</div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${Nebyoodle.__getSessionCount('daily')}</div>
              <div class="statistic-label">Played</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Nebyoodle.__getSuccessPerc('daily')}</div>
              <div class="statistic-label">Win %</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Nebyoodle.__getStreak('daily')}</div>
              <div class="statistic-label">Current Streak</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Nebyoodle.__getStreak('daily', true)}</div>
              <div class="statistic-label">Max Streak</div>
            </div>
          </div>

          <div class="statistic-header">Free Play</div>
          <div class="statistics">
          <div class="statistic-container">
          <div class="statistic">${Nebyoodle.__getSessionCount('free')}</div>
          <div class="statistic-label">Played</div>
        </div>
        <div class="statistic-container">
          <div class="statistic">${Nebyoodle.__getSuccessPerc('free')}</div>
          <div class="statistic-label">Win %</div>
        </div>
        <div class="statistic-container">
          <div class="statistic">${Nebyoodle.__getStreak('free')}</div>
          <div class="statistic-label">Current Streak</div>
        </div>
        <div class="statistic-container">
          <div class="statistic">${Nebyoodle.__getStreak('free', true)}</div>
          <div class="statistic-label">Max Streak</div>
        </div>
          </div>
        </div>
      `
      Nebyoodle.myModal = new Modal('perm', 'Statistics',
        modalText,
        null,
        null,
        false
      )
      break

    case 'game-over-win':
      modalText = `
        <div class="container game-over-win">
      `
      modalText += await Nebyoodle._getWinMarkup(data)

      if (Nebyoodle.__getGameMode() == 'free') {
        modalText += `<button class="game-over new-free" onclick="Nebyoodle._createAnotherFree()" title="Try another song?">Try another song? <i class="fa-solid fa-music"></i></button>`
      }

      modalText += `
          <div class="share">
            <button class="game-over share" onclick="Nebyoodle._shareResults()" title="Share Nebyoodle result">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
      `

      if (Nebyoodle.__getGameMode() == 'daily') {
        modalText += `<div>A new daily song will be available at 12 am PST</div>`
      }

      modalText += `
        </div>
      `

      Nebyoodle.myModal = new Modal('perm', 'Congratulations! You guessed the song!',
        modalText,
        null,
        null,
        'game-over-win'
      )
      break

    case 'game-over-lose':
      modalText = `
        <div class="container game-over-lose">
      `
      modalText += await Nebyoodle._getWinMarkup(data)

      if (Nebyoodle.__getGameMode() == 'free') {
        modalText += `<button class="new-free" onclick="Nebyoodle._createAnotherFree()" title="Try another song?">Try another song? <i class="fa-solid fa-music"></i></button>`
      }

      modalText += `
          <div class="share">
            <button class="share" onclick="Nebyoodle._shareResults()" title="Share Nebyoodle result">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
      `

      if (Nebyoodle.__getGameMode() == 'daily') {
        modalText += `<div>A new daily song will be available at 12 am PST</div>`
      }

      modalText += `
        </div>
      `

      Nebyoodle.myModal = new Modal('perm', 'Bummer! You didn\'t guess the song!',
        modalText,
        null,
        null,
        'game-over-lose'
      )
      break

    case 'settings':
      Nebyoodle.myModal = new Modal('perm', 'Settings',
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
      Nebyoodle.myModal = new Modal('perm-debug', 'Game Config (code model only)',
        Nebyoodle._debugDisplayConfig(),
        null,
        null
      )
      break

    case 'show-state':
      Nebyoodle.myModal = new Modal('perm-debug', 'Game State (load/save to LS)',
        Nebyoodle._debugDisplayState(),
        null,
        null
      )
      break

    case 'shared':
      Nebyoodle.myModal = new Modal('temp', null,
        'Results copied to clipboard',
        null,
        null
      )
      break
    case 'no-clipboard-access':
      Nebyoodle.myModal = new Modal('temp', null,
        'Sorry, but access to clipboard not available',
        null,
        null
      )
      break

    case 'win-game-hax':
      Nebyoodle.myModal = new Modal('temp', null,
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

  Nebyoodle._disableUI()

  // set env
  Nebyoodle.env = NEBYOODLE_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

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
Nebyoodle._loadGame = async function(mode = null) {
  let dailyCreateOrLoad = ''
  let freeCreateOrLoad = ''

  if (!mode) {
    /* ************************* */
    /* settings LS -> code       */
    /* ************************* */
    Nebyoodle._loadSettings()

    /* ************************* */
    /* allSongData from LS       */
    /* ************************* */
    await Nebyoodle._loadAllSongData()
  }

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
    // if we have previous daily LS values, sync them to code
    if (lsStateDaily) {
      // console.log('FUNC _loadGame(): found previous DAILY data')

      /*
        special case for daily song:
        need to check to make sure time hasn't elapsed on saved progress
      */
      try {
        // console.log('_loadGame(); fetching NEBYOODLE_DAILY_SCRIPT')

        Nebyoodle.myModal = new Modal('temp-api', ' ',
          'loading saved daily info...',
          null,
          null,
          'lds-dual-ring'
        )

        const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
        const data = await response.json()

        Nebyoodle.myModal._destroyModal()

        const dailySongId = data['songId']
        const savedSongId = lsStateDaily[Nebyoodle.__getSessionIndex()].songId

        // console.log(`dailySongId: ${dailySongId}, savedSongId: ${savedSongId}`)

        // daily songId == saved songId? still working on it
        if (dailySongId == savedSongId) {
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
          console.log('dailySongId and savedSongId do not match; creating new puzzle')

          // Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].gameState = 'IN_PROGRESS'
          // Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].guesses = []
          // Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].songId = null

          // console.log('SAVE: _loadGame() after checking on dailySong')
          // Nebyoodle._saveGame()

          dailyCreateOrLoad = 'create'
        }

        Nebyoodle.__updateDailyDetails(data['index'])
        // Nebyoodle._refreshUI()
      } catch (e) {
        console.error('could not get daily song', e)

        Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].guesses = []
        Nebyoodle.state.daily[Nebyoodle.__getSessionIndex('daily')].songId = null
      }
    }
    // no existing daily state found, so create with defaults
    else {
      // Nebyoodle.state.daily = NEBYOODLE_DEFAULTS.state.daily

      // console.log('DAILY: LS state NOT found; defaults set; solution to be created with daily song', Nebyoodle.state.daily)

      dailyCreateOrLoad = 'create'
    }

    // console.log('creating/loading DAILY solution:', dailyCreateOrLoad)

    switch (dailyCreateOrLoad) {
      case 'create':
        await Nebyoodle._createNewSolution('daily', true)
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
    // if we have previous free LS values, sync them to code
    if (lsStateFree) {
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
    // no existing free state found, so create with defaults
    else {
      // Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

      // console.log('FREE: LS state NOT found; defaults set; solution to be randomly chosen', Nebyoodle.state.free)

      freeCreateOrLoad = 'create'
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
}

// check for song data, and load it appropriately
Nebyoodle._loadAllSongData = async function() {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_KEY)

  if (lsSongData) {
    Nebyoodle.allSongData = JSON.parse(lsSongData)
  } else {
    await Nebyoodle._getSongs()
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

    modalOpen('start')

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
      Nebyoodle._disableUI()

      Nebyoodle._saveSetting('gameMode', value)

      Nebyoodle._loadGame(value)

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

// add debug stuff if local
Nebyoodle._initDebug = function() {
  // if debug buttons are in template
  if (Nebyoodle.dom.interactive.debug.debugButtons && Nebyoodle.showDebugMenu) {
    // show debug buttons
    Nebyoodle.dom.interactive.debug.debugButtons.style.display = 'flex'
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
Nebyoodle._createNewSolution = async function(gameMode, reset = null) {
  // console.log(`**** creatING new '${gameMode}' solution ****`)

  if (reset) {
    // console.log(`FUNC _createNewSolution: setting '${gameMode}' state to default`)

    // Nebyoodle.state[gameMode] = NEBYOODLE_DEFAULTS.state[gameMode]
  } else {
    console.log(`FUNC _createNewSolution: adding another '${gameMode}' default config/state`)

    Nebyoodle.config[gameMode] = {
      'solution': null,
      'songData': null
    }
    Nebyoodle.state[gameMode].push({
      gameState: 'IN_PROGRESS',
      guesses: [],
      songId: null
    })
  }

  // console.log('SAVE: after creating new solution')
  // Nebyoodle._saveGame()

  // reset guesses UI
  Nebyoodle._refreshUI()

  // get random song
  await Nebyoodle._getSong()
}

// load existing solution, which retains past progress
Nebyoodle._loadExistingSolution = async function(gameMode) {
  const songId = Nebyoodle.__getSongId(gameMode)

  // console.log(`**** loadING existing '${gameMode}' solution ****`, songId)

  await Nebyoodle._getSong(songId)
}

// use to create new free puzzle without confirmation
Nebyoodle._createAnotherFree = async function() {
  Nebyoodle.myModal._destroyModal()

  await Nebyoodle._createNewSolution('free')
}

// ask to create new free gamemode puzzle
Nebyoodle._confirmFreeCreateNew = async function() {
  Nebyoodle.myConfirm = new Modal('confirm', 'Create New Puzzle?',
    'Are you <strong>sure</strong> you want to create a new puzzle?',
    'Yes, please',
    'No, never mind'
  )

  try {
    // wait for modal confirmation
    const confirmed = await Nebyoodle.myConfirm.question()

    if (confirmed) {
      Nebyoodle._resetFreeProgress()
      await Nebyoodle._createNewSolution('free')
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }

  Nebyoodle.myConfirm._destroyModal()
  Nebyoodle.myModal._destroyModal()
}

Nebyoodle._disableUI = function() {
  Object.values(Nebyoodle.dom.mainUI).forEach(elem => {
    if (elem.id !== 'button-play-pause-icon') {
      elem.setAttribute('disabled', '')
    }
  })
}
// on refresh of site and saved data found, refresh UI
Nebyoodle._refreshUI = function(guesses = null) {
  Object.values(Nebyoodle.dom.guessesContainer.children).forEach(guess => {
    guess.innerHTML = ''
  })

  if (guesses) {
    // console.log('FUNC _refreshUI() with guesses')

    guesses.forEach((guessObject, index) => {
      const guess = guessObject.answer

      switch (guess) {
        case '':
          Nebyoodle.__updateStatus('skipped', null, index)

          break
        default:
          const solution = Nebyoodle.__getSolution()

          if (guess == solution) {
            Nebyoodle.__updateStatus('correct', guess, index)
          } else {
            Nebyoodle.__updateStatus('wrong', guess, index)
          }

          break
      }
    })
  }

  Nebyoodle._checkWinState()
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
  // console.log('FUNC _getSong()')

  let songIdToFetch = songId

  // if local, add songData to visible div, and add loading animation while fetching
  if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
    Nebyoodle.dom.songData.innerHTML = ''
    Nebyoodle.dom.songData.classList.add('show')
    Nebyoodle.dom.songData.classList.add('lds-dual-ring')
  }

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
      if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
        Nebyoodle.dom.songData.classList.remove('lds-dual-ring')
      }

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

      if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
        Nebyoodle.dom.songData.innerHTML = await Nebyoodle._getWinMarkup(data)
      }

      // load song into audio-element
      Nebyoodle.dom.audioElem.src = randomAudioUrl
      Nebyoodle.dom.audioElem.load()

      const title = `${randomSongName} - ${randomAlbumName}`

      // set config.solution
      let solution
      solution = await Nebyoodle.__setSolution('string', title)

      if (solution) {
        // set state.songId
        Nebyoodle.__setSongId(randomSongId)
      } else {
        console.error('not able to set config.solution')
      }

      // console.log('Nebyoodle.state.daily', Nebyoodle.__getState('daily'))
      // console.log('Nebyoodle.state.free', Nebyoodle.__getState('free'))

      // console.log('SAVE: end of _getSong()')
      // Nebyoodle._saveGame()
    } else {
      console.error('fetched song has invalid data')

      if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
        Nebyoodle.dom.songData.classList.remove('lds-dual-ring')
        Nebyoodle.dom.songData.innerHTML = `got song, but it's wonky :(`
      } else {
        Nebyoodle.myModal._destroyModal()

        Nebyoodle.myModal = new Modal('temp', null,
          'Could not load song!',
          null,
          null
        )

      }
    }
  } else {
    console.error('could not fetch song from remote source')

    if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
      Nebyoodle.dom.songData.classList.remove('lds-dual-ring')
      Nebyoodle.dom.songData.innerHTML = 'could not get song :('
    }
  }
}

// get all valid songs from music.nebyoolae.com
Nebyoodle._getSongs = async function() {
  const lsSongData = localStorage.getItem(NEBYOODLE_SONG_DATA_KEY)

  if (!lsSongData) {
    Nebyoodle.allSongData = []

    Nebyoodle.myModal = new Modal('temp-api', ' ',
      'loading...',
      null,
      null,
      'lds-dual-ring'
    )

    const getSongsResponse = await fetch(NEBYOODLE_ALL_SONGS_SCRIPT)
    const songs = await getSongsResponse.json()

    Nebyoodle.myModal._destroyModal()

    if (songs && songs.status != 'error') {
      songs.data.forEach((song, index) => {
        const songName = song.title
        const albumName = song.field_album_id.name

        Nebyoodle.allSongData.push({ song: songName, album: albumName })
      })

      localStorage.setItem(NEBYOODLE_SONG_DATA_KEY, JSON.stringify(Nebyoodle.allSongData))
    } else {
      Nebyoodle.myModal = new Modal('temp', null,
        'Could not load songs!',
        null,
        null
      )

      console.error('could not fetch songs from remote source')
    }
  } else {
    Nebyoodle.myModal = new Modal('temp', null,
      'Song data already loaded',
      null,
      null
    )

    Nebyoodle.allSongData = JSON.parse(lsSongData)
  }
}

// modal: debug: display Nebyoodle.config
Nebyoodle._debugDisplayConfig = function() {
  const configs = Nebyoodle.config

  let html = ''

  html += `<h3>GLOBAL (ENV: ${Nebyoodle.env})</h3>`
  html += '<h3>----------------------------</h3>'

  html += '<dl>'

  Object.keys(configs).forEach(config => {
    html += `<h4>CONFIG: ${config}</h4>`

    Object.keys(configs[config]).forEach(key => {
      const label = key
      const value = configs[config][key]

      html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: display Nebyoodle.state
Nebyoodle._debugDisplayState = function() {
  const states = Nebyoodle.state

  let html = ''

  html += '<dl class="centered">'

  Object.keys(states).forEach(state => {
    html += '<div class="debug-state">'
    html += `<h4>STATE: ${state}</h4>`

    Object.keys(states[state]).forEach(session => {
      html += '<div class="debug-session">'
      html += `<h5>SESSION: ${session}</h5>`

      Object.keys(states[state][session]).forEach(key => {
        const value = states[state][session][key]

        if (typeof value == 'object'
          && !Array.isArray(value)
          && value != null
        ) {
          html += `<dd><code>${key}: {</code><dl>`

          if (key == 'statistics') {
            Object.keys(states[state][session][key]).forEach(subkey => {
              value = states[state][session][key][subkey]

              html += `<dd><code>${subkey}:</code></dd><dt>${value}</dt>`
            })

            html += '</dl><code>}</code></dd>'
          }
          else {
            Object.keys(states[state][session][key]).forEach(subkey => {
              value = states[state][session][key][subkey]

              if (subkey == 'lastCompletedTime' || subkey == 'lastPlayedTime') {
                value = Nebyoodle.__getFormattedDate(new Date(value))
              }

              if (value) {

                if (typeof value == 'object' && subkey == 'guesses') {
                  html += `<dd><code>${subkey}:</code></dd><dt>${value.map(v => v.answer).join(', ')}</dt>`
                } else {
                  html += `<dd><code>${subkey}:</code></dd><dt>${value.join(', ')}</dt>`
                }
              }
            })

            html += '</dl><code>}</code></dd>'
          }
        } else {
          if (typeof value == 'object' && key == 'guesses') {
            html += `<dd><code>${key}:</code></dd><dt>${value.map(v => v.answer != '' ? `'${v.answer}'` : '[skip]').join(', ')}</dt>`
          } else {
            html += `<dd><code>${key}:</code></dd><dt>${value}</dt>`
          }
        }
      })

      html += '</div>'
    })

    html += '</div>'
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
  // console.log('FUNC _handleAudioDuration()')

  const currentTime = event.target.currentTime
  const durationMax = Nebyoodle.__getDurationMax()
  const durationVal = NEBYOODLE_DUR_PCT[Nebyoodle.__getGuesses().length]
  const fillVal = (currentTime / durationMax) * durationVal

  Nebyoodle.dom.timelinePlayed.setAttribute('fill', fillVal)
  Nebyoodle.dom.timelinePlayed.style.transform = `scaleX(${fillVal})`
  Nebyoodle.dom.playSeconds.innerText = Math.floor(currentTime).toString().padStart(2, '0')

  if (currentTime >= durationMax) {
    // "stop" the audio, i.e. pause and reset back to beginning
    Nebyoodle.dom.audioElem.pause()
    Nebyoodle.dom.audioElem.currentTime = 0
    Nebyoodle._togglePlayPauseButton()
  }

  Nebyoodle.__updateStatus()
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

// submit guess with blank
Nebyoodle._handleSkipButton = function() {
  Nebyoodle._submitGuess()
}

// submit guess with text
Nebyoodle._handleSubmitButton = function() {
  Nebyoodle._submitGuess(Nebyoodle.dom.mainUI.guessInput.value)
}

// submit a guess if game still IN_PROGRESS
Nebyoodle._submitGuess = function(guess = null) {
  // console.log('FUNC _submitGuess()')

  if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
    // guess was skipped
    if (!guess) {
      // add blank guess for skip
      Nebyoodle.__addGuess({
        answer: '',
        isCorrect: false,
        isSkipped: true
      })

      // clear the lookup input
      Nebyoodle._clearGuess()

      // update skip button and audio file durationMax, if necessary
      Nebyoodle.__updateStatus('skipped', null)

      // save to local storage
      // console.log('SAVE: _checkWinState() adding skip')
      // Nebyoodle._saveGame()
    }
    // guess was entered
    else {
      // add guess
      Nebyoodle.__addGuess({
        answer: guess,
        isCorrect: false,
        isSkipped: false
      })

      // clear the lookup input
      Nebyoodle._clearGuess()

      // update skip button and audio file durationMax, if necessary
      Nebyoodle.__updateStatus('wrong', guess)

      // save to local storage
      // console.log('SAVE: _checkWinState() adding skip')
      // Nebyoodle._saveGame()
    }

    // check if a guess has won the game or not
    Nebyoodle._checkWinState()
  } else {
    console.error('current game is over -- no more guesses!')
  }
}

// check latest guess to see if correct and if game is won
Nebyoodle._checkWinState = function() {
  // console.log('FUNC _checkWinState()')

  const gameMode = Nebyoodle.__getGameMode()
  const solution = Nebyoodle.__getSolution()
  const guesses = Nebyoodle.__getGuesses()

  // if game won, set state and display win modal
  if (Object.values(guesses).map(g => g.answer).includes(solution)) {
    // make sure answer's `isCorrect` is changed to 'true'
    Object.keys(guesses).forEach(k => {
      if (guesses[k].answer == solution) {
        // console.log('FUNC _checkWinState(): found correct answer')

        Nebyoodle.__getGuesses()[k].isCorrect = true

        // console.log('SAVE: _checkWinState() found correct answer')
        // Nebyoodle._saveGame()
      } else {
        // console.log('FUNC _checkWinState(): no correct answer found')
      }
    })

    // set state stuff
    if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
      console.log('FUNC _checkWinState(): IN_PROGRESS -> GAME_OVER')

      // make sure to only increment wins if we are going from
      // IN_PROGRESS -> GAME_OVER (ignores page refreshes)`
      Nebyoodle.__setGameState('GAME_OVER')

      // clear the lookup input
      Nebyoodle._clearGuess()

      // update skip button and audio file durationMax, if necessary
      Nebyoodle.__updateStatus('correct-fix', solution)

      console.log('SAVE: _checkWinState() guesses contain solution')
      Nebyoodle._saveGame(gameMode)
    }

    // disable inputs (until future re-enabling)
    Nebyoodle._disableUI()

    // display modal win thingy
    if (!Nebyoodle.myModal) {
      modalOpen('game-over-win')
    }

    return true
  }
  // game not won, so check if we've reached the max guesses
  else if (Nebyoodle.__getGuesses().length >= NEBYOODLE_CHANCE_MAX || Nebyoodle.__getGameState() == 'GAME_OVER') {
    // console.log('game not won, and max skips reached')

    // disable inputs (until future re-enabling)
    Nebyoodle._disableUI()

    // console.log('SAVE: _checkWinState() solution not found yet, no more skips')
    Nebyoodle._saveGame(gameMode)

    if (!Nebyoodle.myModal) {
      modalOpen('game-over-lose')
    }

    return true
  }
  // game not won, and skips remain
  else {
    // console.log('SAVE: _checkWinState() solution not found yet, skips remain')
    Nebyoodle._saveGame(gameMode)

    return false
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

    if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
      Nebyoodle._enableUI()
    }
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

  // if local dev, show debug buttons
  if (Nebyoodle.env == 'local') {
    if (Nebyoodle.dom.interactive.debug.debugButtons && Nebyoodle.showDebugMenu) {
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
    }
  }

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Nebyoodle._handleClickTouch)
  window.addEventListener('touchend', Nebyoodle._handleClickTouch)
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

Nebyoodle.__autocompleteMatch = function(input) {
  if (input == '') {
    return []
  }

  input = input.replace(/[^A-Za-z0-9\'\"\s]/g, '')

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
  return parseInt(Nebyoodle.config.daily.index) + 1
}
// TODO: return the longest free streak of songs guessed
Nebyoodle.__getFreeStreak = function() {
  return 1
}
// get most recent emoji block for sharing
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

Nebyoodle.__getDurationMax = function(mode = null) {
  const guessLength = Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .guesses
    .length

  return NEBYOODLE_SKP_VAL[guessLength]
}
Nebyoodle.__setDurationMax = function(durationMax, mode = null) {
  Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .durationMax = durationMax
}

Nebyoodle.__getState = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
}
Nebyoodle.__setState = function(state, mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()] = state
}
Nebyoodle.__getGameState = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .gameState
}
Nebyoodle.__setGameState = function(gameState, mode = null) {
  Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .gameState = gameState
}

Nebyoodle.__getGuesses = function(mode = null) {
  const gameMode = mode ? mode : Nebyoodle.__getGameMode()

  // console.log('FUNC __getGuesses()', gameMode)

  return Nebyoodle
    .state[gameMode][Nebyoodle.__getSessionIndex()]
    .guesses
}
Nebyoodle.__addGuess = function(guess) {
  const mode = Nebyoodle.__getGameMode()

  // console.log('__addGuess', mode)

  Nebyoodle
    .state[mode][Nebyoodle.__getSessionIndex()]
    .guesses
    .push(guess)
}

Nebyoodle.__getSongId = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .songId
}
Nebyoodle.__setSongId = function(id, mode = null) {
  Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .songId = id
}

Nebyoodle.__getSongData = function(mode = null) {
  return Nebyoodle
    .config[mode ? mode : Nebyoodle.__getGameMode()]
    .songData
}
Nebyoodle.__setSongData = function(data, mode = null) {
  // console.log('__setSongData:', mode ? mode : Nebyoodle.__getGameMode())

  Nebyoodle
    .config[mode ? mode : Nebyoodle.__getGameMode()]
    .songData = data
}

Nebyoodle.__getSolution = function(mode = null) {
  return Nebyoodle
    .config[mode ? mode : Nebyoodle.__getGameMode()]
    .solution
}
Nebyoodle.__setSolution = async function(method, answer, mode = null) {
  if (method == 'string') {
    Nebyoodle
      .config[mode ? mode : Nebyoodle.__getGameMode()]
      .solution = answer

    return Promise.resolve(true)
  } else {
    const response = await fetch(`${NEBYOODLE_SONGID_SCRIPT}?songId=${answer}`)
    const json = await response.json()
    const data = json.data[0]

    if (data) {
      const title_album = `${data.title} - ${data.field_album_id.name}`

      Nebyoodle
        .config[mode ? mode : Nebyoodle.__getGameMode()]
        .solution = title_album

      return title_album
    } else {
      console.error('could not fetch song title from songId')

      return false
    }
  }
}

// get the last index of `guesses` in the most recent session of [mode]
Nebyoodle.__getLastGuessIndex = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getSessionIndex()]
    .guesses
    .length - 1
}
// get the most recent session of [mode]
Nebyoodle.__getSessionIndex = function(mode = null) {
  const index = Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()]
    .length - 1

  // console.log('FUNC __getSessionIndex() state', Nebyoodle.state[mode ? mode : Nebyoodle.__getGameMode()])

  // console.log('FUNC __getSessionIndex() index', index)

  return index
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
// create text and emoji content for share button
Nebyoodle.__getShareText = function(mode = null) {
  const index = Nebyoodle.__getDailyIndex()
  const cubes = Nebyoodle.__getScoreCard()

  let html = ''

  if (mode == 'daily') {
    html = `Nebyoodle #${index}\n`
    html += cubes
    html += '\n'
    html += NEBYOODLE_SHARE_URL
  }
  // free mode
  else {
    const streak = Nebyoodle.__getFreeStreak()

    html = `My longest streak at Nebyoodle is ${streak} song(s) in a row. Can you beat that?\n\n`
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
  const mode = Nebyoodle.settings.gameMode

  // console.log('__getGameMode:', mode)

  return mode
}

// on guesses or skips, update the status of the game
Nebyoodle.__updateStatus = function(type, guessText = null, guessIndex = null) {
  // console.log('FUNC __updateStatus()', type, guessText, guessIndex)

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
    // added a skipped guess status
    case 'skipped':
      svg.src = '/assets/images/square.svg'
      svg.classList.add('skipped')
      title.innerHTML = 'SKIPPED'

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      break

    // added a wrong guess status
    case 'wrong':
      svg.src = '/assets/images/cross.svg'
      svg.classList.add('wrong')
      title.innerHTML = guessText

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      break

    // added a correct guess status
    case 'correct':
      svg.src = '/assets/images/checkmark.svg'
      svg.classList.add('correct')
      title.innerHTML = guessText

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      break

    // last guess was correct, so updating last guess to correct
    case 'correct-fix':
      // get last guess's svg and update its img and classes
      guessDiv.querySelector('img').src = '/assets/images/checkmark.svg'
      guessDiv.querySelector('img').classList.remove('wrong')
      guessDiv.querySelector('img').classList.add('correct')

      break
    default:
      break
  }

  // if game is not yet won, AND we still have skips, update audio and UI
  const gameState = Nebyoodle.__getGameState()
  const skipsRemain = Nebyoodle.__getGuesses().length < NEBYOODLE_CHANCE_MAX

  if (gameState == 'IN_PROGRESS' && skipsRemain) {
    // console.log('FUNC __updateStatus() game not won and skips remaining')

    // update timeline
    const fillVal = NEBYOODLE_DUR_PCT[Nebyoodle.__getGuesses().length]

    Nebyoodle.dom.timelineUnplayed.setAttribute('fill', fillVal)
    Nebyoodle.dom.timelineUnplayed.style.transform = `scaleX(${fillVal})`

    // update skip button
    Nebyoodle.dom.mainUI.skipSeconds.innerText = NEBYOODLE_SKP_TXT[
      Nebyoodle.__getGuesses().length
    ]
  }
  // otherwise, game is over
  else {
    // console.log('FUNC __updateStatus() game is over or out of skips')

    Nebyoodle.__setGameState('GAME_OVER')
  }
}

// update config and UI with daily song attributes
Nebyoodle.__updateDailyDetails = function(index) {
  Nebyoodle.config.daily.index = index
  Nebyoodle.dom.dailyDetails.querySelector('.index').innerHTML = (parseInt(index) + 1).toString()
  Nebyoodle.dom.dailyDetails.querySelector('.day').innerHTML = Nebyoodle.__getTodaysDate()
}

// TODO
Nebyoodle.__winAnimation = async function() {
  console.log('TODO: add win animation')
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Nebyoodle.initApp()
