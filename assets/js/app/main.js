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

  Nebyoodle._saveGame(Nebyoodle.__getGameMode())

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

  // if (navigator.canShare({ text: shareText })) {
  //   navigator.share({ text: shareText }).then(() => {
  //     console.log('sharing was successful')
  //   })
  //   .catch((error) => {
  //     if (error.name == 'AbortError') {
  //       console.log('user canceled share')
  //     } else {
  //       console.log('navigator.share failed', error)
  //     }
  //   })
  //   .finally(() => {
  //     // console.log('navigator.share() ended')
  //   })
  // } else {
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

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Nebyoodle.initApp()
