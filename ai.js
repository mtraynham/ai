(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.neural = require('./neural/index.coffee');

exports.stochastic = require('./stochastic/index.coffee');

exports.swarm = require('./swarm/index.coffee');


},{"./neural/index.coffee":3,"./stochastic/index.coffee":4,"./swarm/index.coffee":7}],2:[function(require,module,exports){
var Neuron, activate, backwardPropagateError, calculateErrorDerivativesForWeights, createNeuron, execute, fillArray, forwardPropagate, initWeights, randomVector, testNetwork, trainNetwork, transfer, transferDerivative, updateWeights;

randomVector = require('../../util/randomVector.coffee');

fillArray = require('../../util/fillArray.coffee');

Neuron = (function() {
  function Neuron(weights, lastDelta, deriv) {
    this.weights = weights;
    this.lastDelta = lastDelta;
    this.deriv = deriv;
  }

  return Neuron;

})();


/**
 * Initialize weights
 * @param  {Integer} numberOfWeights
 * @return {[]}
 */

initWeights = function(numberOfWeights) {
  var i, minmax;
  i = numberOfWeights;
  minmax = [];
  while (i--) {
    minmax.push([-Math.random(), Math.random()]);
  }
  return randomVector(minmax);
};


/**
 * Activate
 * @param  {[]} weights
 * @param  {[]} vector
 * @return {Float}
 */

activate = function(weights, vector) {
  return vector.reduce(function(prev, cur, i) {
    return prev += weights[i] * cur;
  }, 0.0);
};


/**
 * Transfer
 * @param  {Float} activation
 * @return {Float}
 */

transfer = function(activation) {
  return 1.0 / (1.0 + Math.exp(-activation));
};


/**
 * Transfer derivative
 * @param  {Float} output
 * @return {Float}
 */

transferDerivative = function(output) {
  return output * (1.0 - output);
};


/**
 * Forward propagate
 * @param  {[[]]} network
 * @param  {[]} vector
 * @return {Float}
 */

forwardPropagate = function(network, vector) {
  network.forEach(function(layer, i) {
    var input;
    input = i === 0 ? vector : network[i - 1].map(function(neuron) {
      return neuron.output;
    });
    return layer.forEach(function(neuron) {
      neuron.activation = activate(neuron.weights, input);
      return neuron.output = transfer(neuron.activation);
    });
  });
  return network[network.length - 1][0].output;
};


/**
 * Back propapate error
 * @param  {[[]]} network
 * @param  {Float} expectedOutput
 */

backwardPropagateError = function(network, expectedOutput) {
  var error, i, neuron, _results;
  i = network.length;
  _results = [];
  while (i--) {
    if (i === network.length - 1) {
      neuron = network[i][0];
      error = expectedOutput - neuron.output;
      _results.push(neuron.delta = error * transferDerivative(neuron.output));
    } else {
      _results.push(network[i].forEach(function(neuron, j) {
        return neuron.delta = transferDerivative(neuron.output * network[i + 1].reduce(function(prev, nextNeuron) {
          return prev += nextNeuron.weights[j] * nextNeuron.delta;
        }, 0));
      }));
    }
  }
  return _results;
};


/**
 * Calculate error derivatives for weights
 * @param  {[[]]} network
 * @param  {[]} vector
 */

calculateErrorDerivativesForWeights = function(network, vector) {
  return network.forEach(function(layer, i) {
    var input;
    input = i === 0 ? vector : network[i - 1].map(function(neuron, j) {
      return network[i - 1][j].output;
    });
    return layer.forEach(function(neuron) {
      input.forEach(function(signal, j) {
        return neuron.deriv[j] += neuron.delta * signal;
      });
      return neuron.deriv[neuron.deriv.length - 1] += neuron.delta;
    });
  });
};


/**
 * Update the weights
 * @param  {[[]]} network
 * @param  {Float} lrate
 * @param  {Float} momentum
 */

updateWeights = function(network, lrate, momentum) {
  momentum = momentum || 0.8;
  return network.forEach(function(layer) {
    return layer.forEach(function(neuron) {
      return neuron.weights.forEach(function(weight, i) {
        var delta;
        delta = lrate * neuron.deriv[i] + neuron.lastDelta[i] * momentum;
        neuron.weights[i] += delta;
        neuron.lastDelta[i] = delta;
        return neuron.deriv[i] = 0.0;
      });
    });
  });
};


/**
 * Train the network
 * @param  {[[]]} network
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @param  {Integer} iterations
 * @param  {Float} lrate
 */

trainNetwork = function(network, domain, numberOfInputs, iterations, lrate) {
  var i, _results;
  i = iterations;
  _results = [];
  while (i--) {
    domain.forEach(function(pattern) {
      var expected, output;
      expected = pattern[pattern.length(-1)];
      output = forwardPropagate(network, pattern);
      backwardPropagateError(network, expected);
      return calculateErrorDerivativesForWeights(network, pattern);
    });
    _results.push(updateWeights(network, lrate));
  }
  return _results;
};


/**
 * Test the network
 * @param  {[[]]} network
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @return {Integer}
 */

testNetwork = function(network, domain, numberOfInputs) {
  var correct;
  correct = 0;
  domain.forEach(function(pattern) {
    var output;
    output = forwardPropagate(network, pattern);
    if (Math.round(output) === pattern[pattern.length - 1]) {
      return correct += 1;
    }
  });
  return correct;
};


/**
 * Create a neuron
 * @param  {Integer} numberOfInputs
 * @return {Neuron}
 */

createNeuron = function(numberOfInputs) {
  return new Neuron(initWeights(numberOfInputs + 1), fillArray(0, numberOfInputs + 1), fillArray(0, numberOfInputs + 1));
};


/**
 * Execute back propagation
 * @param  {[]} domain
 * @param  {Integer} numberOfInputs
 * @param  {Integer} iterations
 * @param  {Integer} numberOfNodes
 * @param  {Float} lrate
 * @return {[[]]}
 */

execute = function(domain, numberOfInputs, iterations, numberOfNodes, lrate) {
  var i, network;
  network = [];
  i = numberOfNodes;
  while (i--) {
    network.push(createNeuron(numberOfInputs));
  }
  network.push(createNeuron(network[network.length - 1].length));
  trainNetwork(network, domain, numberOfInputs, iterations, lrate);
  testNetwork(network, domain, numberOfInputs);
  return network;
};

module.exports = execute;


},{"../../util/fillArray.coffee":10,"../../util/randomVector.coffee":12}],3:[function(require,module,exports){
exports.backPropagation = require('./backPropagation.coffee');


},{"./backPropagation.coffee":2}],4:[function(require,module,exports){
exports.randomSearch = require('./randomSearch.coffee');


},{"./randomSearch.coffee":5}],5:[function(require,module,exports){

/*
 * http://en.wikipedia.org/wiki/Bees_algorithm
 */
var Candidate, objectiveFn, randomVector, search;

randomVector = require('../../util/randomVector.coffee');

Candidate = (function() {
  function Candidate(searchSpace) {
    this.vector = randomVector(searchSpace);
    this.cost = objectiveFn(this.vector);
  }

  return Candidate;

})();


/**
 * Objective function
 * @param  {[]} vector
 * @return {[]}
 */

objectiveFn = function(vector) {
  return vector.reduce(function(prev, cur) {
    return prev + Math.pow(cur, 2);
  }, 0);
};


/**
 * Search for best candidate
 * @param  {[[]]} searchSpace
 * @param  {Integer} maxIterations
 * @return {Candidate}
 */

search = function(searchSpace, maxIterations) {
  var best, candidate;
  best = null;
  candidate = null;
  while (maxIterations--) {
    candidate = new Candidate(searchSpace);
    if (!best || candidate.cost < best.cost) {
      best = candidate;
    }
  }
  return best;
};

module.exports = search;


},{"../../util/randomVector.coffee":12}],6:[function(require,module,exports){

/*
 * http://en.wikipedia.org/wiki/Bees_algorithm
 */
var Bee, createNeighborBee, createRandomBee, createScoutBees, objectiveFn, randomVector, search, searchNeighborBees;

randomVector = require('../../util/randomVector.coffee');

Bee = (function() {
  function Bee(vector, fitness) {
    this.vector = vector;
    this.fitness = fitness;
  }

  return Bee;

})();


/**
 * Objective function
 * @param  {[]} vector
 * @return {[]}
 */

objectiveFn = function(vector) {
  return vector.reduce(function(prev, cur) {
    return prev + Math.pow(cur, 2);
  }, 0);
};


/**
 * Create a random bee
 * @param  {[[]]} searchSpace
 * @return {Bee}
 */

createRandomBee = function(searchSpace) {
  return new Bee(randomVector(searchSpace));
};


/**
 * Create a neighbor bee
 * @param  {[]} site
 * @param  {Integer} patchSize
 * @param  {[[]]} searchSpace
 * @return {Bee}
 */

createNeighborBee = function(site, patchSize, searchSpace) {
  return new Bee(site.map(function(cur, i) {
    cur = Math.random() < 0.5 ? cur + Math.random() * patchSize : cur - Math.random() * patchSize;
    if (cur < searchSpace[i][0]) {
      cur = searchSpace[i][0];
    }
    if (cur > searchSpace[i][1]) {
      cur = searchSpace[i][1];
    }
    return cur;
  }));
};


/**
 * Create scout bees
 * @param  {[[]]} searchSpace
 * @param  {Integer} numberOfScouts
 * @return {Bee[]}
 */

createScoutBees = function(searchSpace, numberOfScouts) {
  var i, _results;
  i = numberOfScouts;
  _results = [];
  while (i--) {
    _results.push(createRandomBee(searchSpace));
  }
  return _results;
};


/**
 * Search neighbor bees
 * @param  {Bee} parent
 * @param  {Integer} neighborSize
 * @param  {Integer} patchSize
 * @param  {[[]]} searchSpace
 * @return {Bee}
 */

searchNeighborBees = function(parent, neighborSize, patchSize, searchSpace) {
  var bee, i, neighborBees;
  i = patchSize;
  neighborBees = [];
  while (i--) {
    bee = createNeighborBee(parent.vector, patchSize, searchSpace);
    bee.fitness = objectiveFn(bee.vector);
    neighborBees.push(bee);
  }
  return (neighborBees.sort(function(a, b) {
    return a - b;
  }))[0];
};


/**
 * Search
 * @param  {Integer} maxGens
 * @param  {[[]]} searchSpace
 * @param  {Integer} numberOfBees
 * @param  {Integer} numberOfSites
 * @param  {Integer} eliteSites
 * @param  {Integer} patchSize
 * @param  {Integer} eliteBees
 * @param  {Integer} otherBees
 * @return {Bee}
 */

search = function(maxGens, searchSpace, numberOfBees, numberOfSites, eliteSites, patchSize, eliteBees, otherBees) {
  var best, i, j, k, nextGen, population, scoutBees;
  best = null;
  i = numberOfBees;
  j = maxGens;
  population = [];
  while (i--) {
    population.push(createRandomBee(searchSpace));
  }
  while (j--) {
    population.forEach(function(cur) {
      return cur.fitness = objectiveFn(cur.vector);
    });
    population.sort(function(a, b) {
      return a.fitness - b.fitness;
    });
    if (!best || population[0].fitness < best.fitness) {
      best = population[0];
    }
    nextGen = [];
    k = numberOfSites;
    while (k--) {
      nextGen.push(searchNeighborBees(parent, (i < eliteSites ? eliteBees : otherBees), patchSize, searchSpace));
    }
    scoutBees = createScoutBees(searchSpace, numberOfBees - numberOfSites);
    population = nextGen.concat(scoutBees);
    patchSize = patchSize * 0.95;
  }
  return best;
};

module.exports = search;


},{"../../util/randomVector.coffee":12}],7:[function(require,module,exports){
exports.bees = require('./bees.coffee');


},{"./bees.coffee":6}],8:[function(require,module,exports){
(function (global){
var ai;

ai = {
  version: '0.0.1'
};

ai.bio = require('./bio/index.coffee');

ai.ml = require('./ml/index.coffee');

ai.util = require('./util/index.coffee');

global.ai = ai;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./bio/index.coffee":1,"./ml/index.coffee":9,"./util/index.coffee":11}],9:[function(require,module,exports){



},{}],10:[function(require,module,exports){

/**
 * Fill an array with a particular value
 * @param {*} fill
 * @param {Integer} length
 * @return {[]}
 */
var fillArray;

fillArray = function(fill, length) {
  var _results;
  _results = [];
  while (length--) {
    _results.push(fill);
  }
  return _results;
};

module.exports = fillArray;


},{}],11:[function(require,module,exports){
exports.fillArray = require('./fillArray.coffee');

exports.randomVector = require('./randomVector.coffee');


},{"./fillArray.coffee":10,"./randomVector.coffee":12}],12:[function(require,module,exports){

/**
 * Create a random vector
 * @param  {[[]]} mm minmax
 * @return {[]}
 */
var randomVector;

randomVector = function(minmax) {
  return minmax.map(function(cur) {
    return cur[0] + ((cur[1] - cur[0]) * Math.random());
  });
};

module.exports = randomVector;


},{}]},{},[8])