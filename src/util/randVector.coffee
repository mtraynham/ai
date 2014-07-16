###*
 * Create a random vector
 * @param  {[[]]} mm minmax
 * @return {[]}
###
randVector = (mm) -> mm.map (a) -> a[0] + (([1] - a[0]) * Math.random())

module.exports = randVector