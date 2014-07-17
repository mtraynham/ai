###
# http://en.wikipedia.org/wiki/Random_search
###

randomVector = require '../../util/randomVector.coffee'
objectiveFn = require '../../util/objectiveFn.coffee'

class Candidate
     constructor: (searchSpace) ->
         @vector = randomVector searchSpace
         @cost = objectiveFn @vector

###*
 * Search for best candidate
 * @param  {[[]]} searchSpace
 * @param  {Integer} maxIterations
 * @return {Candidate}
###
search = (searchSpace, maxIterations) ->
    best = null
    candidate = null
    while maxIterations--
        candidate = new Candidate searchSpace
        best = candidate if !best or candidate.cost < best.cost
    best

module.exports = search