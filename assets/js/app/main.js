/* main */
/* app entry point and main functions */
/* global Nebyoodle */

// settings: saved in LOCAL STORAGE
Nebyoodle.settings = NEBYOODLE_DEFAULT_SETTINGS

// config: only saved while game is loaded
Nebyoodle.config = NEBYOODLE_DEFAULTS.config

// state: saved between sessions in LOCAL STORAGE
Nebyoodle.state = NEBYOODLE_DEFAULTS.state

/*************************************************************************
 * public methods *
 *************************************************************************/

// modal methods
Nebyoodle.modalOpen = async function (type, data = null) {
  let modalText = ''

  switch (type) {
    case 'start':
    case 'help':
      if (Nebyoodle.myModal) {
        Nebyoodle.myModal._destroyModal()
      }

      modalText = `
        <p>Listen to the intro of a Nebyoolae song, and then find the correct title/album in the list.</p>

        <p>Skipped or incorrect attempts unlock more of the song.</p>

        <p>Answer in as few tries as possible, and then share your score!</p>

        <h4>Daily</h4>
        <p>One new song to guess each day.</p>

        <h4>Free Play</h4>
        <p>Guess as many songs as you want! Go for the longest combo!</p>

        <hr />

        <strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. Find all music at
        <a href="https://music.nebyoolae.com" target="_blank">NebyooMusic</a>.
      `

      Nebyoodle.myModal = new Modal('perm', 'How to Play Nebyoodle', modalText, null, null)

      if (!localStorage.getItem(NEBYOODLE_SETTINGS_LS_KEY)) {
        localStorage.setItem(NEBYOODLE_SETTINGS_LS_KEY, JSON.stringify(NEBYOODLE_DEFAULTS.settings))
      }

      Nebyoodle._saveSetting('firstTime', false)

      break

    case 'readysetguess':
      Nebyoodle.myTempModal = new Modal('temp', null, 'Ready, set, guess!', null, null)
      break

    case 'stats':
      if (Nebyoodle.myModal) {
        Nebyoodle.myModal._destroyModal()
      }

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

      Nebyoodle.myModal = new Modal('perm', 'Statistics', modalText, null, null, false)

      break

    case 'game-over-win':
      if (Nebyoodle.myModal) {
        Nebyoodle.myModal._destroyModal()
      }

      modalText = `
        <div class="container game-over-win">
      `
      modalText += await Nebyoodle.__getWinMarkup(data)

      if (Nebyoodle.__getGameMode() == 'free') {
        modalText += `<button class="game-over new-free" onclick="Nebyoodle._createNewFree()" title="Try another song?">Try another song? <i class="fa-solid fa-music"></i></button>`
      }

      modalText += `
        <div class="share">
          <button class="game-over share" onclick="Nebyoodle._shareResults()" title="Share Nebyoodle result">Share <i class="fa-solid fa-share-nodes"></i></button>
        </div>
      `

      if (Nebyoodle.__getGameMode() == 'daily') {
        modalText += `<div>New daily song available at 12 am PST</div>`
      }

      modalText += `
        </div>
      `

      if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

      Nebyoodle.myModal = new Modal(
        'end-state',
        'Congratulations! You guessed the song!',
        modalText,
        null,
        null,
        'game-over-win'
      )
      break

    case 'game-over-lose':
      if (Nebyoodle.myModal) {
        Nebyoodle.myModal._destroyModal()
      }

      modalText = `
        <div class="container game-over-lose">
      `
      modalText += await Nebyoodle.__getWinMarkup(data)

      if (Nebyoodle.__getGameMode() == 'free') {
        modalText += `<button class="new-free" onclick="Nebyoodle._createNewFree()" title="Try another song?">Try another song? <i class="fa-solid fa-music"></i></button>`
      }

      modalText += `
        <div class="share">
          <button class="share" onclick="Nebyoodle._shareResults()" title="Share Nebyoodle result">Share <i class="fa-solid fa-share-nodes"></i></button>
        </div>
      `

      if (Nebyoodle.__getGameMode() == 'daily') {
        modalText += `<div>New daily song available at 12 am PST</div>`
      }

      modalText += `
        </div>
      `

      Nebyoodle.myModal = new Modal(
        'end-state',
        "Bummer! You didn't guess the song!",
        modalText,
        null,
        null,
        'game-over-lose'
      )
      break

    case 'settings':
      if (Nebyoodle.myModal) {
        Nebyoodle.myModal._destroyModal()
      }

      Nebyoodle.myModal = new Modal(
        'perm',
        'Settings',
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
      Nebyoodle.myModal = new Modal(
        'perm-debug',
        'Game Config (code model only)',
        Nebyoodle._debugDisplayConfig(),
        null,
        null
      )
      break

    case 'show-state':
      Nebyoodle.myModal = new Modal(
        'perm-debug',
        'Game State (load/save to LS)',
        Nebyoodle._debugDisplayState(),
        null,
        null
      )
      break

    case 'shared':
      Nebyoodle.myTempModal = new Modal('temp', null, 'Results copied to clipboard', null, null)
      break
    case 'no-clipboard-access':
      Nebyoodle.myModal = new Modal(
        'temp',
        null,
        'Sorry, but access to clipboard not available',
        null,
        null
      )
      break

    case 'win-game-hax':
      Nebyoodle.myTempModal = new Modal('temp', null, 'Hacking the game, I see', null, null)
      break
  }
}

// start the engine
Nebyoodle.initApp = async () => {
  // if local dev, show debug stuff
  if (Nebyoodle.env == 'local') {
    Nebyoodle._initDebug()

    document.title = '(LH) ' + document.title
  }

  Nebyoodle.ui._disableUI()

  Nebyoodle._getNebyooApps()

  Nebyoodle._loadGame()

  Nebyoodle._attachEventListeners()

  Nebyoodle._logStatus('[LOADED] /app/main')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// create new solution, which resets progress
Nebyoodle._createNewSolution = async function (gameMode, reset = null) {
  if (reset) {
    Nebyoodle.__setConfig('gameMode', NEBYOODLE_DEFAULTS.state[gameMode], gameMode)
  } else {
    Nebyoodle.__setConfig('solution', null, gameMode)
    Nebyoodle.__setConfig('songData', null, gameMode)

    Nebyoodle.__setState('gameState', 'IN_PROGRESS', gameMode)
    Nebyoodle.__setState('guesses', [], gameMode)
    Nebyoodle.__setState('songId', null, gameMode)
  }

  Nebyoodle.ui._refreshUI()

  await Nebyoodle._getSong()
}

// load existing solution, which retains past progress
Nebyoodle._loadExistingSolution = async function (gameMode) {
  const songId = Nebyoodle.__getSongId(gameMode)

  await Nebyoodle._getSong(songId)
}

// use to create new free puzzle without confirmation
Nebyoodle._createNewFree = async function () {
  await Nebyoodle._createNewSolution('free')

  Nebyoodle.ui._removeModalVestige()
}

/*************************************************************************
 * public event handler methods *
 *************************************************************************/

// play audio from beginning to durationMax
Nebyoodle._playAudio = async function () {
  try {
    Nebyoodle.ui._togglePlayStopButton()

    Nebyoodle.dom.audioElem.play()
  } catch (err) {
    console.error('could not play audioElem')

    Nebyoodle.ui._togglePlayStopButton()
  }
}

// submit a guess if game still IN_PROGRESS
Nebyoodle._submitGuess = function (guess = null) {
  if (Nebyoodle.__getState().gameState == 'IN_PROGRESS') {
    // guess was skipped
    if (!guess) {
      // add blank guess for skip
      Nebyoodle.__addGuess({
        answer: '',
        isCorrect: false,
        isSkipped: true,
      })

      // update skip button and audio file durationMax, if necessary
      Nebyoodle.__updateStatus('skipped', null)
    }
    // guess was entered
    else {
      // add guess
      Nebyoodle.__addGuess({
        answer: guess,
        isCorrect: false,
        isSkipped: false,
      })

      // update skip button and audio file durationMax, if necessary
      Nebyoodle.__updateStatus('wrong', guess)
    }

    // clear the lookup input
    Nebyoodle.ui._clearGuess()

    // check if a guess has won the game or not
    Nebyoodle._checkWinState()
  } else {
    console.error('current game is over -- no more guesses!')
  }
}

// check latest guess to see if correct and if game is won
Nebyoodle._checkWinState = async function () {
  const solution = Nebyoodle.__getSolution()
  const guesses = Nebyoodle.__getGuesses()
  let gameIsWon = false

  const debugKey = Nebyoodle._loadQueryString('debugKey')

  if (debugKey) {
    const response = await fetch(`${NEBYOODLE_DEBUG_SCRIPT}?debugKey=${debugKey}`)
    const isAllowed = await response.json()

    if (isAllowed) {
      console.log(
        'guesses:',
        Object.values(guesses).map((g) => g.answer)
      )
      console.log(`solution: "${solution}"`)
    }
  }

  if (guesses) {
    // if game won, set state and display win modal
    if (
      Object.values(guesses)
        .map((g) => g.answer)
        .includes(solution)
    ) {
      // make sure answer's `isCorrect` is changed to 'true'
      Object.keys(guesses).forEach((k) => {
        if (guesses[k].answer == solution) {
          // console.log('FUNC _checkWinState(): found correct answer')

          Nebyoodle.__getGuesses()[k].isCorrect = true

          // console.log('SAVE: _checkWinState() found correct answer')
        } else {
          // console.log('FUNC _checkWinState(): no correct answer found')
        }
      })

      // set state stuff
      if (Nebyoodle.__getState().gameState == 'IN_PROGRESS') {
        // console.log('FUNC _checkWinState(): IN_PROGRESS -> GAME_OVER')

        // make sure to only increment wins if we are going from
        // IN_PROGRESS -> GAME_OVER (ignores page refreshes)`
        Nebyoodle.__setState('gameState', 'GAME_OVER')

        // clear the lookup input
        Nebyoodle.ui._clearGuess()

        // update skip button and audio file durationMax, if necessary
        Nebyoodle.__updateStatus('correct-fix', solution)

        // console.log('SAVE: _checkWinState() guesses contain solution')
      }

      // stop audio
      Nebyoodle.ui._resetPlayStopButton()
      Nebyoodle.dom.audioElem.pause()

      // disable inputs (until future re-enabling)
      Nebyoodle.ui._disableUI()

      // display modal win thingy
      Nebyoodle.modalOpen('game-over-win')

      gameIsWon = true
    }
    // game not won, so check if we've reached the max guesses
    else if (
      Nebyoodle.__getGuesses().length >= NEBYOODLE_CHANCE_MAX ||
      Nebyoodle.__getState().gameState == 'GAME_OVER'
    ) {
      // console.log('game not won, and max skips reached')

      // stop audio
      Nebyoodle.ui._resetPlayStopButton()
      Nebyoodle.dom.audioElem.pause()

      // disable inputs (until future re-enabling)
      Nebyoodle.ui._disableUI()

      // console.log('SAVE: _checkWinState() solution not found yet, no more skips')

      // display modal lose thingy
      Nebyoodle.modalOpen('game-over-lose')

      if (!Nebyoodle.myModal) {
        Nebyoodle.modalOpen('game-over-lose')
      }

      gameIsWon = true
    }
    // game not won, and skips remain
    else {
      // console.log('SAVE: _checkWinState() solution not found yet, skips remain')
    }
  }

  // console.log('- save game because finished checking win state')
  Nebyoodle._saveGame()

  return gameIsWon
}

Nebyoodle._loadQueryString = function (param) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  if (params) {
    return params[param]
  } else {
    return false
  }
}

// copy results to clipboard for sharing
Nebyoodle._shareResults = async function () {
  let shareText = Nebyoodle.__getShareText()

  if (navigator.canShare) {
    navigator.share({ text: shareText })
  } else {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          Nebyoodle.modalOpen('shared')
        })
        .catch(() => {
          console.error('could not copy text to clipboard')

          Nebyoodle.modalOpen('no-clipboard-access')

          return
        })
    } else {
      console.warn('no sharing or clipboard access available')

      Nebyoodle.modalOpen('no-clipboard-access')

      return
    }
  }
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Nebyoodle.initApp()
