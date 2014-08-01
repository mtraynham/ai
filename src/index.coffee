ai =
    version: '0.0.1'

ai.activation = './activation/index.coffee'
ai.error = require './error/index.coffee'
ai.Network = require './backPropagation.coffee'
ai.Pattern = require './pattern.coffee'

network = new ai.Network([[0, 0], [0, 0, 0, 0], [0, 0, 0, 0],[0]]
    , new ai.activation.SigmoidActivationFunction()
    , new ai.error.LinearErrorFunction())
patterns = [
    new ai.Pattern([0, 0], [0])
    new ai.Pattern([0, 1], [1])
    new ai.Pattern([1, 0], [1])
    new ai.Pattern([1, 1], [0])
]
network.train(patterns, 0.3, 0.8)
netowrk.solve(patterns[0])
netowrk.solve(patterns[1])
netowrk.solve(patterns[2])
netowrk.solve(patterns[3])

global.ai = ai