/* dom */
/* grab references to dom elements */
/* global Nebyoodle */

// DOM > main divs/elements
Nebyoodle.dom = {
  'navOverlay': document.getElementById('nav-overlay'),
  'navContent': document.getElementById('nav-content'),
  'dailyDetails': document.getElementById('daily-details'),
  'songData': document.getElementById('song-data'),
  'guesses': document.getElementById('guesses-container'),
  'audioContainer': document.getElementById('audio-container'),
  'audioElem': document.getElementById('audio-element'),
  'playContainer': document.getElementById('play-container'),
  'playSeconds': document.getElementById('start-time-seconds'),
  'timeline': document.getElementById('timeline'),
  'timelineUnplayed': document.querySelector('.intro-unplayed'),
  'timelinePlayed': document.querySelector('.intro-played'),
}

// DOM > interactive elements
Nebyoodle.dom.interactive = {
  'btnNav': document.getElementById('button-nav'),
  'btnNavClose': document.getElementById('button-nav-close'),
  'btnHelp': document.getElementById('button-help'),
  'btnStats': document.getElementById('button-stats'),
  'btnSettings': document.getElementById('button-settings'),
  'gameModeDailyLink': document.getElementById('gamemode-0'),
  'gameModeFreeLink': document.getElementById('gamemode-1')
}
// DOM > main UI buttons
Nebyoodle.dom.mainUI = {
  'btnPlayPause': document.getElementById('button-play-pause'),
  'btnPlayPauseIcon': document.getElementById('button-play-pause-icon'),
  'searchContainer': document.getElementById('search-container'),
  'guessInput': document.getElementById('guess-input'),
  'guessResult': document.getElementById('guess-result'),
  'guessResultList': document.getElementById('guess-result-list'),
  'guessResultCounter': document.getElementById('guess-result-counter'),
  'btnGuessClear': document.getElementById('button-guess-clear'),
  'btnSkip': document.getElementById('button-skip'),
  'skipSeconds': document.getElementById('skip-seconds'),
  'btnSubmit': document.getElementById('button-submit')
}
// DOM > interactive elements (debug)
Nebyoodle.dom.interactive.debug = {
  'all': document.getElementById('debug-buttons'),
  'btnGetSong': document.getElementById('button-get-song'),
  'btnGetSongs': document.getElementById('button-get-songs'),
  'btnShowList': document.getElementById('button-show-solution'),
  'btnResetProgress': document.getElementById('button-reset-progress'),
  'btnShowConfig': document.getElementById('button-show-config'),
  'btnShowState': document.getElementById('button-show-state'),
  'btnWinGame': document.getElementById('button-win-game'),
  'btnWinGameAlmost': document.getElementById('button-win-game-almost'),
  'btnWinAnimation': document.getElementById('button-win-animation')
}
