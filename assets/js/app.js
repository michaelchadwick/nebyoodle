// Nebyoodle object init
if ((typeof Nebyoodle) === 'undefined') {
  // main object to hold everything
  var Nebyoodle = {}

  // hold all Nebyoolae song data for lookups
  Nebyoodle.allSongData = []

  // config: only saved while game is loaded
  Nebyoodle.config = {}
  Nebyoodle.config.daily = {}
  Nebyoodle.config.free = {}

  // modal and confirm dialogs
  Nebyoodle.myModal = null
  Nebyoodle.myConfirm = null

  // settings: web app global settings saved between sessions in LOCAL STORAGE
  Nebyoodle.settings = {}

  // show debug menu in header
  Nebyoodle.showDebugMenu = false

  // state: game data saved between sessions LOCAL STORAGE
  Nebyoodle.state = {}
  Nebyoodle.state.daily = []
  Nebyoodle.state.free = []

  // console.log('Nebyoodle object initialized', Nebyoodle)
}
