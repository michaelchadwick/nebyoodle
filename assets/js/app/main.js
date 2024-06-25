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
Nebyoodle.modalOpen = async function(type, data = null) {
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
          <p>Guess as many songs as you want! Go for the longest combo!</p>

          <hr />

          <strong>Dev</strong>: <a href="https://michaelchadwick.info" target="_blank">Michael Chadwick</a>. Find all music at
          <a href="https://music.nebyoolae.com" target="_blank">NebyooMusic</a>.
        `,
        null,
        null
      )
      break

    case 'readysetguess':
      Nebyoodle.myModal = new Modal('temp', null,
        'Ready, set, guess!',
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
        modalText += `<div>New daily song available at 12 am PST</div>`
      }

      modalText += `
        </div>
      `

      if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

      Nebyoodle.myModal = new Modal('end-state', 'Congratulations! You guessed the song!',
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

      if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

      Nebyoodle.myModal = new Modal('end-state', 'Bummer! You didn\'t guess the song!',
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

  // load localStorage game state
  Nebyoodle._loadGame()

  // attach event listeners to DOM elements
  Nebyoodle._attachEventListeners()

  // get global nebapps
  Nebyoodle._getNebyooApps()

  // console.log('Nebyoodle has been initialized!')
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

// create new solution, which resets progress
Nebyoodle._createNewSolution = async function(gameMode, reset = null) {
  // console.log(`**** creatING new '${gameMode}' solution ****`)

  if (reset) {
    Nebyoodle.__setConfig('gameMode', NEBYOODLE_DEFAULTS.state[gameMode], gameMode)
  } else {
    Nebyoodle.__setConfig('solution', null, gameMode)
    Nebyoodle.__setConfig('songData', null, gameMode)

    Nebyoodle.__setState('gameState', 'IN_PROGRESS', gameMode)
    Nebyoodle.__setState('guesses', [], gameMode)
    Nebyoodle.__setState('songId', null, gameMode)
  }

  Nebyoodle._refreshUI()

  await Nebyoodle._getSong()
}

// load existing solution, which retains past progress
Nebyoodle._loadExistingSolution = async function(gameMode) {
  // console.log(`**** loadING existing '${gameMode}' solution ****`, songId)

  const songId = Nebyoodle.__getSongId(gameMode)

  await Nebyoodle._getSong(songId)
}

// use to create new free puzzle without confirmation
Nebyoodle._createAnotherFree = async function() {
  if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()

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

  if (Nebyoodle.myConfirm) Nebyoodle.myConfirm._destroyModal()
  if (Nebyoodle.myModal) Nebyoodle.myModal._destroyModal()
}

Nebyoodle._disableUI = function() {
  Object.values(Nebyoodle.dom.mainUI).forEach(elem => {
    if (elem.id !== 'button-play-stop-icon') {
      elem.setAttribute('disabled', '')
    }
  })
}
// on refresh of site and saved data found, refresh UI
Nebyoodle._refreshUI = function(guesses = null) {
  Object.values(Nebyoodle.dom.guessesContainer.children).forEach(guess => {
    guess.innerHTML = ''
    guess.classList.remove('correct')
    guess.classList.remove('skipped')
    guess.classList.remove('wrong')
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
  // console.log('FUNC enableUI()')

  Object.values(Nebyoodle.dom.mainUI).forEach(elem => {
    if (elem.id !== 'button-play-stop-icon' && elem.id !== 'button-submit') {
      elem.removeAttribute('disabled')
      elem.classList.remove('disabled')
    }
  })
}

Nebyoodle._getWinMarkup = async function() {
  const baseURL = NEBYOOCOM_PROD_URL

  let data = Nebyoodle.__getConfig().songData

  if (!data) {
    const response = await fetch(`${NEBYOODLE_SONGID_SCRIPT}?songId=${Nebyoodle.__getSongId()}`)
    const json = await response.json()

    data = json.data[0]
  }

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
    Nebyoodle._togglePlayStopButton()
  } else {
    Nebyoodle.dom.audioElem.duration = durationMax
  }

  Nebyoodle.__updateStatus()
}

// handle both clicks and touches outside of modals
Nebyoodle._handleClickTouch = function(event) {
  const dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    const isConfirm = dialog.classList.contains('modal-confirm')
    const isTempApi = dialog.classList.contains('temp-api')
    const isEndState = dialog.classList.contains('end-state')

    // only close if not a confirmation (and not a special temp-api/end-state)!
    if (event.target == dialog && !isConfirm && !isTempApi && !isEndState) {
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
    Nebyoodle._togglePlayStopButton()
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

  if (event.target.tagName == 'STRONG') {
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

Nebyoodle._resetPlayStopButton = function() {
  Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.remove('fa-stop')
  Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.add('fa-play')
}

Nebyoodle._togglePlayStopButton = function() {
  if (Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.contains('fa-stop')) {
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.remove('fa-stop')
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.add('fa-play')
  } else {
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.remove('fa-play')
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.add('fa-stop')
  }
}

// copy results to clipboard for sharing
Nebyoodle._shareResults = async function() {
  let shareText = Nebyoodle.__getShareText()

  if (navigator.canShare) {
    navigator.share({ text: shareText })
  } else {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        Nebyoodle.modalOpen('shared')
      }).catch(() => {
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

// play audio from beginning to durationMax
Nebyoodle._playAudio = async function() {
  try {
    // console.log('trying to play audioElem', Nebyoodle.dom.audioElem.src)

    Nebyoodle._togglePlayStopButton()

    Nebyoodle.dom.audioElem.play()
  } catch (err) {
    console.error('could not play audioElem')

    Nebyoodle._togglePlayStopButton()
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

  if (Nebyoodle.__getState().gameState == 'IN_PROGRESS') {
    // guess was skipped
    if (!guess) {
      // add blank guess for skip
      Nebyoodle.__addGuess({
        answer: '',
        isCorrect: false,
        isSkipped: true
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
        isSkipped: false
      })

      // update skip button and audio file durationMax, if necessary
      Nebyoodle.__updateStatus('wrong', guess)
    }

    // clear the lookup input
    Nebyoodle._clearGuess()

    // check if a guess has won the game or not
    Nebyoodle._checkWinState()
  } else {
    console.error('current game is over -- no more guesses!')
  }
}

// check latest guess to see if correct and if game is won
Nebyoodle._checkWinState = async function() {
  // console.log('FUNC _checkWinState()')

  const solution = Nebyoodle.__getSolution()
  const guesses = Nebyoodle.__getGuesses()
  let gameIsWon = false

  const debugKey = Nebyoodle._loadQueryString('debugKey')

  if (debugKey) {
    const response = await fetch(`${NEBYOODLE_DEBUG_SCRIPT}?debugKey=${debugKey}`)
    const isAllowed = await response.json()

    if (isAllowed) {
      console.log('guesses:', Object.values(guesses).map(g => g.answer))
      console.log(`solution: "${solution}"`)
    }
  }

  if (guesses) {
    // if game won, set state and display win modal
    if (Object.values(guesses).map(g => g.answer).includes(solution)) {
      // make sure answer's `isCorrect` is changed to 'true'
      Object.keys(guesses).forEach(k => {
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
        Nebyoodle._clearGuess()

        // update skip button and audio file durationMax, if necessary
        Nebyoodle.__updateStatus('correct-fix', solution)

        // console.log('SAVE: _checkWinState() guesses contain solution')
      }

      // stop audio
      Nebyoodle._resetPlayStopButton()
      Nebyoodle.dom.audioElem.pause()

      // disable inputs (until future re-enabling)
      Nebyoodle._disableUI()

      // display modal win thingy
      Nebyoodle.modalOpen('game-over-win')

      gameIsWon = true
    }
    // game not won, so check if we've reached the max guesses
    else if (Nebyoodle.__getGuesses().length >= NEBYOODLE_CHANCE_MAX || Nebyoodle.__getState().gameState == 'GAME_OVER') {
      // console.log('game not won, and max skips reached')

      // stop audio
      Nebyoodle._resetPlayStopButton()
      Nebyoodle.dom.audioElem.pause()

      // disable inputs (until future re-enabling)
      Nebyoodle._disableUI()

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
    Nebyoodle.modalOpen('help')
  })
  Nebyoodle.dom.interactive.btnStats.addEventListener('click', () => {
    Nebyoodle.modalOpen('stats')
  })
  Nebyoodle.dom.interactive.btnSettings.addEventListener('click', () => {
    Nebyoodle.modalOpen('settings')
  })

  // listen for when audio empties
  Nebyoodle.dom.audioElem.addEventListener('emptied', () => {
    // console.log('audioElem got emptied')

    Nebyoodle._disableUI()
  })
  // now listen for when it gets loaded again
  Nebyoodle.dom.audioElem.addEventListener('canplaythrough', () => {
    // console.log('audioElem can now play again')

    if (Nebyoodle.__getState().gameState == 'IN_PROGRESS') {
      Nebyoodle._enableUI()
    } else {
      // console.log('cannot enableUI because current game is over')
    }
  })

  // check for currentTime changes and update timeline accordingly
  Nebyoodle.dom.audioElem.addEventListener('timeupdate', Nebyoodle._handleAudioDuration)

  // audio play/stop control
  Nebyoodle.dom.mainUI.btnPlayStop.addEventListener('click', Nebyoodle._handlePlayButton, false)

  // guesses
  Nebyoodle.dom.mainUI.guessInput.addEventListener('keyup', Nebyoodle._handleGuessInput, false)
  Nebyoodle.dom.mainUI.guessResultList.addEventListener('click', Nebyoodle._handleGuessList, false)
  Nebyoodle.dom.mainUI.btnGuessClear.addEventListener('click', Nebyoodle._clearGuess)
  // skip/submit
  Nebyoodle.dom.mainUI.btnSkip.addEventListener('click', Nebyoodle._handleSkipButton, false)
  Nebyoodle.dom.mainUI.btnSubmit.addEventListener('click', Nebyoodle._handleSubmitButton, false)

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Space' && document.activeElement.id != 'guess-input') {
      Nebyoodle._handlePlayButton()
    }
  })

  // if local dev, show debug buttons
  if (Nebyoodle.env == 'local') {
    if (Nebyoodle.dom.interactive.debug.debugButtons && Nebyoodle.showDebugMenu) {
      // 🪣 get single Nebyoolae song from music.nebyoolae.com
      if (Nebyoodle.dom.interactive.debug.btnGetSong) {
        Nebyoodle.dom.interactive.debug.btnGetSong.addEventListener('click', () => {
          Nebyoodle.modalOpen('get-song')
        })
      }
      // 🪣 get all Nebyoolae songs from music.nebyoolae.com
      if (Nebyoodle.dom.interactive.debug.btnGetSongs) {
        Nebyoodle.dom.interactive.debug.btnGetSongs.addEventListener('click', () => {
          Nebyoodle.modalOpen('get-songs')
        })
      }

      // ⚙️ show current Nebyoodle config
      if (Nebyoodle.dom.interactive.debug.btnShowConfig) {
        Nebyoodle.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
          Nebyoodle.modalOpen('show-config')
        })
      }
      // 🎚️ show current Nebyoodle state
      if (Nebyoodle.dom.interactive.debug.btnShowState) {
        Nebyoodle.dom.interactive.debug.btnShowState.addEventListener('click', () => {
          Nebyoodle.modalOpen('show-state')
        })
      }
    }
  }

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Nebyoodle._handleClickTouch)
  window.addEventListener('touchend', Nebyoodle._handleClickTouch)

  document.body.addEventListener('touchmove', function (event) {
    event.preventDefault
  }, { passive: false })
}

/************************************************************************
 * _private __helper methods *
 ************************************************************************/

Nebyoodle.__autocompleteMatch = function(raw) {
  if (raw == '') {
    return []
  }

  const regex = /[^A-Za-z0-9\-\'\"\s]/
  const input = raw.replace(regex, '')
  const reg = new RegExp(input, 'gi')

  const songs = Nebyoodle.allSongData
  const guesses = Nebyoodle.__getGuesses().map(g => g.answer)

  return Object.values(songs).filter(song => {
    const term = `${song.song} - ${song.album}`

    if (term.match(reg) && !guesses.includes(term)) {
      return term
    }
  })
}

Nebyoodle.__getDailyIndex = function() {
  return parseInt(Nebyoodle.__getConfig('daily').index) + 1
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

Nebyoodle.__getDurationMax = function(mode = Nebyoodle.__getGameMode()) {
  const state = Nebyoodle.__getState(mode)

  if (state) {
    const guesses = Nebyoodle.__getGuesses(mode)

    if (guesses) {
      return NEBYOODLE_SKP_VAL[guesses.length]
    } else {
      return NEBYOODLE_SKP_VAL[0]
    }
  } else {
    return NEBYOODLE_SKP_VAL[0]
  }
}

Nebyoodle.__getGuesses = function(mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.__getState(mode).guesses || []
}
Nebyoodle.__addGuess = function(guess) {
  Nebyoodle.__getState().guesses.push(guess)
}

Nebyoodle.__getSongId = function(mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.__getState(mode).songId
}

Nebyoodle.__getSolution = function(mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.__getConfig(mode).solution
}
Nebyoodle.__setSolution = async function(method, answer, mode = Nebyoodle.__getGameMode()) {
  if (method == 'string') {
    Nebyoodle.__setConfig('solution', answer, mode)

    // console.log('FUNC __setSolution(string):', answer)

    return Promise.resolve(true)
  } else {
    const response = await fetch(`${NEBYOODLE_SONGID_SCRIPT}?songId=${answer}`)
    const json = await response.json()
    const data = json.data[0]

    if (data) {
      const title_album = `${data.title} - ${data.field_album_id.name}`

      Nebyoodle.__setConfig('solution', title_album, mode)

      // console.log('FUNC __setSolution(songId):', answer)

      return title_album
    } else {
      console.error('could not set solution, because could not fetch song title from songId')

      return Promise.resolve(false)
    }
  }
}

// get the last index of `guesses` in the most recent session of [mode]
Nebyoodle.__getLastGuessIndex = function() {
  const guessIndex = Nebyoodle.__getState().guesses.length

  return guessIndex > 0 ? guessIndex - 1 : 0
}

Nebyoodle.__getGameMode = function() {
  return Nebyoodle.settings.gameMode || 'daily'
}

Nebyoodle.__getConfig = function(mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.config[mode] || undefined
}
Nebyoodle.__setConfig = function(key, val, mode = Nebyoodle.__getGameMode()) {
  Nebyoodle.config[mode][key] = val
}
Nebyoodle.__getState = function(mode = Nebyoodle.__getGameMode()) {
  const rootState = Nebyoodle.state[mode]

  if (rootState) {
    const seshId = Nebyoodle.__getSessionIndex()
    const state = rootState[seshId]

    return state || undefined
  } else {
    return undefined
  }
}
Nebyoodle.__setState = function(
  key,
  val,
  mode = Nebyoodle.__getGameMode(),
  index = Nebyoodle.__getSessionIndex()
) {
  // console.log(`!!! SAVING STATE: Nebyoodle.state[${mode}][${index}][${key}] = ${val}`)
  Nebyoodle.state[mode][index][key] = val
}
Nebyoodle.__getStateObj = function(mode = Nebyoodle.__getGameMode()) {
  const rootState = Nebyoodle.state[mode]

  return rootState || undefined
}
Nebyoodle.__getSessionIndex = function(mode = Nebyoodle.__getGameMode()) {
  const rootState = Nebyoodle.state[mode]

  return rootState ? rootState.length - 1 : 0
}

// create text and emoji content for share button
Nebyoodle.__getShareText = function(mode = Nebyoodle.__getGameMode()) {
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
    const streak = Nebyoodle.__getStreak('free', true)

    html = `My longest streak at Nebyoodle is ${streak} song(s) in a row. Can you beat that?\n\n`
    html += NEBYOODLE_SHARE_URL
  }

  return html
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

      guessDiv.classList.add('skipped')

      break

    // added a wrong guess status
    case 'wrong':
      svg.src = '/assets/images/cross.svg'
      svg.classList.add('wrong')
      title.innerHTML = guessText

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      guessDiv.classList.add('wrong')

      break

    // added a correct guess status
    case 'correct':
      svg.src = '/assets/images/checkmark.svg'
      svg.classList.add('correct')
      title.innerHTML = guessText

      symbol.appendChild(svg)
      guessDiv.appendChild(symbol)
      guessDiv.appendChild(title)

      guessDiv.classList.add('correct')

      break

    // last guess was correct, so updating last guess to correct
    case 'correct-fix':
      // get last guess's svg and update its img and classes
      guessDiv.classList.remove('wrong')
      guessDiv.querySelector('img').src = '/assets/images/checkmark.svg'
      guessDiv.querySelector('img').classList.remove('wrong')
      guessDiv.querySelector('img').classList.add('correct')

      break

    default:
      break
  }

  // if game is not yet won, AND we still have skips, update audio and UI
  const gameState = Nebyoodle.__getState().gameState
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

    Nebyoodle.__setState('gameState', 'GAME_OVER')
  }
}

// update config and UI with daily song attributes
Nebyoodle.__updateDailyDetails = function(index) {
  Nebyoodle.__setConfig('index', index, 'daily')

  Nebyoodle.dom.dailyDetails.querySelector('.index').innerHTML = (parseInt(index) + 1).toString()
  Nebyoodle.dom.dailyDetails.querySelector('.day').innerHTML = Nebyoodle.__getTodaysDate()
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// set up game
Nebyoodle.initApp()
