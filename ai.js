(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ActivationFunction, ErrorFunction, Layer, LinearErrorFunction, Network, Neuron, Pattern, SigmoidActivationFunction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

ActivationFunction = (function() {
  function ActivationFunction(activationFunction, derivativeFunction) {
    this.activationFunction = activationFunction;
    this.derivativeFunction = derivativeFunction;
  }

  ActivationFunction.prototype.getActivationFunction = function() {
    return this.activationFunction;
  };

  ActivationFunction.prototype.getDerivativeFunction = function() {
    return this.derivativeFunction;
  };

  return ActivationFunction;

})();

SigmoidActivationFunction = (function(_super) {
  var activationFunction, derivativeFunction;

  __extends(SigmoidActivationFunction, _super);

  activationFunction = function(activation) {
    return 1.0 / (1.0 + Math.exp(-activation));
  };

  derivativeFunction = function(previousOutput, output) {
    return output * (1.0 - output);
  };

  function SigmoidActivationFunction() {
    SigmoidActivationFunction.__super__.constructor.call(this, activationFunction, derivativeFunction);
  }

  return SigmoidActivationFunction;

})(ActivationFunction);

ErrorFunction = (function() {
  function ErrorFunction(errorFunction) {
    this.errorFunction = errorFunction;
  }

  ErrorFunction.prototype.getErrorFunction = function() {
    return this.errorFunction;
  };

  return ErrorFunction;

})();

LinearErrorFunction = (function(_super) {
  var errorFunction;

  __extends(LinearErrorFunction, _super);

  errorFunction = function(ideal, actual) {
    return ideal - actual;
  };

  function LinearErrorFunction() {
    LinearErrorFunction.__super__.constructor.call(this, errorFunction);
  }

  return LinearErrorFunction;

})(ErrorFunction);

Neuron = (function() {
  function Neuron(activation) {
    this.activation = activation;
  }


  /**
   * Execute feed forward
   * @param  {double[]} input
   * @return {double}
   */

  Neuron.prototype.forward = function(input) {
    return this.lastOutput = this.activation.getActivationFunction()(input.reduce(function(previous, current, index) {
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

  function Network(layers, activationFunction, errorFunction) {
    var layer, neuron;
    this.layers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = layers.length; _i < _len; _i++) {
        layer = layers[_i];
        _results.push(new Layer((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = layer.length; _j < _len1; _j++) {
            neuron = layer[_j];
            _results1.push(new Neuron(activationFunction, errorFunction));
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
   * Execute feed forward propagation on this network
   * @param  {[]} input [description]
   * @return {[]}
   */

  forward = function(input) {
    return this.layers[0].forward(input);
  };


  /**
   * Execute fedd back propagation on this network
   * @param  {[]} output
   * @return {[]}
   */

  back = function(output) {
    return this.layers[this.layers.length - 1].back(output);
  };


  /**
   * Update the network
   * @param  {double} learningRate
   * @param  {double} momentum
   */

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
   * @param  {[]} domain
   * @return {[]}
   */

  Network.prototype.solve = function(domain) {
    return forward(domain);
  };

  Network.test = function() {
    var newtwork, patterns;
    patterns = [new Pattern([0, 0], [0]), new Pattern([0, 1], [1]), new Pattern([1, 0], [1]), new Pattern([1, 1], [0])];
    newtwork = this.constuctor.create([[0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0]], new SigmoidActivationFunction(), new LinearErrorFunction());
    network.train(patterns, 0.3, 0.8);
    netowrk.solve(patterns[0]);
    netowrk.solve(patterns[1]);
    netowrk.solve(patterns[2]);
    return netowrk.solve(patterns[3]);
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