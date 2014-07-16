###
# http://en.wikipedia.org/wiki/Bees_algorithm
###

randVector = require('../../util/randVector.coffee')

class Bee
    constructor: (@vector, @fitness) ->

###*
 * Objective Function
 * @param  {[]} v vector
 * @return {[]}
###
objFn = (v) ->
    v.reduce (a, b) ->
        a + b * 2
    , 0

###*
 * Create a random bee
 * @param  {[[]]} ss search space
 * @return {Bee}
###
randBee = (ss) -> new Bee(randVector(ss))

###*
 * Create a neighbor bee
 * @param  {[]} s  site
 * @param  {Integer} p  patch size
 * @param  {[[]]} ss search space
 * @return {Bee}
###
neighBee = (s, p, ss) ->
    new Bee(s.map (a, i) ->
        a = if Math.random() < 0.5 then a + Math.random() * p else a - Math.random() * p
        a = ss[i][0] if a < ss[i][0]
        a = ss[i][1] if a > ss[i][1]
        a
    )

###*
 * Search neighbor bees
 * @param  {Bee} p  parent
 * @param  {Integer} ns neighbor size
 * @param  {Integer} ps patch size
 * @param  {[[]]} ss search space
 * @return {Bee}
###
searchNeigh = (p, ns, ps, ss) ->
    i = ps
    bs = []
    while i--
        a = neighBee(p.vector, ps, ss)
        a.fitness = objFn(a.vector)
        bs.push a
    (bs.sort (b, c) -> b - c)[0]

###*
 * Create scout bee
 * @param  {[[]]} ss search space
 * @param  {Integer} ns number of scouts
 * @return {Bee[]}    [description]
###
scoutBees = (ss, ns) ->
    i = ns
    while i--
        randBee(ss)

###*
 * Search
 * @param  {Integer} mg max gens
 * @param  {[[]]} ss search space
 * @param  {Integer} nb number of bees
 * @param  {Integer} ns number of sites
 * @param  {Integer} es elite sites
 * @param  {Integer} ps patch size
 * @param  {Integer} eb elite bees
 * @param  {Integer} ob ordinary bees
 * @return {Bee}
###
search = (mg, ss, nb, ns, es, ps, eb, ob) ->
    b = null
    i = nb
    j = mg
    k = ns
    p = []
    while i--
        p.push randBee(ss)
    while j--
        p.forEach (b) -> b.fitness = objFn b.vector
        p.sort (a, b) -> a.fitness - b.fitness
        b = p[0] if !b or p[0].fitness < b.fitness
        nextGen = []
        while k--
            nextGen.push searchNeigh parent, (if i < es then eb else ob), ps, ss
        s = scoutBees ss, (nb - ns)
        p = nextGen.concat s
        ps = ps * 0.95
    b

module.exports = search