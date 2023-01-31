/* main */
/* app entry point and main functions */
/* global Nebyoodle */

// global check to see if we've shown this already
// once we show it, we toggle this until the next
// time that the app is loaded
Nebyoodle.showStartModal = true

// settings: saved in LOCAL STORAGE
Nebyoodle.settings = {}

// state: saved between sessions LOCAL STORAGE
Nebyoodle.state = {}
Nebyoodle.state.daily = {}
Nebyoodle.state.free = {}

// config: only saved while game is loaded
Nebyoodle.config = {}
Nebyoodle.config.daily = NEBYOODLE_DEFAULTS.config.daily
Nebyoodle.config.free = NEBYOODLE_DEFAULTS.config.free

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
async function modalOpen(type) {
  switch(type) {
    case 'start':
    case 'help':
      this.myModal = new Modal('perm', 'How to Play Nebyoodle',
        `
          <p>Listen to the intro of a Nebyoolae music track, and then find the correct title in the list.</p>

          <p>Skipped or incorrect attempts unlock more of the track.</p>

          <p>Answer in as few tries as possible and share your score!</p>

          <h4>Daily</h4>
          <p>One new track to guess each day.</p>

          <h4>Free</h4>
          <p>Keep guessing as many tracks as you want! Go for the longest combo!</p>

          <hr />

          <p><strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>.</p>
        `,
        null,
        null
      )
      break

    case 'stats':
    case 'win':
      let dailyWins = 0
      let dailyTotal = 0
      let dailyStreakCur = 0
      let dailyStreakBroken = false
      let dailyStreakMax = 0
      let dailyStreakMaxBest = 0

      Nebyoodle.state.daily.statistics.map(stat => {
        if (stat.score > 0) {
          dailyWins += 1
        }

        dailyTotal += 1
      })

      Nebyoodle.state.daily.statistics.slice(0).reverse().map(stat => {
        if (stat.score > 0) {
          if (!dailyStreakBroken) {
            dailyStreakCur += 1
          }
          dailyStreakMax += 1
          dailyStreakMaxBest = dailyStreakMax
        } else {
          dailyStreakCur = 0
          dailyStreakBroken = true
          dailyStreakMax = 0
        }
      })

      let freeWins = 0
      let freeTotal = 0
      let freeStreakCur = 0
      let freeStreakBroken = false
      let freeStreakMax = 0
      let freeStreakMaxBest = 0

      Nebyoodle.state.free.statistics.map(stat => {
        if (stat.score > 0) {
          freeWins += 1
        }

        freeTotal += 1
      })

      Nebyoodle.state.free.statistics.slice(0).reverse().map(stat => {
        if (stat.score > 0) {
          if (!freeStreakBroken) {
            freeStreakCur += 1
          }

          freeStreakMax += 1
          freeStreakMaxBest = freeStreakMax
        } else {
          freeStreakCur = 0
          freeStreakBroken = true
          freeStreakMax = 0
        }
      })

      let modalText = `
        <div class="container">

          <div class="statistic-header">Daily</div>
          <div class="statistic-subheader">
            (<small>New puzzle available at 12am PST</small>)
          </div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${dailyWins}/${dailyTotal}</div>
              <div class="statistic-label">Correct</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Math.round(dailyWins / dailyTotal)}%</div>
              <div class="statistic-label">Correct %</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${dailyStreakCur} : ${dailyStreakMaxBest}</div>
              <div class="statistic-label">Current : Max Streak</div>
            </div>
          </div>

          <div class="statistic-header">Free Play</div>
          <div class="statistics">
            <div class="statistic-container">
              <div class="statistic">${freeWins}/${freeTotal}</div>
              <div class="statistic-label">Correct</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${Math.round(freeWins / freeTotal)}%</div>
              <div class="statistic-label">Correct %</div>
            </div>
            <div class="statistic-container">
              <div class="statistic">${freeStreakCur} : ${freeStreakMaxBest}</div>
              <div class="statistic-label">Current : Max Streak</div>
            </div>

          </div>
      `

      if (Nebyoodle.state[Nebyoodle.__getGameMode()].gameState == 'GAME_OVER') {
        modalText += `
          <div class="share">
            <button class="share" onclick="Nebyoodle._shareResults()">Share <i class="fa-solid fa-share-nodes"></i></button>
          </div>
        `
      }

      modalText += `
        </div>
      `
      this.myModal = new Modal('perm', 'Statistics',
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

    case 'get-track':
      Nebyoodle._getTrack()
      break
    case 'get-tracks':
      Nebyoodle._getTracks()
      break

    case 'show-solution':
      this.myModal = new Modal('perm-debug', 'Master Word List',
        Nebyoodle._displayGameSolution(),
        null,
        null
      )
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

    case 'loading':
      this.myModal = new Modal('throbber', 'Loading',
        'loading...',
        null,
        null,
        false
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

  // console.log('Nebyoodle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// load state/statistics from LS -> code model
Nebyoodle._loadGame = async function() {
  let dailyCreateOrLoad = ''
  let freeCreateOrLoad = ''

  /* ************************* */
  /* daily state LS -> code    */
  /* ************************* */

  const lsStateDaily = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_DAILY_KEY))

  // if we have previous LS values, sync them to code model
  if (lsStateDaily) {
    // console.log('DAILY localStorage state key found and loading...', lsStateDaily)

    const dailyDefaults = NEBYOODLE_DEFAULTS.state.daily

    Nebyoodle.state.daily.gameState = lsStateDaily.gameState || dailyDefaults.gameState
    Nebyoodle.state.daily.lastCompletedTime = lsStateDaily.lastCompletedTime || null
    Nebyoodle.state.daily.lastPlayedTime = lsStateDaily.lastPlayedTime || null
    Nebyoodle.state.daily.statistics = lsStateDaily.statistics || dailyDefaults.statistics

    // console.log('DAILY localStorage state key loaded')

    // special case for daily word: need to check
    // to make sure time hasn't elapsed on saved progress
    try {
      // console.log('_loadGame->fetching NEBYOODLE_DAILY_SCRIPT')

      const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
      const data = await response.json()
      const dailyWord = data['word']

      // saved word and daily word are the same? still working on it
      if (dailyWord == lsStateDaily.seedWord) {
        Nebyoodle.state.daily.gameState = lsStateDaily.gameState
        Nebyoodle.state.daily.guessedWords = lsStateDaily.guessedWords
        Nebyoodle.state.daily.seedWord = lsStateDaily.seedWord

        // console.log(`Seed word for ${Nebyoodle.__getTodaysDate()}:`, dailyWord.toUpperCase())

        dailyCreateOrLoad = 'load'
      }
      // time has elapsed on daily puzzle, and new one is needed
      else {
        // console.log('LS seedWord and dailyWord do not match, so create new puzzle')

        Nebyoodle.state.daily.gameState = 'IN_PROGRESS'
        Nebyoodle.state.daily.guessedWords = []

        Nebyoodle._saveGame()

        dailyCreateOrLoad = 'create'
      }

      Nebyoodle.__updateDailyDetails(data['index'])
    } catch (e) {
      console.error('could not get daily seed word', e)
    }
  } else {
    Nebyoodle.state.daily = NEBYOODLE_DEFAULTS.state.daily

    // console.log('DAILY localStorage state key NOT found; defaults set')
    // console.log('DAILY solution to be created with daily word hash')

    dailyCreateOrLoad = 'create'
  }

  /* ************************* */
  /* free state LS -> code     */
  /* ************************* */

  const lsStateFree = JSON.parse(localStorage.getItem(NEBYOODLE_STATE_FREE_KEY))

  // if we have previous LS values, sync them to code model
  if (lsStateFree) {
    // console.log('FREE localStorage state key found and loading...', lsStateFree)

    const freeDefaults = NEBYOODLE_DEFAULTS.state.free

    Nebyoodle.state.free.difficulty = lsStateFree.difficulty || freeDefaults.difficulty
    Nebyoodle.state.free.gameState = lsStateFree.gameState || freeDefaults.gameState
    Nebyoodle.state.free.guessedWords = lsStateFree.guessedWords || freeDefaults.guessedWords
    Nebyoodle.state.free.lastCompletedTime = lsStateFree.lastCompletedTime || freeDefaults.lastCompletedTime
    Nebyoodle.state.free.lastPlayedTime = lsStateFree.lastPlayedTime || freeDefaults.lastPlayedTime
    Nebyoodle.state.free.seedWord = lsStateFree.seedWord || freeDefaults.seedWord
    Nebyoodle.state.free.statistics = lsStateFree.statistics || freeDefaults.statistics

    // console.log('FREE localStorage state key loaded; solution to be created with previous seedWord')

    freeCreateOrLoad = 'load'
  } else {
    Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

    // console.log('FREE localStorage state key NOT found; defaults set')
    // console.log('FREE solution to be created with randomly-chosen word')

    freeCreateOrLoad = 'create'
  }

  /* ************************* */
  /* settings LS -> code       */
  /* ************************* */

  Nebyoodle._loadSettings()

  /* ************************* */
  /* create/load solutionSet   */
  /* ************************* */

  if (Nebyoodle.__getGameMode() == 'daily') { // daily
    Nebyoodle.dom.interactive.difficultyContainer.classList.remove('show')
    Nebyoodle.dom.dailyDetails.classList.add('show')

    if (dailyCreateOrLoad == 'load') {
      await Nebyoodle._loadExistingSolutionSet('daily', Nebyoodle.state.daily.seedWord)
    } else {
      await Nebyoodle._createNewSolutionSet('daily')
    }

    // console.log('DAILY solutionSet loaded!', Nebyoodle.state.daily.seedWord.toUpperCase())
  } else { // free
    if (freeCreateOrLoad == 'load') {
      await Nebyoodle._loadExistingSolutionSet('free', Nebyoodle.state.free.seedWord)
    } else {
      await Nebyoodle._createNewSolutionSet('free')
    }

    // console.log('FREE solutionSet loaded!', Nebyoodle.state.free.seedWord.toUpperCase())
  }

  if (Nebyoodle.__getGameMode() == 'daily' && Nebyoodle.state.daily.lastPlayedTime == null) {
    // console.log('daily gameMode + no lastPlayedTime')

    if (Nebyoodle.showStartModal) {
      modalOpen('start')
      Nebyoodle.showStartModal = false
    }
  }
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

  var lsSettings = JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_KEY))

  if (lsSettings) {
    Nebyoodle.settings.darkMode = lsSettings.darkMode

    if (Nebyoodle.settings.darkMode) {
      document.body.classList.add('dark-mode')

      var setting = document.getElementById('button-setting-dark-mode')

      if (setting) {
        setting.dataset.status = 'true'
      }
    }

    Nebyoodle.settings.gameMode = lsSettings.gameMode || 'daily'
  } else {
    Nebyoodle.settings = NEBYOODLE_DEFAULTS.settings
  }

  // STATE->GAMEMODE
  if (Nebyoodle.settings.gameMode == 'free') {
    Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = false
    Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = true
    Nebyoodle.dom.dailyDetails.classList.remove('show')
  }

  // console.log('loaded settings from LS!', Nebyoodle.settings)
}
// change a setting (gear icon or difficulty) value
Nebyoodle._changeSetting = async function(setting, value, event) {
  switch (setting) {
    case 'gameMode':
      switch (value) {
        case 'daily':
          // console.log('**** switchING game mode to DAILY ****')

          // get seedWord for today
          if (!Nebyoodle.state.daily.seedWord) {
            try {
              // console.log('_changeSetting->fetching NEBYOODLE_DAILY_SCRIPT')

              const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
              const data = await response.json()
              Nebyoodle.state.daily.seedWord = data['word']

              Nebyoodle.__updateDailyDetails(data['index'])
            } catch (e) {
              console.error('could not get daily word', e)
            }
          }

          Nebyoodle._saveSetting('gameMode', 'daily')
          Nebyoodle._clearHint()

          Nebyoodle.dom.interactive.btnCreateNew.disabled = true

          // set dom status
          Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = true
          Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = false
          Nebyoodle.dom.interactive.difficultyContainer.classList.remove('show')
          Nebyoodle.dom.dailyDetails.classList.add('show')

          await Nebyoodle._loadExistingSolutionSet('daily', Nebyoodle.state.daily.seedWord)

          Nebyoodle._saveGame()

         //  console.log('**** switchED game mode to DAILY ****')

          break

        case 'free':
          // console.log('**** switchING game mode to FREE ****')

          Nebyoodle._saveSetting('gameMode', 'free')
          Nebyoodle._clearHint()

          Nebyoodle.dom.interactive.btnCreateNew.disabled = false

          // set dom status
          Nebyoodle.dom.interactive.gameModeDailyLink.dataset.active = false
          Nebyoodle.dom.interactive.gameModeFreeLink.dataset.active = true
          Nebyoodle.dom.interactive.difficultyContainer.classList.add('show')
          Nebyoodle.dom.dailyDetails.classList.remove('show')

          await Nebyoodle._loadExistingSolutionSet('free', Nebyoodle.state.free.seedWord)

          Nebyoodle._saveGame()

          // console.log('**** switched game mode to FREE ****')

          break
      }

      break

    case 'darkMode':
      var st = document.getElementById('button-setting-dark-mode').dataset.status

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

  var settings = JSON.parse(localStorage.getItem(NEBYOODLE_SETTINGS_KEY))

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

  var qd = {};
  if (location.search) location.search.substr(1).split("&").forEach(function(item) {
    var s = item.split("="),
        k = s[0],
        v = s[1] && decodeURIComponent(s[1]); //  null-coalescing / short-circuit
    //(k in qd) ? qd[k].push(v) : qd[k] = [v]
    (qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
  })

  if (qd.debugCSS && qd.debugCSS == 1) {
    var debugStyles = document.createElement('link')
    debugStyles.rel = 'stylesheet'
    debugStyles.href = './assets/css/debug.css'
    document.head.appendChild(debugStyles)
  }
}

// create new solutionSet, which resets progress
Nebyoodle._createNewSolutionSet = async function(gameMode) {
  console.log(`**** creatING new '${gameMode}' solutionSet ****`)

  // set state to defaults
  Nebyoodle.state[gameMode].gameState = 'IN_PROGRESS'
  Nebyoodle.state[gameMode].lastCompletedTime = null
  Nebyoodle.state[gameMode].lastPlayedTime = null
}

// load existing solutionSet, which retains past progress
Nebyoodle._loadExistingSolutionSet = async function(gameMode) {
  console.log(`**** loadING existing '${gameMode}' solutionSet ****`)
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
    var confirmed = await myConfirm.question()

    if (confirmed) {
      Nebyoodle._resetFreeProgress()
      await Nebyoodle._createNewSolutionSet('free')
    }
  } catch (err) {
    console.error('progress reset failed', err)
  }
}

// reset config, state, and LS for free play
Nebyoodle._resetFreeProgress = async function() {
  // console.log('resetting free play progress...')

  // save previous stats
  const prevGamesPlayed = Nebyoodle.state.free.statistics.gamesPlayed
  const prevWordsFound = Nebyoodle.state.free.statistics.wordsFound

  // set config and state to defaults
  Nebyoodle.config.free = NEBYOODLE_DEFAULTS.config.free
  Nebyoodle.state.free = NEBYOODLE_DEFAULTS.state.free

  // re-add previous stats
  Nebyoodle.state.free.statistics = {
    "gamesPlayed": prevGamesPlayed,
    "wordsFound": prevWordsFound
  }

  // set dictionary to default
  Nebyoodle._initDictionaryFile('free')

  // set score to 0
  Nebyoodle._setScore(0)

  // re-enable DOM inputs
  Nebyoodle._resetInput()

  // choose letters randomly from solutionSet
  Nebyoodle._shuffleTiles()

  // save those defaults to localStorage
  Nebyoodle._saveGame()
}

// submit a guess
Nebyoodle._submitGuess = function(guess) {
  console.log('submitting guess...', guess)

  if (Nebyoodle.state[Nebyoodle.__getGameMode()].gameState == 'IN_PROGRESS') {
    console.log('game still in progresss, so guess submitted');
  } else {
    // game is over, so no more guessed allowed
    console.error('current game is over; no more guesses!')
  }
}

// game state checking
Nebyoodle._checkGuess = function() {
  // console.log('checking current guess...')

  // reset classes
  Nebyoodle.dom.guess.classList.remove('valid', 'first-guess')
  Nebyoodle.dom.interactive.btnGuessLookup.disabled = true

  // guess valid length?
  if (Nebyoodle.dom.guess.innerHTML.length > 2) {
    let word = Nebyoodle.dom.guess.innerHTML.trim()
    let solutionSet = Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet

    // check all categories of words in solutionSet
    Object.keys(solutionSet).forEach(key => {
      if (parseInt(key) <= Nebyoodle.__getMaxWordLength()) {

        // guess == valid word?
        if (Object.keys(solutionSet[key]).includes(word)) {
          Nebyoodle.dom.guess.classList.add('valid')
          Nebyoodle.dom.interactive.btnGuessLookup.disabled = false

          // and it's the first time?
          if (!solutionSet[key][word]) {
            Nebyoodle.dom.guess.classList.add('first-guess')
            Nebyoodle._animateCSS('#guess', 'pulse')
          }
        }

      }
    })
  }
}
Nebyoodle._checkWinState = function() {
  // console.log('checking for win state...', Nebyoodle.__getGameMode())

  const solutionSet = Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet

  if (solutionSet) {
    const solutionSetValues = []

    Object.values(solutionSet).forEach(cat => {
      Object.values(cat).forEach(val => {
        solutionSetValues.push(val)
      })
    })

    // console.log('solutionSetValues', solutionSetValues)

    if (solutionSetValues.every((val) => val)) {
     //  console.log('Nebyoodle._checkWinState(): game won!', solutionSet)

      // set state stuff
      const gameState = Nebyoodle.state[Nebyoodle.__getGameMode()].gameState

      if (gameState == 'IN_PROGRESS') {
        // make sure to only increment wins if we are going from
        // IN_PROGRESS -> GAME_OVER (ignores page refreshes)
        Nebyoodle.state[Nebyoodle.__getGameMode()].statistics.gamesPlayed += 1
        Nebyoodle.state[Nebyoodle.__getGameMode()].gameState = 'GAME_OVER'

        const now = new Date().getTime()
        Nebyoodle.state[Nebyoodle.__getGameMode()].lastCompletedTime = now
        Nebyoodle.state[Nebyoodle.__getGameMode()].lastPlayedTime = now

        Nebyoodle._saveGame()
      }

      modalOpen('win-game')

      Nebyoodle.__winAnimation().then(() => {
        Nebyoodle.__resetTilesDuration()

        // disable inputs (until future re-enabling)
        Nebyoodle._disableTiles()

        // disable hint (until future re-enabling)
        Nebyoodle._disableHint()

        // disable main UI (until future re-enabling)
        Nebyoodle._disableUIButtons()

        // display modal win thingy
        modalOpen('win')

        return true
      })
    } else {
      // console.log('Nebyoodle._checkWinState(): game not yet won')

      return false
    }
  } else {
    console.error('solutionSet not found')

    return false
  }
}

// reset UI tiles to default state
Nebyoodle._resetInput = function() {
  Nebyoodle._resetTiles()

  Nebyoodle._enableHint()

  Nebyoodle._resetGuess()
}
// blank out the current DOM guess div
Nebyoodle._resetGuess = function() {
  Nebyoodle.dom.guess.innerHTML = ''
  Nebyoodle.dom.guess.classList.remove('valid')
  Nebyoodle.dom.interactive.btnGuessLookup.disabled = true
}

Nebyoodle._disableUIButtons = function() {
  Object.values(Nebyoodle.dom.mainUI).forEach(btn => {
    if (btn.id !== 'button-show-progress') {
      btn.setAttribute('disabled', '')
    }
  })
}

Nebyoodle._getTrack = async function() {
  // current song nid range = 1409 -> 2249
  const params = {
    songId: Math.floor(Math.random() * 1409) + 840
  }

  console.log('params.songId', params.songId)

  const response1 = await fetch(NEBYOODLE_SONG1_SCRIPT + '?songId=' + params.songId)
  const track1 = await response1.json()

  const response2 = await fetch(NEBYOODLE_SONG2_SCRIPT + '?songId=' + params.songId)
  const track2 = await response2.json()

  if (track1.data && track2.data) {
    console.log(track1.data[0], track2.data[0])
    const data1 = track1.data[0];
    const data2 = track2.data[0];

    const title = data1.title
    const artist_id = data1.field_artist_id.name
    const album_id = data2.field_album_id.name
    // const instruments = data.field_instruments.data.map(d => d.meta.drupal_internal__target)

    let html = ''
    html += `<strong>Title</strong>: ${title}, <strong>Artist</strong>: ${artist_id}, <strong>Album</strong>: ${album_id}<br />`
    // html += `<strong>Instruments</strong>: ${instruments}`
    Nebyoodle.dom.trackData.innerHTML = html

  } else {
    console.error('could not fetch track from remote source')
  }
}

Nebyoodle._getTracks = async function() {
  const response = await fetch(NEBYOODLE_DAILY_SCRIPT)
  const tracks = await response.json()

  if (tracks) {
    console.log(tracks.data)
    const data = tracks.data[0];
    const title = data.attributes.title

    // const instruments = data.field_instruments.data.map(d => d.meta.drupal_internal__target)

    let html = ''
    html += `<strong>Title</strong>: ${title}`
    // html += `, <strong>Artist</strong>: ${artist_id}`
    // html += `, <strong>Album</strong>: ${album_id}<br />`
    // html += `<strong>Instruments</strong>: ${instruments}`
    Nebyoodle.dom.trackData.innerHTML = html

  } else {
    console.error('could not fetch tracks from remote source')
  }
}

// modal: show how many words have been guessed
Nebyoodle._displayGameProgress = function() {
  var html = ''

  if (Nebyoodle.__getGameMode() == 'free') {
    html += `<h6>difficulty: ${Nebyoodle.state[Nebyoodle.__getGameMode()].difficulty}</h6>`
  }

  html += '<ul>'

  // check each length category (max...3, etc.)
  // total up words guessed in each
  Object.keys(Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet).reverse().forEach(category => {
    if (parseInt(category) <= Nebyoodle.__getMaxWordLength()) {
      html += `<li><span class="solution-category">${category}-LETTER</span>`

      var categoryEntries = Object.entries(Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet[category])
      var categoryGuessed = categoryEntries
        .filter(entry => entry[1])

      categoryLength = Object.keys(Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet[category])
        .length

      html += ` ${categoryGuessed.length} of ${categoryLength}`
      html += `<ul><li>`
      html += categoryGuessed.map(x => x[0].toUpperCase()).sort().join(', ')
      html += `</li></ul></li>`
    }
  })

  html += '</ul>'

  return html
}

// modal: debug: display Nebyoodle.config
Nebyoodle._displayGameConfig = function() {
  let configs = Nebyoodle.config

  // console.log('configs', configs)

  var html = ''

  html += `<h3>GLOBAL (ENV: ${Nebyoodle.env})</h3>`
  html += '<h3>----------------------------</h3>'

  html += '<dl>'

  Object.keys(configs).forEach(config => {
    html += `<h4>CONFIG: ${config}</h4>`

    Object.keys(configs[config]).sort().forEach(key => {
      if (
        (typeof configs[config][key] == 'object'
          && !Array.isArray(configs[config][key])
          && configs[config][key] != null
        )
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        // skip object-within-object key
        if (key == 'solutionSet') {
          html += '<dd><code>v See console.log v</code></dd>'
          html += '</dl><code>}</code></dd>'
        } else {
          Object.keys(configs[config][key]).forEach(k => {
            var label = k
            var value = configs[config][key][k]

            if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
              value = Nebyoodle.__getFormattedDate(new Date(value))
            }

            if (Object.keys(value)) {
              // console.log('found another object', key, label, value)
            } else {
              html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
            }
          })

          html += '</dl><code>}</code></dd>'
        }
      }
      else {
        var label = key
        var value = configs[config][key]

        if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
          if (value) {
            value = Nebyoodle.__getFormattedDate(new Date(value))
          }
        }

        // special cases
        if (label == 'hintWord') {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.toUpperCase() : value}</dt>`
        } else if (label == 'hintObscuredWord' || label == 'letters') {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.map(v => v.toUpperCase()).join(', ') : value}</dt>`
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })

    // console.log(`Nebyoodle.config[${config}].solutionSet`, Nebyoodle.config[config].solutionSet)
  })

  html += '</dl>'

  return html
}
// modal: debug: display Nebyoodle.state
Nebyoodle._displayGameState = function() {
  let states = Nebyoodle.state

  var html = ''

  html += '<dl>'

  Object.keys(states).forEach(state => {
    html += `<h4>STATE: ${state}</h4>`

    Object.keys(states[state]).forEach(key => {
      if (typeof states[state][key] == 'object'
        && !Array.isArray(states[state][key])
        && states[state][key] != null
      ) {
        html += `<dd><code>${key}: {</code><dl>`

        if (key == 'statistics') {
          Object.keys(states[state][key]).forEach(subkey => {
            var label = subkey
            var value = states[state][key][subkey]

            html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
          })

          html += '</dl><code>}</code></dd>'
        }
        else {
          Object.keys(states[state][key]).forEach(k => {
            var label = k
            var value = states[state][key][k]

            if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
              value = Nebyoodle.__getFormattedDate(new Date(value))
            }

            if (value) {
              html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
            }
          })

          html += '</dl><code>}</code></dd>'
        }
      } else {
        var label = key
        var value = states[state][key]

        // special cases
        if (label == 'lastCompletedTime' || label == 'lastPlayedTime') {
          if (value) {
            value = Nebyoodle.__getFormattedDate(new Date(value))
          }
        } else if (label == 'guessedWords') {
          html += `<dd><code>${label}:</code></dd><dt>`
          html += `${value ? value.map(v => v.toUpperCase()).join(', ') : value}</dt>`
        } else if (label == 'seedWord') {
          html += `<dd><code>${label}:</code></dd><dt>${value ? value.toUpperCase() : value}</dt>`
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
        }
      }
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: display current gameMode solution
Nebyoodle._displayGameSolution = function() {
  let html = ''
  const gameMode = Nebyoodle.__getGameMode()

  html += `<h3>Game Mode: ${gameMode.toUpperCase()}</h3>`
  html += '<ul>'

  // check each length category (max...3, etc.)
  Object.keys(Nebyoodle.config.daily.solutionSet).reverse().forEach(key => {
    if (Object.keys(Nebyoodle.config[gameMode].solutionSet).includes(key)) {
      var solutionWords = []

      html += `<li><span class="solution-category">${key}-LETTER</span><ul><li>`

      // create sorted array of each length category's words
      var sortedArr = Array.from(Object.keys(Nebyoodle.config[gameMode].solutionSet[key])).sort()

      // go through each word in each category
      sortedArr.forEach(word => {
        // mark guessed words
        if (Nebyoodle.state[gameMode].guessedWords.includes(word)) {
          word = `<strong>${word}</strong>`
        }

        solutionWords.push(word.toUpperCase())
      })

      // add all the words to the markup
      html += solutionWords.join(', ')
      html += `</li></ul></li>`
    }
  })

  html += '</ul>'

  return html
}

// handle both clicks and touches outside of modals
Nebyoodle._handleClickTouch = function(event) {
  var dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    var isConfirm = dialog.classList.contains('modal-confirm')

    // only close if not a confirmation!
    if (event.target == dialog && !isConfirm) {
      dialog.remove()
    }
  }

  if (event.target == Nebyoodle.dom.navOverlay) {
    Nebyoodle.dom.navOverlay.classList.toggle('show')
  }
}

// debug: beat game to check win state
Nebyoodle._winGame = function(state = null) {
  const solutionSet = Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet
  const solutionSetSize = Nebyoodle.__getSolutionSize()

  modalOpen('win-game-hax')

  if (state == 'almost') {
    console.log('HAX! Setting game to one word left...')

    let count = 0

    // set to winning, but stop one short
    Object.keys(solutionSet).forEach(category => {
      if (count == solutionSetSize - 1) return

      Object.keys(solutionSet[category]).forEach(word => {
        if (solutionSet[category][word] == 0) {
          Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet[category][word] = 1
          Nebyoodle.state[Nebyoodle.__getGameMode()].guessedWords.push(word)
          Nebyoodle.state[Nebyoodle.__getGameMode()].statistics.wordsFound += 1
        }

        count += 1

        if (count == solutionSetSize - 1) return
      })
    })

    Nebyoodle._setScore(count)

    Nebyoodle.state[Nebyoodle.__getGameMode()].lastPlayedTime = new Date().getTime()

    Nebyoodle._saveGame()
  } else {
    console.log('HAX! Winning game immediately...')

    // set to winning
    Object.keys(solutionSet).forEach(category => {
      Object.keys(solutionSet[category]).forEach(word => {
        if (solutionSet[category][word] == 0) {
          Nebyoodle.config[Nebyoodle.__getGameMode()].solutionSet[category][word] = 1
          Nebyoodle.state[Nebyoodle.__getGameMode()].guessedWords.push(word)
          Nebyoodle.state[Nebyoodle.__getGameMode()].statistics.wordsFound += 1
        }
      })
    })

    Nebyoodle._setScore(Nebyoodle.__getSolutionSize())

    Nebyoodle._saveGame()
  }

  Nebyoodle._checkWinState()
}

// copy results to clipboard for sharing
Nebyoodle._shareResults = async function() {
  const shareText = `
    I beat Nebyoodle on ${Nebyoodle.__getTodaysDate()}. Have you tried? https://nebyoodle.neb.host
  `

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

// add event listeners to DOM
Nebyoodle._attachEventListeners = function() {
  // {} header icons to open modals
  Nebyoodle.dom.interactive.btnNav.addEventListener('click', () => {
    Nebyoodle.dom.navOverlay.classList.toggle('show')
  })
  Nebyoodle.dom.interactive.btnNavClose.addEventListener('click', () => {
    Nebyoodle.dom.navOverlay.classList.toggle('show')
  })
  Nebyoodle.dom.interactive.btnHelp.addEventListener('click', () => modalOpen('help'))
  Nebyoodle.dom.interactive.btnStats.addEventListener('click', () => modalOpen('stats'))
  Nebyoodle.dom.interactive.btnSettings.addEventListener('click', () => modalOpen('settings'))

  // local debug buttons
  if (Nebyoodle.env == 'local') {
    if (Nebyoodle.dom.interactive.debug.all) {
      // 🪣 get single Nebyoolae track from music.nebyoolae.com
      Nebyoodle.dom.interactive.debug.btnGetTrack.addEventListener('click', () => {
        modalOpen('get-track')
      })
      // 🪣 get Nebyoolae tracks from music.nebyoolae.com
      Nebyoodle.dom.interactive.debug.btnGetTracks.addEventListener('click', () => {
        modalOpen('get-tracks')
      })

      // 🪣 show master word list
      Nebyoodle.dom.interactive.debug.btnShowList.addEventListener('click', () => {
        modalOpen('show-solution')
      })

      // ⚙️ show current Nebyoodle config
      Nebyoodle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })

      // 🎚️ show current Nebyoodle state
      Nebyoodle.dom.interactive.debug.btnShowState.addEventListener('click', () => {
        modalOpen('show-state')
      })

      // 🏆 win game immediately
      Nebyoodle.dom.interactive.debug.btnWinGame.addEventListener('click', () => {
        Nebyoodle._winGame()
      })
      // 🏅 almost win game (post-penultimate move)
      Nebyoodle.dom.interactive.debug.btnWinGameAlmost.addEventListener('click', () => {
        Nebyoodle._winGame('almost')
      })
      // 🏁 display win tile animation
      Nebyoodle.dom.interactive.debug.btnWinAnimation.addEventListener('click', () => {
        Nebyoodle.__winAnimation().then(() => Nebyoodle.__resetTilesDuration())
      })
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

// timestamp to display date
Nebyoodle.__getFormattedDate = function(date) {
  var formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
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
}


/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Nebyoodle.initApp()
