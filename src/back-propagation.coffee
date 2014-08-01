# http://www.maths.usyd.edu.au/u/joachimw/Project3.pdf
class Pattern
    constructor: (@input, @output) ->
    getInput: () -> @input
    setInput: (@input) ->
    getOutput: () -> @output
    setOutput: (@output) ->

class Neuron
    constructor: () ->
        @activationFn = (activation) -> 1.0 / (1.0 + Math.exp - activation)
        @derivativeFn = (output) -> output * (1.0 - output)
    ###*
     * Execute feed forward
     * @param  {double[]} input
     * @return {double}
    ###
    forward: (input) ->
        @lastOutput = @activationFn input.reduce (previous, current, index) ->
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
    constructor: (layers) ->
        @layers = (new Layer(new Neuron(neuron) for neuron in neurons) for layer in layers)
        @layers.forEach (layer, index, layers) ->
            layer.init (
                if index == 0 then null else layers[index - 1]
                if index == layers.length - 1 then null else layers[index + 1]
                )
    ###*
     * Create a network
     * @param  {Layer[]} layers
     * @return {Network}
    ###
    @create: (layers) ->
        new Network(layers)
    forward = (input) -> @layers[0].forward(vector)
    back = (output) -> @layers[@layers.length - 1].back(output)
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
     * @param  {Network} domain
     * @return {[[]]}
    ###
    solve: (domain) -> forward(domain)

module.exports = Network