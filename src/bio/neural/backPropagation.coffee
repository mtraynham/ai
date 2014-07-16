randVector = require('../../util/randVector.coffee')

class Neuron
    constructor: (@weights, @activation) ->

initWeights = (n) ->
    i = n
    mm = []
    while i--
        mm.push [-Math.random(), Math.random()]
    randVector(mm)

activate = (w, v) ->
    v.reduce (p, c, i) ->
        p += w[i] * c
    , 0

transfer = (a) -> 1.0 / (1.0 + Math.exp(-a))

transferDerivative = (o) -> o * (1.0 - o)

forwardPropagate = (n, v) ->
    n.forEach (l, i) ->
        #     input=(i==0)? vector : Array.new(net[i-1].size){|k|net[i-1][k][:output]}
        inp = if i is 0 then vector else
        l.forEach (ne) ->
            ne.activation = activate(ne.weights, inp)
            ne.output = transfer(ne.activation)
    n[n.length - 1][0].output

backwardPropagateError = (n, eo) ->
    i = n.length
    while i--
        idx = n.length - 1 - i
        if idx == n.length - 1
            ne = n[idx][0]
            e = eo - ne.output
            n.delta = e * transfer_derivative(n.output)
        else
            n[idx].forEach (ne, j) ->
                n.delta = transferDerivative(ne.output) *
                    n[idx + 1].reduce (p, nne) ->
                        p += nne.weights[j] * nne.delta
                    , 0

calculateErrorDerivativesForWeights = (n, v) ->
    n.forEach (l, i) ->
        #     input=(i==0)? vector : Array.new(net[i-1].size){|k|net[i-1][k][:output]}
        inp = if i == 0 then vector else
        l.forEach (ne) ->
            inp.forEach (s, j) ->
                ne.deriv[j] += ne.delta * s
            ne.deriv[ne.deriv.length - 1] += ne.delta

updateWeights = (n, lr, m) ->
    n.forEach (l) ->
        l.forEach (ne) ->
            ne.weights.forEach (w, i) ->
                d = lr * ne.deriv[i] + ne.ldelta[i] * m
                n.weights[i] += d
                n.ldelta[i] = d
                n.deriv[i] = 0.0

trainNetwork = (n, d, ni, i, lr) ->


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