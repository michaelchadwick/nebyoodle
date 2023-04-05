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

Nebyoodle.myModal = null
Nebyoodle.myConfirm = null

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
      Nebyoodle.myModal = new Modal('perm', 'Statistics (TODO)',
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
        modalText += `<button class="new-free" onclick="Nebyoodle._createAnotherFree()" title="Try another song?">Try another song? <i class="fa-solid fa-music"></i></button>`
      }

      modalText += `
          <div class="share">
            <button class="share" onclick="Nebyoodle._shareResults()" title="Share Nebyoodle result">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
      `

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
        Nebyoodle._displayGameConfig(),
        null,
        null
      )
      break

    case 'show-state':
      Nebyoodle.myModal = new Modal('perm-debug', 'Game State (load/save to LS)',
        Nebyoodle._displayGameState(),
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
  await Nebyoodle._loadAllSongData()

  /* ************************* */
  /* TODO:                     */
  /* daily state LS -> code    */
  /* ************************* */

  const lsStateDaily = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY))
  let dailyCreateOrLoad = ''

  // if we have previous daily LS values, sync them to code model
  if (lsStateDaily) {
    Nebyoodle.state.daily = lsStateDaily

    console.log('DAILY state loaded from LS')

    const dailySolution = Nebyoodle.config.daily.solution

    // special case for daily song: need to check
    // to make sure time hasn't elapsed on saved progress
    try {
      console.log('_loadGame(); fetching NEBYOODLE_DAILY_SCRIPT')

      const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
      const data = await response.json()

      console.log('_loadGame(daily) data', data)

      const dailySongId = data['drupal_internal__nid']

      // daily songId and saved songId are the same? still working on it
      if (dailySongId == lsStateDaily.songId) {
        Nebyoodle.state.daily = lsStateDaily
        // Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].guesses = lsStateDaily.guesses
        // Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].songId = lsStateDaily.songId

        console.log(`Song for ${Nebyoodle.__getTodaysDate()}:`, dailySongId)

        dailyCreateOrLoad = 'load'
      }
      // time has elapsed on daily puzzle, and new one is needed
      else {
        console.log('daily songId and saved songId do not match, so create new puzzle')

        Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].gameState = 'IN_PROGRESS'
        Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].guesses = []
        Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].songId = null

        console.log('SAVE: _loadGame() after checking on dailySong')
        Nebyoodle._saveGame()

        dailyCreateOrLoad = 'create'
      }

      Nebyoodle.__updateDailyDetails(data['index'])
    } catch (e) {
      console.error('could not get daily song', e)

      Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].guesses = []
      Nebyoodle.state.daily[Nebyoodle.__getLastPlayIndex('daily')].songId = null
    }
  }
  // no existing daily state found, so create with defaults
  else {
    Nebyoodle.state.daily = NEBYOODLE_DEFAULTS.state.daily

    console.log('DAILY: LS state NOT found; defaults set; solution to be created with daily song', Nebyoodle.state.daily)

    dailyCreateOrLoad = 'create'
  }

  /* ************************* */
  /* free state LS -> code     */
  /* ************************* */

  const lsStateFree = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_KEY))
  let freeCreateOrLoad = ''

  // if we have previous free LS values, sync them to code model
  if (lsStateFree) {
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

        const hasWon = Nebyoodle._checkWinState()

        if (!hasWon) {
          Nebyoodle._refreshUI(lsFreeGuesses)

          freeCreateOrLoad = 'load'
        }
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
    Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

    console.log('FREE: LS state NOT found; defaults set; solution to be randomly chosen', Nebyoodle.state.free)

    freeCreateOrLoad = 'create'
  }

  /* ********************** */
  /* create/load solution   */
  /* ********************** */

  // daily mode
  if (Nebyoodle.__getGameMode() == 'daily') {
    console.log('creating/loading DAILY solution')

    Nebyoodle.dom.dailyDetails.classList.add('show')

    switch (dailyCreateOrLoad) {
      case 'create':
        await Nebyoodle._createNewSolution('daily')
        console.log('DAILY solution created!', Nebyoodle.__getSongId('daily'))
        break
      case 'load':
        await Nebyoodle._loadExistingSolution('daily', Nebyoodle.__getSongId('daily'))
        console.log('DAILY solution loaded!', Nebyoodle.__getSongId('daily'))
        break
      default:
        break
    }
  }
  // free mode
  if (Nebyoodle.__getGameMode() == 'free') {
    console.log('creating/loading FREE solution')

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
  }

  console.log('SAVE: end of _loadGame()')
  Nebyoodle._saveGame()
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

