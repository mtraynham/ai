###
# http://en.wikipedia.org/wiki/Bees_algorithm
###

randomVector = require '../../util/randomVector.coffee'

class Candidate
     constructor: (searchSpace) ->
         @vector = randomVector(searchSpace)
         @cost = objectiveFn(@vector)

###*
 * Objective function
 * @param  {[]} vector
 * @return {[]}
###
objectiveFn = (vector) ->
    vector.reduce (prev, cur) ->
        prev + Math.pow(cur, 2)
    , 0

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
        candidate = new Candidate(searchSpace)
        best = candidate if !best or candidate.cost < best.cost
    best

module.exports = search