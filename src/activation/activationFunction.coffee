class ActivationFunction
    constructor: (@activationFunction, @derivativeFunction) ->
    getActivationFunction: () -> @activationFunction
    getDerivativeFunction: () -> @derivativeFunction

module.exports = ActivationFunction