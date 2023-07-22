Nebyoodle.__getSessionCount = function(mode) {
  const state = Nebyoodle.state[mode]

  if (state) {
    return Nebyoodle
      .state[mode]
      .filter(session => Nebyoodle.___isDone(session))
      .length
  } else {
    return 0
  }
}

Nebyoodle.__getSuccessPerc = function(mode) {
  const allCount = Nebyoodle.__getSessionCount(mode)
  const winCount = Nebyoodle.state[mode].filter(
    session => Nebyoodle.___isWin(session)
  ).length

  if (allCount > 0) {
    return Math.round((winCount / allCount) * 100)
  } else {
    return 0
  }
}

Nebyoodle.__getStreak = function(mode, max = null) {
  let streakCur = 0
  let streakMax = 0

  Nebyoodle.state[mode].forEach(session => {
    if (Nebyoodle.___isDone(session)) {
      if (Nebyoodle.___isWin(session)) {
        streakCur++
      } else {
        streakCur = 0
      }
    }

    if (streakCur >= streakMax) {
      streakMax = streakCur
    }
  })

  return max ? streakMax : streakCur
}

Nebyoodle.___isDone = function(session) {
  return session.gameState == 'GAME_OVER'
}
Nebyoodle.___isWin = function(session) {
  return Nebyoodle.___isDone(session) && session.guesses.some(guess => guess.isCorrect)
}
