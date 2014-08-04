# http://www.maths.usyd.edu.au/u/joachimw/Project3.pdf
class Neuron
    constructor: (@activationFunction, @errorFunction) ->
    ###*
     * Initialize the node with weights
     * @param  {double[]} @weights
    ###
    init: (@weights) ->
    ###*
     * Get current weights
     * @return {double[]}
    ###
    getWeights: () -> @weights
    ###*
     * Execute feed forward
     * @param  {double[]} previousOutput
     * @return {double}
    ###
    forward: (previousOutput) ->
        self = this
        @output = @activationFunction.getActivationFunction() previousOutput.reduce (previous, current, index) ->
            previous += self.weights[index] * current
        , 0.0
    ###*
     * Execute feed forward
     * @param  {double} backDeltaSum
     * @return {double}
    ###
    back: (backDeltaSum) ->
        @error = backDeltaSum * @activationFunction.getDerivativeFunction() @output
    ###*
     * Update the weights
     * @param {double} learningRate
     * @param {double} momentum
    ###
    update: (learningRate, momentum) ->
        i = @weights.length
        while i--
            delta = learningRate * @derivative[i] + @lastDelta[i] * momentum

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
     * @param  {double[]} previousOutput
     * @return {double[]}
    ###
    forward: (previousOutput) ->
        output = @neurons.map (neuron) ->
            neuron.forward(previousOutput)
        if @next? then @next.forward(output) else previousOutput
    ###*
     * Execute feed back, calls back on prev layer
     * @param  {double[]} error
     * @return {double[]}
    ###
    back: (backError) ->
        error = @neurons.map (neuron, index) ->
            backDeltaSum = @next.getNeurons().reduce (sum, nextNeuron) ->
                sum += nextNeuron.getWeights()[index] * nextNeuron.error()
            , 0
            neuron.back(backDeltaSum)
        if @previous? then @previous.back(error) else error
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
            # INIT WEIGHTS OF NEURONS PER LAYER, FIRST LAYER IS DOMAIN SIZE (init during train?)
            # OTHER LAYERS ARE PREV NEURON SIZE
            layer.getNeurons().forEach (neuron) ->
                neuron.init(new Array(layer.previous().getNeurons().length))
    ###*
     * Execute feed forward propagation on this network
     * @param  {[]} input [description]
     * @return {[]}
    ###
    forward: (input) -> @layers[0].forward(input)
    ###*
     * Execute fedd back propagation on this network
     * @param  {[]} output
     * @return {[]}
    ###
    back: (output) -> @layers[@layers.length - 1].back(output)
    ###*
     * Update the network
     * @param  {double} learningRate
     * @param  {double} momentum
    ###
    update: (learningRate, momentum) -> @layers.forEach (layer) -> layer.update(learningRate, momentum)
    ###*
     * Train the network
     * @param  {Pattern[]} patterns
     * @param  {double} learningRate
     * @param  {double} momentum
     * @param  {int} iterations=1000
    ###
    train: (patterns, learningRate, momentum, iterations = 1000) ->
        i = iterations
        self = this
        while i--
            patterns.forEach (pattern) ->
                output = self.forward pattern.getInput()
                self.back pattern.getOutput() - output # TODO Array
            @update learningRate, momentum
    ###*
     * Solve the domain using this network
     * @param  {[]} domain
     * @return {[]}
    ###
    solve: (domain) -> @forward(domain)

module.exports = Network