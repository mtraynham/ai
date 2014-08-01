ActivationFunction = require './activationFunction'

class SigmoidActivationFunction extends ActivationFunction
    activationFunction = (activation) -> 1.0 / (1.0 + Math.exp -activation)
    derivativeFunction = (previousOutput, output) -> output * (1.0 - output)
    constructor: () -> super activationFunction, derivativeFunction

module.exports = SigmoidActivationFunction