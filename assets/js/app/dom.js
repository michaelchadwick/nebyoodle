/* dom */
/* grab references to dom elements */
/* global Nebyoodle */

// DOM > main divs/elements
Nebyoodle.dom = {
  'navOverlay': document.getElementById('nav-overlay'),
  'navContent': document.getElementById('nav-content'),
  'dailyDetails': document.getElementById('daily-details'),
  'guess': document.getElementById('guess'),
  'score': document.getElementById('score-container'),
  'scoreGuessed': document.getElementById('score-guessed'),
  'scoreGuessedOf': document.getElementById('score-guessed-of'),
  'scoreTotal': document.getElementById('score-total'),
  'scoreTotalWords': document.getElementById('score-total-words'),
}

// DOM > interactive elements
Nebyoodle.dom.interactive = {
  'btnNav': document.getElementById('button-nav'),
  'btnNavClose': document.getElementById('button-nav-close'),
  'btnHelp': document.getElementById('button-help'),
  'btnStats': document.getElementById('button-stats'),
  'btnSettings': document.getElementById('button-settings'),
  'difficultyContainer': document.getElementById('difficulty-container'),
  'difficultyContainerLinks': document.querySelectorAll('#difficulty-container a'),
  'gameModeDailyLink': document.getElementById('gamemode-0'),
  'gameModeFreeLink': document.getElementById('gamemode-1'),
  'btnSubmit': document.getElementById('button-submit'),
  'btnBackspace': document.getElementById('button-backspace'),
  'btnClearGuess': document.getElementById('button-clear-guess'),
  'btnShuffle': document.getElementById('button-shuffle'),
  'btnShowProgress': document.getElementById('button-show-progress'),
  'btnGuessLookup': document.getElementById('button-guess-lookup'),
  'btnCreateNew': document.getElementById('button-create-new'),
  'btnHint': document.getElementById('button-hint'),
  'btnHintReset': document.getElementById('button-hint-reset'),
  'tiles': document.getElementsByClassName('tile')
}
// DOM > main UI buttons
Nebyoodle.dom.mainUI = {
  'btnSubmit': document.getElementById('button-submit'),
  'btnBackspace': document.getElementById('button-backspace'),
  'btnClearGuess': document.getElementById('button-clear-guess'),
  'btnShuffle': document.getElementById('button-shuffle'),
  'btnShowProgress': document.getElementById('button-show-progress'),
  'btnGuessLookup': document.getElementById('button-guess-lookup'),
  'btnCreateNew': document.getElementById('button-create-new')
}
// DOM > interactive elements (debug)
Nebyoodle.dom.interactive.debug = {
  'all': document.getElementById('debug-buttons'),
  'btnShowList': document.getElementById('button-show-solution'),
  'btnResetProgress': document.getElementById('button-reset-progress'),
  'btnShowConfig': document.getElementById('button-show-config'),
  'btnShowState': document.getElementById('button-show-state'),
  'btnWinGame': document.getElementById('button-win-game'),
  'btnWinGameAlmost': document.getElementById('button-win-game-almost'),
  'btnWinAnimation': document.getElementById('button-win-animation')
}
