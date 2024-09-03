/* lib/misc/ui */
/* functions that update the UI */
/* global Nebyoodle */

Nebyoodle.ui = {}

Nebyoodle.ui._disableUI = function () {
  Object.values(Nebyoodle.dom.mainUI).forEach((elem) => {
    if (elem.id !== 'button-play-stop-icon') {
      elem.setAttribute('disabled', '')
    }
  })
}
// on refresh of site and saved data found, refresh UI
Nebyoodle.ui._refreshUI = function (guesses = null) {
  Object.values(Nebyoodle.dom.guessesContainer.children).forEach((guess) => {
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
Nebyoodle.ui._enableUI = function () {
  // console.log('FUNC enableUI()')

  Object.values(Nebyoodle.dom.mainUI).forEach((elem) => {
    if (elem.id !== 'button-play-stop-icon' && elem.id !== 'button-submit') {
      elem.removeAttribute('disabled')
      elem.classList.remove('disabled')
    }
  })
}

Nebyoodle.ui._clearGuess = function () {
  Nebyoodle.dom.mainUI.guessInput.value = ''
  Nebyoodle.dom.mainUI.btnGuessClear.style.display = 'none'
  Nebyoodle.dom.mainUI.guessResult.style.display = 'none'
  Nebyoodle.dom.mainUI.btnSubmit.setAttribute('disabled', true)
}

Nebyoodle.ui._resetPlayStopButton = function () {
  Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.remove('fa-stop')
  Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.add('fa-play')
}

Nebyoodle.ui._togglePlayStopButton = function () {
  if (Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.contains('fa-stop')) {
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.remove('fa-stop')
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.add('fa-play')
  } else {
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.remove('fa-play')
    Nebyoodle.dom.mainUI.btnPlayStopIcon.classList.add('fa-stop')
  }
}

Nebyoodle.ui._removeModalVestige = () => {
  const dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    dialog.remove()
  }

  if (Nebyoodle.myModal) {
    Nebyoodle.myModal._destroyModal()
  }
}

Nebyoodle._logStatus('[LOADED] /app/ui')
