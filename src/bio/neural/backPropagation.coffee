randomVector = require '../../util/randomVector.coffee'
fillArray = require '../../util/fillArray.coffee'

class Neuron
    constructor: (@weights, @lastDelta, @deriv) ->

###*
 * Initialize weights
 * @param  {Integer} numberOfWeights
 * @return {[]}
###
initWeights = (numberOfWeights) ->
    i = numberOfWeights
    minmax = []
    while i--
        minmax.push [-Math.random(), Math.random()]
    randomVector minmax

###*
 * Activate
 * @param  {[]} weights
 * @param  {[]} vector
 * @return {Float}
###
activate = (weights, vector) ->
    vector.reduce (prev, cur, i) ->
        prev += weights[i] * cur
    , 0.0

###*
 * Transfer
 * @param  {Float} activation
 * @return {Float}
###
transfer = (activation) -> 1.0 / (1.0 + Math.exp -activation)

###*
 * Transfer derivative
 * @param  {Float} output
 * @return {Float}
###
transferDerivative = (output) -> output * (1.0 - output)

###*
 * Forward propagate
 * @param  {[[]]} network
 * @param  {[]} vector
 * @return {Float}
###
forwardPropagate = (network, vector) ->
    network.forEach (layer, i) ->
        input = if i == 0 then vector else network[i - 1].map (neuron) -> neuron.output
        layer.forEach (neuron) ->
            neuron.activation = activate neuron.weights, input
            neuron.output = transfer neuron.activation
    network[network.length - 1][0].output

###*
 * Back propapate error
 * @param  {[[]]} network
 * @param  {Float} expectedOutput
###
backwardPropagateError = (network, expectedOutput) ->
    i = network.length
    while i--
        if i == network.length - 1
            neuron = network[i][0]
            error = expectedOutput - neuron.output
            neuron.delta = error * transferDerivative neuron.output
        else
            network[i].forEach (neuron, j) ->
                neuron.delta = transferDerivative neuron.output *
                    network[i + 1].reduce (prev, nextNeuron) ->
                        prev += nextNeuron.weights[j] * nextNeuron.delta
                    , 0

###*
 * Calculate error derivatives for weights
 * @param  {[[]]} network
 * @param  {[]} vector
###
calculateErrorDerivativesForWeights = (network, vector) ->
    network.forEach (layer, i) ->
        input = if i == 0 then vector else network[i - 1].map (neuron, j) -> network[i - 1][j].output
        layer.forEach (neuron) ->
            input.forEach (signal, j) ->
                neuron.deriv[j] += neuron.delta * signal
            neuron.deriv[neuron.deriv.length - 1] += neuron.delta

###*
 * Update the weights
 * @param  {[[]]} network
 * @param  {Float} lrate
 * @param  {Float} momentum
###
updateWeights = (network, lrate, momentum) ->
    momentum = momentum || 0.8
    network.forEach (layer) ->
        layer.forEach (neuron) ->
            neuron.weights.forEach (weight, i) ->
                delta = lrate * neuron.deriv[i] + neuron.lastDelta[i] * momentum
                neuron.weights[i] += delta
                neuron.lastDelta[i] = delta
                neuron.deriv[i] = 0.0

###*
 * Train the network
 * @param  {[[]]} network
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @param  {Integer} iterations
 * @param  {Float} lrate
###
trainNetwork = (network, domain, numberOfInputs, iterations, lrate) ->
    i = iterations
    while i--
        domain.forEach (pattern) ->
            expected = pattern[pattern.length -1]
            output = forwardPropagate network, pattern
            backwardPropagateError network, expected
            calculateErrorDerivativesForWeights network, pattern
        updateWeights network, lrate

###*
 * Test the network
 * @param  {[[]]} network
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @return {Integer}
###
testNetwork = (network, domain, numberOfInputs) ->
    correct = 0
    domain.forEach (pattern) ->
        output = forwardPropagate network, pattern
        correct += 1 if Math.round(output) == pattern[pattern.length - 1]
    correct

###*
 * Create a neuron
 * @param  {Integer} numberOfInputs
 * @return {Neuron}
###
createNeuron = (numberOfInputs) ->
    new Neuron initWeights numberOfInputs + 1, fillArray(0, numberOfInputs + 1), fillArray(0, numberOfInputs + 1)

###*
 * Execute back propagation
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @param  {Integer} iterations
 * @param  {Integer} numberOfNodes
 * @param  {Float} lrate
 * @return {[[]]}
###
execute = (domain, numberOfInputs, iterations, numberOfNodes, lrate) ->
    network = []
    i = numberOfNodes
    while i--
        network.push createNeuron numberOfInputs
    network.push createNeuron network[network.length - 1].length
    trainNetwork network, domain, numberOfInputs, iterations, lrate
    testNetwork network, domain, numberOfInputs
    network

module.exports = execute