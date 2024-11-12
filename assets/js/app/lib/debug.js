/* debug */
/* debugging and development functions */
/* global Nebyoodle */

// add debug stuff if local
Nebyoodle._initDebug = function () {
  // if debug buttons are in template
  if (Nebyoodle.dom.interactive.debug.debugButtons && Nebyoodle.showDebugMenu) {
    // show debug buttons
    Nebyoodle.dom.interactive.debug.debugButtons.style.display = 'flex'
    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll('button.icon').forEach((btn) => {
      btn.style.fontSize = '16px'

      if (btn.id == 'button-nav') {
        btn.querySelector('img').style.height = '16px'
        btn.querySelector('img').style.width = '16px'
      }
    })
  }

  let qd = {}

  if (location.search)
    location.search
      .substr(1)
      .split('&')
      .forEach(function (item) {
        let s = item.split('='),
          k = s[0],
          v = s[1] && decodeURIComponent(s[1]) // null-coalescing / short-circuit
        //(k in qd) ? qd[k].push(v) : qd[k] = [v]
        ;(qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
      })

  if (qd.debugCSS && qd.debugCSS == 1) {
    let debugStyles = document.createElement('link')

    debugStyles.rel = 'stylesheet'
    debugStyles.href = './assets/css/debug.css'
    document.head.appendChild(debugStyles)
  }
}

// modal: debug: display Nebyoodle.config
Nebyoodle._debugDisplayConfig = function () {
  const configs = Nebyoodle.config

  let html = ''

  html += `<h3>GLOBAL (ENV: ${Nebyoodle.env})</h3>`
  html += '<h3>----------------------------</h3>'

  html += '<dl>'

  Object.keys(configs).forEach((config) => {
    html += `<h4>CONFIG: ${config}</h4>`

    Object.keys(configs[config]).forEach((key) => {
      const label = key
      const value = configs[config][key]

      html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
    })
  })

  html += '</dl>'

  return html
}
// modal: debug: display Nebyoodle.state
Nebyoodle._debugDisplayState = function () {
  const states = Nebyoodle.state

  let html = ''

  html += '<dl class="centered">'

  Object.keys(states).forEach((state) => {
    html += '<div class="debug-state">'
    html += `<h4>STATE: ${state}</h4>`

    Object.keys(states[state]).forEach((session) => {
      html += '<div class="debug-session">'
      html += `<h5>SESSION: ${session}</h5>`

      Object.keys(states[state][session]).forEach((key) => {
        const value = states[state][session][key]

        if (typeof value == 'object' && !Array.isArray(value) && value != null) {
          html += `<dd><code>${key}: {</code><dl>`

          if (key == 'statistics') {
            Object.keys(states[state][session][key]).forEach((subkey) => {
              value = states[state][session][key][subkey]

              html += `<dd><code>${subkey}:</code></dd><dt>${value}</dt>`
            })

            html += '</dl><code>}</code></dd>'
          } else {
            Object.keys(states[state][session][key]).forEach((subkey) => {
              value = states[state][session][key][subkey]

              if (subkey == 'lastCompletedTime' || subkey == 'lastPlayedTime') {
                value = Nebyoodle.__getFormattedDate(new Date(value))
              }

              if (value) {
                if (typeof value == 'object' && subkey == 'guesses') {
                  html += `<dd><code>${subkey}:</code></dd><dt>${value
                    .map((v) => v.answer)
                    .join(', ')}</dt>`
                } else {
                  html += `<dd><code>${subkey}:</code></dd><dt>${value.join(', ')}</dt>`
                }
              }
            })

            html += '</dl><code>}</code></dd>'
          }
        } else {
          if (typeof value == 'object' && key == 'guesses') {
            html += `<dd><code>${key}:</code></dd><dt>${value
              .map((v) => (v.answer != '' ? `'${v.answer}'` : '[skip]'))
              .join(', ')}</dt>`
          } else {
            html += `<dd><code>${key}:</code></dd><dt>${value}</dt>`
          }
        }
      })

      html += '</div>'
    })

    html += '</div>'
  })

  html += '</dl>'

  return html
}
