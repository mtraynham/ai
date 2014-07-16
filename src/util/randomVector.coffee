###*
 * Create a random vector
 * @param  {[[]]} mm minmax
 * @return {[]}
###
randomVector = (minmax) -> minmax.map (cur) -> cur[0] + ((cur[1] - cur[0]) * Math.random())

module.exports = randomVector