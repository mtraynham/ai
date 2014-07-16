randomVector = require('../../util/randomVector.coffee')

class Neuron
    constructor: (@weights, @activation) ->

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
    randomVector(minmax)

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
transfer = (activation) -> 1.0 / (1.0 + Math.exp(-activation))

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
 * @return {Neuron}
###
forwardPropagate = (network, vector) ->
    network.forEach (layer, i) ->
        input = if i == 0 then vector else network[i - 1].map (neuron, j) -> network[i - 1][j].output
        layer.forEach (neuron) ->
            neuron.activation = activate(neuron.weights, input)
            neuron.output = transfer(neuron.activation)
    network[network.length - 1][0].output

###*
 * Back propapate error
 * @param  {[[]]} network
 * @param  {Float} expectedOutput
###
backwardPropagateError = (network, expectedOutput) ->
    i = network.length
    while i--
        idx = network.length - 1 - i
        if idx == network.length - 1
            neuron = network[idx][0]
            error = expectedOutput - neuron.output
            neuron.delta = error * transfer_derivative(neuron.output)
        else
            network[idx].forEach (neuron, j) ->
                neuron.delta = transferDerivative(neuron.output) *
                    network[idx + 1].reduce (prev, nextNeuron) ->
                        p += nextNeuron.weights[j] * nextNeuron.delta
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

trainNetwork = (n, d, ni, it, lr) ->
    correct = 0
    i = it
    while i--
        d.forEach (p) ->
            exp
    i.forEach (e) ->
        d.forEach()

# def train_network(network, domain, num_inputs, iterations, lrate)
#   correct = 0
#   iterations.times do |epoch|
#     domain.each do |pattern|
#       vector,expected=Array.new(num_inputs){|k|pattern[k].to_f},pattern.last
#       output = forward_propagate(network, vector)
#       correct += 1 if output.round == expected
#       backward_propagate_error(network, expected)
#       calculate_error_derivatives_for_weights(network, vector)
#     end
#     update_weights(network, lrate)
#     if (epoch+1).modulo(100) == 0
#       puts "> epoch=#{epoch+1}, Correct=#{correct}/#{100*domain.size}"
#       correct = 0
#     end
#   end
# end

# def test_network(network, domain, num_inputs)
#   correct = 0
#   domain.each do |pattern|
#     input_vector = Array.new(num_inputs) {|k| pattern[k].to_f}
#     output = forward_propagate(network, input_vector)
#     correct += 1 if output.round == pattern.last
#   end
#   puts "Finished test with a score of #{correct}/#{domain.length}"
#   return correct
# end

# def create_neuron(num_inputs)
#   return {:weights=>initialize_weights(num_inputs+1),
#           :last_delta=>Array.new(num_inputs+1){0.0},
#           :deriv=>Array.new(num_inputs+1){0.0}}
# end

# def execute(domain, num_inputs, iterations, num_nodes, lrate)
#   network = []
#   network << Array.new(num_nodes){create_neuron(num_inputs)}
#   network << Array.new(1){create_neuron(network.last.size)}
#   puts "Topology: #{num_inputs} #{network.inject(""){|m,i|m+"#{i.size} "}}"
#   train_network(network, domain, num_inputs, iterations, lrate)
#   test_network(network, domain, num_inputs)
#   return network
# end