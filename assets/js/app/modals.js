/* various modal configs that get called during gameplay */
/* global Nebyoodle */
/* eslint-disable no-undef */

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
      Nebyoodle.myModal = new Modal('temp', null, 'Results copied to clipboard', null, null)
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
      Nebyoodle.myModal = new Modal('temp', null, 'Hacking the game, I see', null, null)
      break
  }
}
