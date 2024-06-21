/* helpers */
/* global utility functions */
/* global Nebyoodle */

// get displayable string for today's date
Nebyoodle.__getTodaysDate = function() {
  const d = new Date(Date.now())
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// timestamp to display date
Nebyoodle.__getFormattedDate = function(date) {
  let formatted_date = ''

  formatted_date += `${date.getFullYear()}/`
  formatted_date += `${(date.getMonth() + 1).toString().padStart(2, '0')}/` // months are 0-indexed!
  formatted_date += `${date.getDate().toString().padStart(2, '0')} `
  formatted_date += `${date.getHours().toString().padStart(2, '0')}:`
  formatted_date += `${date.getMinutes().toString().padStart(2, '0')}:`
  formatted_date += `${date.getSeconds().toString().padStart(2, '0')}`

  return formatted_date
}