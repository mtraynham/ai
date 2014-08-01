# http://www.maths.usyd.edu.au/u/joachimw/Project3.pdf
class Pattern
    constructor: (@input, @output) ->
    getInput: () -> @input
    setInput: (@input) ->
    getOutput: () -> @output
    setOutput: (@output) ->

class ActivationFunction
    constructor: (@activationFunction, @derivativeFunction) ->
    getActivationFunction: () -> @activationFunction
    getDerivativeFunction: () -> @derivativeFunction

class SigmoidActivationFunction extends ActivationFunction
    activationFunction = (activation) -> 1.0 / (1.0 + Math.exp -activation)
    derivativeFunction = (previousOutput, output) -> output * (1.0 - output)
    constructor: () -> super activationFunction, derivativeFunction

class ErrorFunction
    constructor: (@errorFunction) ->
    getErrorFunction: () -> @errorFunction

class LinearErrorFunction extends ErrorFunction
    errorFunction = (ideal, actual) -> ideal - actual
    constructor: () ->
        super(errorFunction)

class Neuron
    constructor: (@activation) ->
    ###*
     * Execute feed forward
     * @param  {double[]} input
     * @return {double}
    ###
    forward: (input) ->
        @lastOutput = @activation.getActivationFunction() input.reduce (previous, current, index) ->
            previous += @weights[index] * current
        , 0.0
    ###*
     * Execute feed forward
     * @param  {double} input
     * @return {double}
    ###
    back: (input) ->
    ###*
     * Update the weights
     * @param {double} learningRate
     * @param {double} momentum
    ###
    update: (learningRate, momentum) ->
        i = @weights.length
        while i--
            delta = learningRate * @derivative[i] + @lastDelta[i] * momentum
            @weights[i] += delta
            @lastDelta[i] = delta
            @deriv[i] = 0.0

class Layer
    ###*
     * Create a layer with neurons
     * @param  {Neurons[]} neurons
    ###
    constructor: (@neurons) ->
    ###*
     * Init the layer, setting the previous and next layers
     * @param  {Layer} previous
     * @param  {Layer} next
    ###
    init: (@previous, @next) ->
    ###*
     * Get the list of neurons contained in this layer
     * @return {Neuron[]}
    ###
    getNeurons: () -> @neurons
    ###*
     * Set the previous layer
     * @param {Layer} previous
    ###
    setPrevious: (@previous) ->
    ###*
     * Get the previous layer
     * @return {Layer}
    ###
    getPrevious: () -> @previous
    ###*
     * Set the next layer
     * @param {Layer} next
    ###
    setNext: (@next) ->
    ###*
     * Get the next layer
     * @return {Layer}
    ###
    getNext: () -> @next
    ###*
     * Execute feed forward, calls forward on next layer
     * @param  {double[]} input
     * @return {double[]}
    ###
    forward: (input) ->
        output = @neurons.map (neuron) ->
            neuron.forward(input)
        if @next? then @next.forward(output) else output
    ###*
     * Execute feed back, calls back on prev layer
     * @param  {double[]} input
     * @return {double[]}
    ###
    back: (expected) ->
        output = @neurons.map (neuron) ->
            neuron.back(expected)
        if @previous? then @previous.back(output) else output
    ###*
     * Update the neurons in this layer
     * @param {double} learningRate
     * @param {double} momentum
    ###
    update: (learningRate, momentum) -> @neurons.forEach (neuron) -> neuron.update(learningRate, momentum)

class Network
    constructor: (layers, activationFunction, errorFunction) ->
        @layers = (new Layer(new Neuron(activationFunction, errorFunction) for neuron in layer) for layer in layers)
        @layers.forEach (layer, index, layers) ->
            layer.init (
                if index == 0 then null else layers[index - 1]
                if index == layers.length - 1 then null else layers[index + 1]
                )
    ###*
     * Execute feed forward propagation on this network
     * @param  {[]} input [description]
     * @return {[]}
    ###
    forward = (input) -> @layers[0].forward(input)
    ###*
     * Execute fedd back propagation on this network
     * @param  {[]} output
     * @return {[]}
    ###
    back = (output) -> @layers[@layers.length - 1].back(output)
    ###*
     * Update the network
     * @param  {double} learningRate
     * @param  {double} momentum
    ###
    update = (learningRate, momentum) -> @layers.forEach (layer) -> layer.update(learningRate, momentum)
    ###*
     * Train the network
     * @param  {Pattern[]} patterns
     * @param  {double} learningRate
     * @param  {double} momentum
     * @param  {int} iterations=1000
    ###
    train: (patterns, learningRate, momentum, iterations = 1000) ->
        i = iterations
        while i--
            patterns.forEach (pattern) ->
                forward(pattern.getInput())
                back(pattern.getOutput())
            update(learningRate, momentum)
    ###*
     * Solve the domain using this network
     * @param  {[]} domain
     * @return {[]}
    ###
    solve: (domain) -> forward(domain)

    @test: () ->
        patterns = [
            new Pattern([0, 0], [0])
            new Pattern([0, 1], [1])
            new Pattern([1, 0], [1])
            new Pattern([1, 1], [0])
        ]
        newtwork = @constuctor.create [[0, 0], [0, 0, 0, 0], [0, 0, 0, 0],[0]]
            , new SigmoidActivationFunction()
            , new LinearErrorFunction()
        network.train(patterns, 0.3, 0.8)
        netowrk.solve(patterns[0])
        netowrk.solve(patterns[1])
        netowrk.solve(patterns[2])
        netowrk.solve(patterns[3])

module.exports = Network