// Nebyoodle object init
if (typeof Nebyoodle === 'undefined') var Nebyoodle = {}

const NEBYOODLE_ENV_PROD_URL = ['nebyoodle.fun', 'guess.nebyoolae.com']

Nebyoodle.env = NEBYOODLE_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'
const NEBYOODLE_SHARE_URL = `${document.location.origin}/?r=share`

Nebyoodle._logStatus = function (msg, arg = null) {
  if (Nebyoodle.env == 'local') {
    if (arg) {
      console.log(msg, arg)
    } else {
      console.log(msg)
    }
  }
}

Nebyoodle._logStatus('[LOADED] /Nebyoodle')