// on refresh of site and saved data found, refresh UI
Nebyoodle._refreshUI = function(guesses = null) {
  if (guesses) {
    guesses.forEach((guessObject, index) => {
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

    Nebyoodle._checkWinState()
  } else {
    // no guesses? must be a new puzzle, so blank out guesses
    Object.values(Nebyoodle.dom.guessesContainer.children).forEach(guess => {
      guess.innerHTML = ''
    })
  }
}

// save game state/settings from code model -> LS
Nebyoodle._saveGame = function() {
  // console.log('saving game state and global settings to localStorage...')

  // save daily game state
  try {
    // console.log('DAILY localStorage state being saved with', JSON.stringify(Nebyoodle.state.daily))

    localStorage.setItem(NEBYOODLE_STATE_DAILY_KEY, JSON.stringify(Nebyoodle.state.daily))

    // console.log('DAILY localStorage state saved!', JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY)))
  } catch(error) {
    console.error('localStorage DAILY state save failed', error)
  }

  // save free game state
  try {
    // console.log('FREE localStorage state being saved with', JSON.stringify(Nebyoodle.state.free))

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

          // console.log('SAVE: _changeSetting() after switching gameMode to daily')
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

          // console.log('SAVE: _changeSetting() after switching gameMode to free')
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
Nebyoodle._createNewSolution = async function(gameMode, reset = null) {
  console.log(`**** creatING new '${gameMode}' solution ****`)

  if (reset) {
    console.log(`setting '${gameMode}' state to default`)

    Nebyoodle.state[gameMode] = NEBYOODLE_DEFAULTS.state[gameMode]
  } else {
    console.log(`adding another '${gameMode}' default config/state`)

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

  console.log('SAVE: after creating new solution')
  Nebyoodle._saveGame()

  // reset guesses UI
  Nebyoodle._refreshUI()

  // get random song
  await Nebyoodle._getSong()
}

// load existing solution, which retains past progress
Nebyoodle._loadExistingSolution = async function(gameMode) {
  const songId = Nebyoodle.__getSongId(gameMode)

  console.log(`**** loadING existing '${gameMode}' solution ****`, songId)

  Nebyoodle._getSong(songId)
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

// reset config, state, and LS for free play
Nebyoodle._resetFreeProgress = async function() {
  console.log('resetting free play progress...')

  // set config and state to defaults
  Nebyoodle.config.free = NEBYOODLE_DEFAULTS.config.free
  Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

  Nebyoodle._refreshUI(Nebyoodle.__getGuesses())

  // save those defaults to localStorage
  // console.log('SAVE: _resetFreeProgress()')
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
  console.log(`_getSong with songId: ${songId}`)

  // if local, add songData to visible div, and add loading animation while fetching
  if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
    Nebyoodle.dom.songData.innerHTML = ''
    Nebyoodle.dom.songData.classList.add('show')
    Nebyoodle.dom.songData.classList.add('lds-dual-ring')
  }

  let response = null

  if (songId) {
    response = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}&songId=${songId}`)
  } else {
    response = await fetch(`${NEBYOODLE_SONG_SCRIPT}?env=${Nebyoodle.env}`)
  }

  if (response) {
    // console.log('_getSong: got initial response, so converting to json...')

    const song = await response.json()

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
      const solution = await Nebyoodle.__setSolution('string', title)

      if (solution) {
        // set state.songId
        Nebyoodle.__setSongId(randomSongId)
      } else {
        console.error('not able to set config.solution')
      }

      console.log('SAVE: end of _getSong()')
      Nebyoodle._saveGame()
    } else {
      console.error('fetched song has invalid data')

      if (Nebyoodle.env == NEBYOODLE_DEBUG_ENV) {
        Nebyoodle.dom.songData.classList.remove('lds-dual-ring')
        Nebyoodle.dom.songData.innerHTML = `got song, but it's wonky :(`
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
    Nebyoodle.myModal = new Modal('temp-api', null,
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

      Nebyoodle.myModal._destroyModal()
    } else {
      Nebyoodle.myModal._destroyModal()

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
Nebyoodle._displayGameConfig = function() {
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
  // console.log('handleAudioDuration event')

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

  Nebyoodle._updateStatus()
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
Nebyoodle._debugWinGame = function(state = null) {
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

  // console.log('SAVE: _debugWinGame() debuggery')
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
  Nebyoodle._submitGuess()
}

// submit guess with text
Nebyoodle._handleSubmitButton = function() {
  Nebyoodle._submitGuess(Nebyoodle.dom.mainUI.guessInput.value)
}

// submit a guess if game still IN_PROGRESS
Nebyoodle._submitGuess = function(guess = null) {
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
      Nebyoodle._updateStatus('skipped', null)

      // save to local storage
      // console.log('SAVE: _checkWinState() adding skip')
      Nebyoodle._saveGame()
    }
    // guess was entered
    else {
      // add guess
      Nebyoodle.__addGuess({
        answer: guess,
        isCorrect: false,
        isSkipped: false
      })

      // set state stuff
      if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
        // make sure to only increment wins if we are going from
        // IN_PROGRESS -> GAME_OVER (ignores page refreshes)`
        Nebyoodle.__setGameState('GAME_OVER')

        // clear the lookup input
        Nebyoodle._clearGuess()

        // update skip button and audio file durationMax, if necessary
        Nebyoodle._updateStatus('correct', guess)

        // save to local storage
        // console.log('SAVE: _checkWinState() guess is correct')
        Nebyoodle._saveGame()
      }
    }

    // check if a guess has won the game or not
    Nebyoodle._checkWinState()
  } else {
    console.error('current game is over -- no more guesses!')
  }
}

// check latest guess to see if correct and if game is won
Nebyoodle._checkWinState = function() {
  const solution = Nebyoodle.__getSolution()
  const guesses = Nebyoodle.__getGuesses()

  // if we have won, set state and display win modal
  if (Object.values(guesses).map(g => g.answer).includes(solution)) {
    // set state stuff
    if (Nebyoodle.__getGameState() == 'IN_PROGRESS') {
      // make sure to only increment wins if we are going from
      // IN_PROGRESS -> GAME_OVER (ignores page refreshes)`
      Nebyoodle.__setGameState('GAME_OVER')

      // clear the lookup input
      Nebyoodle._clearGuess()

      // update skip button and audio file durationMax, if necessary
      Nebyoodle._updateStatus('correct', guess)

      // save to local storage
      // console.log('SAVE: _checkWinState() guess is correct')
      Nebyoodle._saveGame()
    }

    // disable inputs (until future re-enabling)
    Nebyoodle._disableUI()

    // display modal win thingy
    modalOpen('game-over-win')

    return true
  }
  // we have not won, so check if we've reached the max guesses
  else if (Nebyoodle.__getGuesses().length >= NEBYOODLE_CHANCE_MAX) {
    // disable inputs (until future re-enabling)
    Nebyoodle._disableUI()

    modalOpen('game-over-lose')

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

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      break
    case 'wrong':
      svg.src = '/assets/images/cross.svg'
      svg.classList.add('wrong')
      title.innerHTML = guessText

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      break
    case 'correct':
      svg.src = '/assets/images/checkmark.svg'
      svg.classList.add('correct')
      title.innerHTML = guessText

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      break
    default:
      break
  }

  // if game is not yet won, AND we still have skips left, then update audio and UI
  if (Nebyoodle.__getGameState() == 'IN_PROGRESS'
    && Nebyoodle.__getGuesses().length < NEBYOODLE_CHANCE_MAX
  ) {
    // update timeline
    const fillVal = NEBYOODLE_DUR_PCT[Nebyoodle.__getGuesses().length]

    Nebyoodle.dom.timelineUnplayed.setAttribute('fill', fillVal)
    Nebyoodle.dom.timelineUnplayed.style.transform = `scaleX(${fillVal})`

    // update skip button
    Nebyoodle.dom.mainUI.skipSeconds.innerText = NEBYOODLE_SKP_TXT[
      Nebyoodle.__getGuesses().length
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
          Nebyoodle._debugWinGame()
        })
      }
      // 🏅 almost win game (post-penultimate move)
      if (Nebyoodle.dom.interactive.debug.btnWinGameAlmost) {
        Nebyoodle.dom.interactive.debug.btnWinGameAlmost.addEventListener('click', () => {
          Nebyoodle._debugWinGame('almost')
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

Nebyoodle.__getDurationMax = function(mode = null) {
  const guessLength = Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .guesses
    .length

  return NEBYOODLE_SKP_VAL[guessLength]
}
Nebyoodle.__setDurationMax = function(durationMax, mode = null) {
  Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .durationMax = durationMax
}

Nebyoodle.__getGameState = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .gameState
}
Nebyoodle.__setGameState = function(gameState, mode = null) {
  Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .gameState = gameState
}

Nebyoodle.__getGuesses = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .guesses
}
Nebyoodle.__addGuess = function(guess) {
  const mode = Nebyoodle.__getGameMode()

  console.log('__addGuess', mode)

  Nebyoodle
    .state[mode][Nebyoodle.__getLastPlayIndex()]
    .guesses
    .push(guess)
}

Nebyoodle.__getSongId = function(mode = null) {
  return Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .songId
}
Nebyoodle.__setSongId = function(songId, mode = null) {
  // console.log('__setSongId:', mode ? mode : Nebyoodle.__getGameMode())

  Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()][Nebyoodle.__getLastPlayIndex()]
    .songId = songId
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
Nebyoodle.__setSolution = async function(method, solution, mode = null) {
  // console.log(`__setSolution(${solution}) for '${mode ? mode : Nebyoodle.__getGameMode()}' state with '${method}'`)

  // console.log('Nebyoodle.config', Nebyoodle.config)

  if (method == 'string') {
    // console.log(`SETTING '${mode ? mode : Nebyoodle.__getGameMode()}' SOLUTION WITH STRING`, solution)

    Nebyoodle
      .config[mode ? mode : Nebyoodle.__getGameMode()]
      .solution = solution

    // console.log('Nebyoodle.config(set by string)', Nebyoodle.config)

    return Promise.resolve(true)
  } else {
    // console.log(`SETTING '${mode ? mode : Nebyoodle.__getGameMode()}' SOLUTION WITH SONGID`, solution)

    const response = await fetch(`${NEBYOODLE_SONGID_SCRIPT}?songId=${solution}`)
    const json = await response.json()
    const data = json.data[0]

    // console.log('__setSolution data:', data)

    const title = `${data.title} - ${data.field_album_id.name}`

    // console.log('__setSolution title:', title)

    if (title) {
      Nebyoodle
        .config[mode ? mode : Nebyoodle.__getGameMode()]
        .solution = title

      // console.log('Nebyoodle.config(set by songId)', Nebyoodle.config)
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
  const index = Nebyoodle
    .state[mode ? mode : Nebyoodle.__getGameMode()]
    .length - 1

  // console.log('__getLastPlayIndex', index)

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
  const mode = Nebyoodle.settings.gameMode

  // console.log('__getGameMode:', mode)

  return mode
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
