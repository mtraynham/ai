Ai =
    version: '0.0.1'

Ai.Activation = require './activation/index.coffee'
Ai.Error = require './error/index.coffee'
Ai.Network = require './backPropagation.coffee'
Ai.Pattern = require './pattern.coffee'

network = new Ai.Network([[0, 0], [0, 0, 0, 0], [0, 0, 0, 0],[0]]
    , new Ai.Activation.SigmoidActivationFunction()
    , new Ai.Error.LinearErrorFunction())
patterns = [
    new Ai.Pattern([0, 0], [0])
    new Ai.Pattern([0, 1], [1])
    new Ai.Pattern([1, 0], [1])
    new Ai.Pattern([1, 1], [0])
]
network.train(patterns, 0.3, 0.8)
netowrk.solve(patterns[0])
netowrk.solve(patterns[1])
netowrk.solve(patterns[2])
netowrk.solve(patterns[3])

global.ai = ai