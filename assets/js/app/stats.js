Nebyoodle.__getSessionCount = function(mode) {
  return Nebyoodle
    .state[mode]
    .filter(session => Nebyoodle.___isDone(session))
    .length
}

Nebyoodle.__getSuccessPerc = function(mode) {
  const allCount = Nebyoodle.__getSessionCount(mode)
  const winCount = Nebyoodle.state[mode].filter(
    session => Nebyoodle.___isDone(session) && Nebyoodle.___isWin(session)
  ).length

  if (allCount > 0) {
    return Math.round((wins / sessions) * 100)
  } else {
    return 0
  }
}

Nebyoodle.__getStreak = function(mode, max = null) {
  let streakCur = 0
  let streakMax = 0

  Nebyoodle.state[mode].forEach(session => {
    if (Nebyoodle.___isWin(session)) {
      streakCur++
    } else {
      if (streakCur >= streakMax) {
        streakMax = streakCur
      }

      streakCur = 0
    }
  })

  return max ? streakMax : streakCur
}

Nebyoodle.___isDone = function(session) {
  return session.gameState == 'GAME_OVER'
}
Nebyoodle.___isWin = function(session) {
  return session.guesses.some(guess => guess.isCorrect)
}