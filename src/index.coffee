Ml =
    version: '0.0.1'

Ml.Activation = require './activation/index.coffee'
Ml.Error = require './error/index.coffee'
Ml.Network = require './backPropagation.coffee'
Ml.Pattern = require './pattern.coffee'

network = new Ml.Network([[0, 0], [0, 0, 0, 0], [0, 0, 0, 0],[0]]
    , new Ml.Activation.SigmoidActivationFunction()
    , new Ml.Error.LinearErrorFunction())
patterns = [
    new Ml.Pattern([0, 0], [0])
    new Ml.Pattern([0, 1], [1])
    new Ml.Pattern([1, 0], [1])
    new Ml.Pattern([1, 1], [0])
]
network.train(patterns, 0.3, 0.8)
netowrk.solve(patterns[0])
netowrk.solve(patterns[1])
netowrk.solve(patterns[2])
netowrk.solve(patterns[3])

global.Ml = Ml