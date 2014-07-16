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

# def forward_propagate(net, vector)
#   net.each_with_index do |layer, i|
#     input=(i==0)? vector : Array.new(net[i-1].size){|k|net[i-1][k][:output]}
#     layer.each do |neuron|
#       neuron[:activation] = activate(neuron[:weights], input)
#       neuron[:output] = transfer(neuron[:activation])
#     end
#   end
#   return net.last[0][:output]
# end
forwardPropagate = (n, v) ->
    n.forEach (l, i) ->
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



# def backward_propagate_error(network, expected_output)
#   network.size.times do |n|
#     index = network.size - 1 - n
#     if index == network.size-1
#       neuron = network[index][0] # assume one node in output layer
#       error = (expected_output - neuron[:output])
#       neuron[:delta] = error * transfer_derivative(neuron[:output])
#     else
#       network[index].each_with_index do |neuron, k|
#         sum = 0.0
#         # only sum errors weighted by connection to the current k'th neuron
#         network[index+1].each do |next_neuron|
#           sum += (next_neuron[:weights][k] * next_neuron[:delta])
#         end
#         neuron[:delta] = sum * transfer_derivative(neuron[:output])
#       end
#     end
#   end
# end

# def calculate_error_derivatives_for_weights(net, vector)
#   net.each_with_index do |layer, i|
#     input=(i==0)? vector : Array.new(net[i-1].size){|k|net[i-1][k][:output]}
#     layer.each do |neuron|
#       input.each_with_index do |signal, j|
#         neuron[:deriv][j] += neuron[:delta] * signal
#       end
#       neuron[:deriv][-1] += neuron[:delta] * 1.0
#     end
#   end
# end

# def update_weights(network, lrate, mom=0.8)
#   network.each do |layer|
#     layer.each do |neuron|
#       neuron[:weights].each_with_index do |w, j|
#         delta = (lrate * neuron[:deriv][j]) + (neuron[:last_delta][j] * mom)
#         neuron[:weights][j] += delta
#         neuron[:last_delta][j] = delta
#         neuron[:deriv][j] = 0.0
#       end
#     end
#   end
# end

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