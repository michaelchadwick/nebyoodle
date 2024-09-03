/* helpers */
/* global utility functions */
/* global Nebyoodle */

// get displayable string for today's date
Nebyoodle.__getTodaysDate = function () {
  const d = new Date(Date.now())
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// timestamp to display date
Nebyoodle.__getFormattedDate = function (date) {
  let formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
}

Nebyoodle.__autocompleteMatch = function (raw) {
  if (raw == '') {
    return []
  }

  const regex = /[^A-Za-z0-9\-\'\"\s]/
  const input = raw.replace(regex, '')
  const reg = new RegExp(input, 'gi')

  const songs = Nebyoodle.allSongData
  const guesses = Nebyoodle.__getGuesses().map((g) => g.answer)

  return Object.values(songs).filter((song) => {
    const term = `${song.song} - ${song.album}`

    if (term.match(reg) && !guesses.includes(term)) {
      return term
    }
  })
}

Nebyoodle.__getDailyIndex = function () {
  return parseInt(Nebyoodle.__getConfig('daily').index) + 1
}
// get most recent emoji block for sharing
Nebyoodle.__getScoreCard = function () {
  const guesses = Nebyoodle.__getGuesses()

  let html = ''

  guesses.forEach((guess) => {
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

Nebyoodle.__getDurationMax = function (mode = Nebyoodle.__getGameMode()) {
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

Nebyoodle.__getGuesses = function (mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.__getState(mode).guesses || []
}
Nebyoodle.__addGuess = function (guess) {
  Nebyoodle.__getState().guesses.push(guess)
}

Nebyoodle.__getSongId = function (mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.__getState(mode).songId
}

Nebyoodle.__getSolution = function (mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.__getConfig(mode).solution
}
Nebyoodle.__setSolution = async function (method, answer, mode = Nebyoodle.__getGameMode()) {
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
Nebyoodle.__getLastGuessIndex = function () {
  const guessIndex = Nebyoodle.__getState().guesses.length

  return guessIndex > 0 ? guessIndex - 1 : 0
}

Nebyoodle.__getGameMode = function () {
  return Nebyoodle.settings ? Nebyoodle.settings.gameMode : NEBYOODLE_DEFAULT_GAMEMODE
}

Nebyoodle.__getConfig = function (mode = Nebyoodle.__getGameMode()) {
  return Nebyoodle.config[mode] || undefined
}
Nebyoodle.__setConfig = function (key, val, mode = Nebyoodle.__getGameMode()) {
  Nebyoodle.config[mode][key] = val
}
Nebyoodle.__getState = function (mode = Nebyoodle.__getGameMode()) {
  const rootState = Nebyoodle.state[mode]

  if (rootState) {
    const seshId = Nebyoodle.__getSessionIndex()
    const state = rootState[seshId]

    return state || undefined
  } else {
    return undefined
  }
}
Nebyoodle.__setState = function (
  key,
  val,
  mode = Nebyoodle.__getGameMode(),
  index = Nebyoodle.__getSessionIndex()
) {
  // console.log(`!!! SAVING STATE: Nebyoodle.state[${mode}][${index}][${key}] = ${val}`)
  Nebyoodle.state[mode][index][key] = val
}
Nebyoodle.__getStateObj = function (mode = Nebyoodle.__getGameMode()) {
  const rootState = Nebyoodle.state[mode]

  return rootState || undefined
}
Nebyoodle.__getSessionIndex = function (mode = Nebyoodle.__getGameMode()) {
  const rootState = Nebyoodle.state[mode]

  return rootState ? rootState.length - 1 : 0
}

Nebyoodle.__getWinMarkup = async function () {
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
  const albumNameInternal = data.field_album_id.path.alias.split('/album/')[1].replaceAll('-', '_')
  const albumPath = data.field_album_id.path.alias
  const albumLink = `${baseURL}${albumPath}`
  const albumCoverFull = `${baseURL}${data.field_album_id.field_album_cover.uri.url}`.split(
    'files/'
  )
  const albumCoverSmall = albumCoverFull[0] + 'files/nebyoodle/' + albumNameInternal + '.jpg'

  const duration = new Date(data.field_duration * 1000).toISOString().slice(14, 19)
  const released = data.field_release_date
  const description = new DOMParser().parseFromString(data.body, 'text/html').body.textContent

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
// create text and emoji content for share button
Nebyoodle.__getShareText = function (mode = Nebyoodle.__getGameMode()) {
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
Nebyoodle.__updateStatus = function (type, guessText = null, guessIndex = null) {
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
    Nebyoodle.dom.mainUI.skipSeconds.innerText = NEBYOODLE_SKP_TXT[Nebyoodle.__getGuesses().length]
  }
  // otherwise, game is over
  else {
    // console.log('FUNC __updateStatus() game is over or out of skips')

    Nebyoodle.__setState('gameState', 'GAME_OVER')
  }
}

// update config and UI with daily song attributes
Nebyoodle.__updateDailyDetails = function (index) {
  Nebyoodle.__setConfig('index', index, 'daily')

  Nebyoodle.dom.dailyDetails.querySelector('.index').innerHTML = (parseInt(index) + 1).toString()
  Nebyoodle.dom.dailyDetails.querySelector('.day').innerHTML = Nebyoodle.__getTodaysDate()
}

// get list of other NebyooApps from Dave
Nebyoodle._getNebyooApps = async function () {
  const response = await fetch(NEBYOOAPPS_SOURCE_URL)
  const json = await response.json()
  const apps = json.body
  const appList = document.querySelector('.nav-list')

  Object.values(apps).forEach((app) => {
    const appLink = document.createElement('a')
    appLink.href = app.url
    appLink.innerText = app.title
    appLink.target = '_blank'
    appList.appendChild(appLink)
  })
}
