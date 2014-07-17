###
# http://en.wikipedia.org/wiki/Bees_algorithm
###

randomVector = require '../../util/randomVector.coffee'
objectiveFn = require '../../util/objectiveFn.coffee'

class Bee
    constructor: (@vector, @fitness) ->

###*
 * Create a random bee
 * @param  {[[]]} searchSpace
 * @return {Bee}
###
createRandomBee = (searchSpace) -> new Bee randomVector searchSpace

###*
 * Create a neighbor bee
 * @param  {[]} site
 * @param  {Integer} patchSize
 * @param  {[[]]} searchSpace
 * @return {Bee}
###
createNeighborBee = (site, patchSize, searchSpace) ->
    new Bee site.map (cur, i) ->
        cur = if Math.random() < 0.5 then cur + Math.random() * patchSize else cur - Math.random() * patchSize
        cur = searchSpace[i][0] if cur < searchSpace[i][0]
        cur = searchSpace[i][1] if cur > searchSpace[i][1]
        cur

###*
 * Create scout bees
 * @param  {[[]]} searchSpace
 * @param  {Integer} numberOfScouts
 * @return {Bee[]}
###
createScoutBees = (searchSpace, numberOfScouts) ->
    i = numberOfScouts
    while i--
        createRandomBee searchSpace

###*
 * Search neighbor bees
 * @param  {Bee} parent
 * @param  {Integer} neighborSize
 * @param  {Integer} patchSize
 * @param  {[[]]} searchSpace
 * @return {Bee}
###
searchNeighborBees = (parent, neighborSize, patchSize, searchSpace) ->
    i = patchSize
    neighborBees = []
    while i--
        bee = createNeighborBee parent.vector, patchSize, searchSpace
        bee.fitness = objectiveFn bee.vector
        neighborBees.push bee
    (neighborBees.sort (a, b) -> a - b)[0]

###*
 * Search
 * @param  {Integer} maxGens
 * @param  {[[]]} searchSpace
 * @param  {Integer} numberOfBees
 * @param  {Integer} numberOfSites
 * @param  {Integer} eliteSites
 * @param  {Integer} patchSize
 * @param  {Integer} eliteBees
 * @param  {Integer} otherBees
 * @return {Bee}
###
search = (maxGens, searchSpace, numberOfBees, numberOfSites, eliteSites, patchSize, eliteBees, otherBees) ->
    best = null
    i = numberOfBees
    j = maxGens
    population = []
    while i--
        population.push createRandomBee searchSpace
    while j--
        population.forEach (cur) -> cur.fitness = objectiveFn cur.vector
        population.sort (a, b) -> a.fitness - b.fitness
        best = population[0] if !best or population[0].fitness < best.fitness
        nextGen = []
        k = numberOfSites
        while k--
            nextGen.push searchNeighborBees parent, (if i < eliteSites then eliteBees else otherBees)
                , patchSize, searchSpace
        scoutBees = createScoutBees searchSpace, (numberOfBees - numberOfSites)
        population = nextGen.concat scoutBees
        patchSize = patchSize * 0.95
    best

module.exports = search