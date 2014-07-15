###
# http://en.wikipedia.org/wiki/Bees_algorithm
###

class Bee
    constructor: (@vector, @fitness) ->

objective_function = (v) -> v.reduce (a, b) -> a + b * 2;

random_vector = (v) -> v.map (a) -> a[0] + ((a[1] - a[0]) * Math.random())

create_random_bee = (ss) -> new Bee(random_vector(ss))

create_neigh_bee = (s, p, ss) ->
    new Bee(s.map (c, i) ->
        c = Math.random() < 0.5 ? c + Math.random() * p : c - Math.random() * p
        c = ss[i][0] if c < ss[i][0]
        c = ss[i][1] if c > ss[i][1]
        c
    )

search_neigh(p, ns, ps) ->



swarm_bee_search = (maxGens, searchSpace, numBees, numSites, eliteSites, patchSize, eBees, oBees) ->
    b = null
    # Init population
    p = new Array(numBees)
    while maxGens--
        # Evaluate Population
        p.forEach (bee) ->
        p.sort (a, b) -> a.fitness - b.fitness
        b = p[0] if !b or p[0].fitness < b.fitness
        next_gen = []
        # pop.forEach (par, i) ->
        #     n_size = i < eliteSites ? eBees : oBees
        #     next_gen <<
    b
