/* events */
/* adds event listeners to dom */
/* global Nebyoodle */

// handle duration of audio element
Nebyoodle._handleAudioDuration = function (event) {
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
    Nebyoodle.ui._togglePlayStopButton()
  } else {
    Nebyoodle.dom.audioElem.duration = durationMax
  }

  Nebyoodle.__updateStatus()
}

// handle both clicks and touches outside of modals
Nebyoodle._handleClickTouch = function (event) {
  const dialog = document.getElementsByClassName('modal-dialog')[0]
  const elem = event.target

  if (dialog) {
    const isConfirm = dialog.classList.contains('modal-confirm')
    const isShareLink = elem.classList.contains('share')
    const isTempApi = dialog.classList.contains('temp-api')
    // const isEndState = dialog.classList.contains('end-state')

    // only close if not a confirmation, share link, or temp-api!
    if (elem == dialog && !isConfirm && !isShareLink && !isTempApi) {
      dialog.remove()
    }
  } else {
    if (elem == Nebyoodle.dom.navOverlay) {
      Nebyoodle.dom.navOverlay.classList.toggle('show')
    } else {
      // console.log('something with no handler was clicked/touched', elem)
    }
  }
}

Nebyoodle._handlePlayButton = function () {
  if (Nebyoodle.dom.audioElem.paused) {
    Nebyoodle._playAudio()
  } else {
    Nebyoodle.dom.audioElem.pause()
    Nebyoodle.dom.audioElem.currentTime = 0
    Nebyoodle.ui._togglePlayStopButton()
  }
}

Nebyoodle._handleGuessInput = function (event) {
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

Nebyoodle._handleGuessList = function (event) {
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

// submit guess with blank
Nebyoodle._handleSkipButton = function () {
  Nebyoodle._submitGuess()
}

// submit guess with text
Nebyoodle._handleSubmitButton = function () {
  Nebyoodle._submitGuess(Nebyoodle.dom.mainUI.guessInput.value)
}

Nebyoodle._attachEventListeners = function () {
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

    Nebyoodle.ui._disableUI()
  })
  // now listen for when it gets loaded again
  Nebyoodle.dom.audioElem.addEventListener('canplaythrough', () => {
    // console.log('audioElem can now play again')

    if (Nebyoodle.__getState().gameState == 'IN_PROGRESS') {
      Nebyoodle.ui._enableUI()
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
  Nebyoodle.dom.mainUI.btnGuessClear.addEventListener('click', Nebyoodle.ui._clearGuess)
  // skip/submit
  Nebyoodle.dom.mainUI.btnSkip.addEventListener('click', Nebyoodle._handleSkipButton, false)
  Nebyoodle.dom.mainUI.btnSubmit.addEventListener('click', Nebyoodle._handleSubmitButton, false)

  // local debug buttons
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

  // gotta use keydown, not keypress, or else Delete/Backspace aren't recognized
  document.addEventListener('keydown', (event) => {
    if (event.code == 'Space' && document.activeElement.id != 'guess-input') {
      Nebyoodle._handlePlayButton()
    }
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Nebyoodle._handleClickTouch)
  window.addEventListener('touchend', Nebyoodle._handleClickTouch)

  document.body.addEventListener(
    'touchmove',
    (event) => {
      event.preventDefault
    },
    { passive: false }
  )
}

Nebyoodle._logStatus('[LOADED] /app/events')
