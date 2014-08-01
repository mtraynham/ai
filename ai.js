(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Layer, Network, Neuron, Pattern;

Pattern = (function() {
  function Pattern(input, output) {
    this.input = input;
    this.output = output;
  }

  Pattern.prototype.getInput = function() {
    return this.input;
  };

  Pattern.prototype.setInput = function(input) {
    this.input = input;
  };

  Pattern.prototype.getOutput = function() {
    return this.output;
  };

  Pattern.prototype.setOutput = function(output) {
    this.output = output;
  };

  return Pattern;

})();

Neuron = (function() {
  function Neuron() {
    this.activationFn = function(activation) {
      return 1.0 / (1.0 + Math.exp - activation);
    };
    this.derivativeFn = function(output) {
      return output * (1.0 - output);
    };
  }


  /**
   * Execute feed forward
   * @param  {double[]} input
   * @return {double}
   */

  Neuron.prototype.forward = function(input) {
    return this.lastOutput = this.activationFn(input.reduce(function(previous, current, index) {
      return previous += this.weights[index] * current;
    }, 0.0));
  };


  /**
   * Execute feed forward
   * @param  {double} input
   * @return {double}
   */

  Neuron.prototype.back = function(input) {};


  /**
   * Update the weights
   * @param {double} learningRate
   * @param {double} momentum
   */

  Neuron.prototype.update = function(learningRate, momentum) {
    var delta, i, _results;
    i = this.weights.length;
    _results = [];
    while (i--) {
      delta = learningRate * this.derivative[i] + this.lastDelta[i] * momentum;
      this.weights[i] += delta;
      this.lastDelta[i] = delta;
      _results.push(this.deriv[i] = 0.0);
    }
    return _results;
  };

  return Neuron;

})();

Layer = (function() {

  /**
   * Create a layer with neurons
   * @param  {Neurons[]} neurons
   */
  function Layer(neurons) {
    this.neurons = neurons;
  }


  /**
   * Init the layer, setting the previous and next layers
   * @param  {Layer} previous
   * @param  {Layer} next
   */

  Layer.prototype.init = function(previous, next) {
    this.previous = previous;
    this.next = next;
  };


  /**
   * Get the list of neurons contained in this layer
   * @return {Neuron[]}
   */

  Layer.prototype.getNeurons = function() {
    return this.neurons;
  };


  /**
   * Set the previous layer
   * @param {Layer} previous
   */

  Layer.prototype.setPrevious = function(previous) {
    this.previous = previous;
  };


  /**
   * Get the previous layer
   * @return {Layer}
   */

  Layer.prototype.getPrevious = function() {
    return this.previous;
  };


  /**
   * Set the next layer
   * @param {Layer} next
   */

  Layer.prototype.setNext = function(next) {
    this.next = next;
  };


  /**
   * Get the next layer
   * @return {Layer}
   */

  Layer.prototype.getNext = function() {
    return this.next;
  };


  /**
   * Execute feed forward, calls forward on next layer
   * @param  {double[]} input
   * @return {double[]}
   */

  Layer.prototype.forward = function(input) {
    var output;
    output = this.neurons.map(function(neuron) {
      return neuron.forward(input);
    });
    if (this.next != null) {
      return this.next.forward(output);
    } else {
      return output;
    }
  };


  /**
   * Execute feed back, calls back on prev layer
   * @param  {double[]} input
   * @return {double[]}
   */

  Layer.prototype.back = function(expected) {
    var output;
    output = this.neurons.map(function(neuron) {
      return neuron.back(expected);
    });
    if (this.previous != null) {
      return this.previous.back(output);
    } else {
      return output;
    }
  };


  /**
   * Update the neurons in this layer
   * @param {double} learningRate
   * @param {double} momentum
   */

  Layer.prototype.update = function(learningRate, momentum) {
    return this.neurons.forEach(function(neuron) {
      return neuron.update(learningRate, momentum);
    });
  };

  return Layer;

})();

Network = (function() {
  var back, forward, update;

  function Network(layers) {
    var layer, neuron;
    this.layers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = layers.length; _i < _len; _i++) {
        layer = layers[_i];
        _results.push(new Layer((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = neurons.length; _j < _len1; _j++) {
            neuron = neurons[_j];
            _results1.push(new Neuron(neuron));
          }
          return _results1;
        })()));
      }
      return _results;
    })();
    this.layers.forEach(function(layer, index, layers) {
      return layer.init((index === 0 ? null : layers[index - 1], index === layers.length - 1 ? null : layers[index + 1]));
    });
  }


  /**
   * Create a network
   * @param  {Layer[]} layers
   * @return {Network}
   */

  Network.create = function(layers) {
    return new Network(layers);
  };

  forward = function(input) {
    return this.layers[0].forward(vector);
  };

  back = function(output) {
    return this.layers[this.layers.length - 1].back(output);
  };

  update = function(learningRate, momentum) {
    return this.layers.forEach(function(layer) {
      return layer.update(learningRate, momentum);
    });
  };


  /**
   * Train the network
   * @param  {Pattern[]} patterns
   * @param  {double} learningRate
   * @param  {double} momentum
   * @param  {int} iterations=1000
   */

  Network.prototype.train = function(patterns, learningRate, momentum, iterations) {
    var i, _results;
    if (iterations == null) {
      iterations = 1000;
    }
    i = iterations;
    _results = [];
    while (i--) {
      patterns.forEach(function(pattern) {
        forward(pattern.getInput());
        return back(pattern.getOutput());
      });
      _results.push(update(learningRate, momentum));
    }
    return _results;
  };


  /**
   * Solve the domain using this network
   * @param  {Network} domain
   * @return {[[]]}
   */

  Network.prototype.solve = function(domain) {
    return forward(domain);
  };

  return Network;

})();

module.exports = Network;


},{}],2:[function(require,module,exports){
(function (global){
var ai;

ai = {
  version: '0.0.1'
};

ai.network = require('./back-propagation.coffee');

global.ai = ai;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./back-propagation.coffee":1}]},{},[2])