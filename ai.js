(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.neural = require('./neural/index.coffee');

exports.swarm = require('./swarm/index.coffee');


},{"./neural/index.coffee":3,"./swarm/index.coffee":5}],2:[function(require,module,exports){
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
  return new Neuron(initWeights(numberOfInputs + 1, fillArray(0, numberOfInputs + 1), fillArray(0, numberOfInputs + 1)));
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


},{"../../util/fillArray.coffee":8,"../../util/randomVector.coffee":10}],3:[function(require,module,exports){
exports.backPropagation = require('./backPropagation.coffee');


},{"./backPropagation.coffee":2}],4:[function(require,module,exports){

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


},{"../../util/randomVector.coffee":10}],5:[function(require,module,exports){
exports.bees = require('./bees.coffee');


},{"./bees.coffee":4}],6:[function(require,module,exports){
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
},{"./bio/index.coffee":1,"./ml/index.coffee":7,"./util/index.coffee":9}],7:[function(require,module,exports){



},{}],8:[function(require,module,exports){

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


},{}],9:[function(require,module,exports){
exports.fillArray = require('./fillArray.coffee');

exports.randomVector = require('./randomVector.coffee');


},{"./fillArray.coffee":8,"./randomVector.coffee":10}],10:[function(require,module,exports){

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


},{}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tcnQ2NDY3L0RvY3VtZW50cy9Qcm9qZWN0cy9haS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21ydDY0NjcvRG9jdW1lbnRzL1Byb2plY3RzL2FpL3NyYy9iaW8vaW5kZXguY29mZmVlIiwiL1VzZXJzL21ydDY0NjcvRG9jdW1lbnRzL1Byb2plY3RzL2FpL3NyYy9iaW8vbmV1cmFsL2JhY2tQcm9wYWdhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvbXJ0NjQ2Ny9Eb2N1bWVudHMvUHJvamVjdHMvYWkvc3JjL2Jpby9uZXVyYWwvaW5kZXguY29mZmVlIiwiL1VzZXJzL21ydDY0NjcvRG9jdW1lbnRzL1Byb2plY3RzL2FpL3NyYy9iaW8vc3dhcm0vYmVlcy5jb2ZmZWUiLCIvVXNlcnMvbXJ0NjQ2Ny9Eb2N1bWVudHMvUHJvamVjdHMvYWkvc3JjL2Jpby9zd2FybS9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvbXJ0NjQ2Ny9Eb2N1bWVudHMvUHJvamVjdHMvYWkvc3JjL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9tcnQ2NDY3L0RvY3VtZW50cy9Qcm9qZWN0cy9haS9zcmMvbWwvaW5kZXguY29mZmVlIiwiL1VzZXJzL21ydDY0NjcvRG9jdW1lbnRzL1Byb2plY3RzL2FpL3NyYy91dGlsL2ZpbGxBcnJheS5jb2ZmZWUiLCIvVXNlcnMvbXJ0NjQ2Ny9Eb2N1bWVudHMvUHJvamVjdHMvYWkvc3JjL3V0aWwvaW5kZXguY29mZmVlIiwiL1VzZXJzL21ydDY0NjcvRG9jdW1lbnRzL1Byb2plY3RzL2FpL3NyYy91dGlsL3JhbmRvbVZlY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxPQUFPLENBQUMsTUFBUixHQUFpQixPQUFBLENBQVEsdUJBQVIsQ0FBakIsQ0FBQTs7QUFBQSxPQUNPLENBQUMsS0FBUixHQUFnQixPQUFBLENBQVEsc0JBQVIsQ0FEaEIsQ0FBQTs7OztBQ0FBLElBQUEsb09BQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQ0FBUixDQUFmLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSw2QkFBUixDQURaLENBQUE7O0FBQUE7QUFJaUIsRUFBQSxnQkFBRSxPQUFGLEVBQVksU0FBWixFQUF3QixLQUF4QixHQUFBO0FBQWdDLElBQS9CLElBQUMsQ0FBQSxVQUFBLE9BQThCLENBQUE7QUFBQSxJQUFyQixJQUFDLENBQUEsWUFBQSxTQUFvQixDQUFBO0FBQUEsSUFBVCxJQUFDLENBQUEsUUFBQSxLQUFRLENBQWhDO0VBQUEsQ0FBYjs7Z0JBQUE7O0lBSkosQ0FBQTs7QUFNQTtBQUFBOzs7O0dBTkE7O0FBQUEsV0FXQSxHQUFjLFNBQUMsZUFBRCxHQUFBO0FBQ1YsTUFBQSxTQUFBO0FBQUEsRUFBQSxDQUFBLEdBQUksZUFBSixDQUFBO0FBQUEsRUFDQSxNQUFBLEdBQVMsRUFEVCxDQUFBO0FBRUEsU0FBTSxDQUFBLEVBQU4sR0FBQTtBQUNJLElBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLENBQUEsSUFBSyxDQUFDLE1BQUwsQ0FBQSxDQUFGLEVBQWlCLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBakIsQ0FBWixDQUFBLENBREo7RUFBQSxDQUZBO1NBSUEsWUFBQSxDQUFhLE1BQWIsRUFMVTtBQUFBLENBWGQsQ0FBQTs7QUFrQkE7QUFBQTs7Ozs7R0FsQkE7O0FBQUEsUUF3QkEsR0FBVyxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7U0FDUCxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsSUFBRCxFQUFPLEdBQVAsRUFBWSxDQUFaLEdBQUE7V0FDVixJQUFBLElBQVEsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLElBRFg7RUFBQSxDQUFkLEVBRUUsR0FGRixFQURPO0FBQUEsQ0F4QlgsQ0FBQTs7QUE2QkE7QUFBQTs7OztHQTdCQTs7QUFBQSxRQWtDQSxHQUFXLFNBQUMsVUFBRCxHQUFBO1NBQWdCLEdBQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsVUFBVCxDQUFQLEVBQXRCO0FBQUEsQ0FsQ1gsQ0FBQTs7QUFvQ0E7QUFBQTs7OztHQXBDQTs7QUFBQSxrQkF5Q0EsR0FBcUIsU0FBQyxNQUFELEdBQUE7U0FBWSxNQUFBLEdBQVMsQ0FBQyxHQUFBLEdBQU0sTUFBUCxFQUFyQjtBQUFBLENBekNyQixDQUFBOztBQTJDQTtBQUFBOzs7OztHQTNDQTs7QUFBQSxnQkFpREEsR0FBbUIsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2YsRUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixTQUFDLEtBQUQsRUFBUSxDQUFSLEdBQUE7QUFDWixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBVyxDQUFBLEtBQUssQ0FBUixHQUFlLE1BQWYsR0FBMkIsT0FBUSxDQUFBLENBQUEsR0FBSSxDQUFKLENBQU0sQ0FBQyxHQUFmLENBQW1CLFNBQUMsTUFBRCxHQUFBO2FBQVksTUFBTSxDQUFDLE9BQW5CO0lBQUEsQ0FBbkIsQ0FBbkMsQ0FBQTtXQUNBLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQyxNQUFELEdBQUE7QUFDVixNQUFBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFFBQUEsQ0FBUyxNQUFNLENBQUMsT0FBaEIsRUFBeUIsS0FBekIsQ0FBcEIsQ0FBQTthQUNBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFFBQUEsQ0FBUyxNQUFNLENBQUMsVUFBaEIsRUFGTjtJQUFBLENBQWQsRUFGWTtFQUFBLENBQWhCLENBQUEsQ0FBQTtTQUtBLE9BQVEsQ0FBQSxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFqQixDQUFvQixDQUFBLENBQUEsQ0FBRSxDQUFDLE9BTmhCO0FBQUEsQ0FqRG5CLENBQUE7O0FBeURBO0FBQUE7Ozs7R0F6REE7O0FBQUEsc0JBOERBLEdBQXlCLFNBQUMsT0FBRCxFQUFVLGNBQVYsR0FBQTtBQUNyQixNQUFBLDBCQUFBO0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBTyxDQUFDLE1BQVosQ0FBQTtBQUNBO1NBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxJQUFBLElBQUcsQ0FBQSxLQUFLLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXpCO0FBQ0ksTUFBQSxNQUFBLEdBQVMsT0FBUSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLGNBQUEsR0FBaUIsTUFBTSxDQUFDLE1BRGhDLENBQUE7QUFBQSxvQkFFQSxNQUFNLENBQUMsS0FBUCxHQUFlLEtBQUEsR0FBUSxrQkFBQSxDQUFtQixNQUFNLENBQUMsTUFBMUIsRUFGdkIsQ0FESjtLQUFBLE1BQUE7b0JBS0ksT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVgsQ0FBbUIsU0FBQyxNQUFELEVBQVMsQ0FBVCxHQUFBO2VBQ2YsTUFBTSxDQUFDLEtBQVAsR0FBZSxrQkFBQSxDQUFtQixNQUFNLENBQUMsTUFBUCxHQUM5QixPQUFRLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBTSxDQUFDLE1BQWYsQ0FBc0IsU0FBQyxJQUFELEVBQU8sVUFBUCxHQUFBO2lCQUNsQixJQUFBLElBQVEsVUFBVSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQW5CLEdBQXdCLFVBQVUsQ0FBQyxNQUR6QjtRQUFBLENBQXRCLEVBRUUsQ0FGRixDQURXLEVBREE7TUFBQSxDQUFuQixHQUxKO0tBREo7RUFBQSxDQUFBO2tCQUZxQjtBQUFBLENBOUR6QixDQUFBOztBQTRFQTtBQUFBOzs7O0dBNUVBOztBQUFBLG1DQWlGQSxHQUFzQyxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7U0FDbEMsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBQyxLQUFELEVBQVEsQ0FBUixHQUFBO0FBQ1osUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVcsQ0FBQSxLQUFLLENBQVIsR0FBZSxNQUFmLEdBQTJCLE9BQVEsQ0FBQSxDQUFBLEdBQUksQ0FBSixDQUFNLENBQUMsR0FBZixDQUFtQixTQUFDLE1BQUQsRUFBUyxDQUFULEdBQUE7YUFBZSxPQUFRLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWpDO0lBQUEsQ0FBbkIsQ0FBbkMsQ0FBQTtXQUNBLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQyxNQUFELEdBQUE7QUFDVixNQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQyxNQUFELEVBQVMsQ0FBVCxHQUFBO2VBQ1YsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUIsTUFBTSxDQUFDLEtBQVAsR0FBZSxPQUR4QjtNQUFBLENBQWQsQ0FBQSxDQUFBO2FBRUEsTUFBTSxDQUFDLEtBQU0sQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWIsR0FBc0IsQ0FBdEIsQ0FBYixJQUF5QyxNQUFNLENBQUMsTUFIdEM7SUFBQSxDQUFkLEVBRlk7RUFBQSxDQUFoQixFQURrQztBQUFBLENBakZ0QyxDQUFBOztBQXlGQTtBQUFBOzs7OztHQXpGQTs7QUFBQSxhQStGQSxHQUFnQixTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLFFBQWpCLEdBQUE7QUFDWixFQUFBLFFBQUEsR0FBVyxRQUFBLElBQVksR0FBdkIsQ0FBQTtTQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQUMsS0FBRCxHQUFBO1dBQ1osS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLE1BQUQsR0FBQTthQUNWLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBZixDQUF1QixTQUFDLE1BQUQsRUFBUyxDQUFULEdBQUE7QUFDbkIsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFyQixHQUEwQixNQUFNLENBQUMsU0FBVSxDQUFBLENBQUEsQ0FBakIsR0FBc0IsUUFBeEQsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQWYsSUFBcUIsS0FEckIsQ0FBQTtBQUFBLFFBRUEsTUFBTSxDQUFDLFNBQVUsQ0FBQSxDQUFBLENBQWpCLEdBQXNCLEtBRnRCLENBQUE7ZUFHQSxNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixHQUFrQixJQUpDO01BQUEsQ0FBdkIsRUFEVTtJQUFBLENBQWQsRUFEWTtFQUFBLENBQWhCLEVBRlk7QUFBQSxDQS9GaEIsQ0FBQTs7QUF5R0E7QUFBQTs7Ozs7OztHQXpHQTs7QUFBQSxZQWlIQSxHQUFlLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsY0FBbEIsRUFBa0MsVUFBbEMsRUFBOEMsS0FBOUMsR0FBQTtBQUNYLE1BQUEsV0FBQTtBQUFBLEVBQUEsQ0FBQSxHQUFJLFVBQUosQ0FBQTtBQUNBO1NBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxJQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBQyxPQUFELEdBQUE7QUFDWCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsT0FBUSxDQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsQ0FBQSxDQUFmLENBQUEsQ0FBbkIsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLGdCQUFBLENBQWlCLE9BQWpCLEVBQTBCLE9BQTFCLENBRFQsQ0FBQTtBQUFBLE1BRUEsc0JBQUEsQ0FBdUIsT0FBdkIsRUFBZ0MsUUFBaEMsQ0FGQSxDQUFBO2FBR0EsbUNBQUEsQ0FBb0MsT0FBcEMsRUFBNkMsT0FBN0MsRUFKVztJQUFBLENBQWYsQ0FBQSxDQUFBO0FBQUEsa0JBS0EsYUFBQSxDQUFjLE9BQWQsRUFBdUIsS0FBdkIsRUFMQSxDQURKO0VBQUEsQ0FBQTtrQkFGVztBQUFBLENBakhmLENBQUE7O0FBMkhBO0FBQUE7Ozs7OztHQTNIQTs7QUFBQSxXQWtJQSxHQUFjLFNBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsY0FBbEIsR0FBQTtBQUNWLE1BQUEsT0FBQTtBQUFBLEVBQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtBQUFBLEVBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFDLE9BQUQsR0FBQTtBQUNYLFFBQUEsTUFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLGdCQUFBLENBQWlCLE9BQWpCLEVBQTBCLE9BQTFCLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFYLENBQUEsS0FBc0IsT0FBUSxDQUFBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWpCLENBQTlDO2FBQUEsT0FBQSxJQUFXLEVBQVg7S0FGVztFQUFBLENBQWYsQ0FEQSxDQUFBO1NBSUEsUUFMVTtBQUFBLENBbElkLENBQUE7O0FBeUlBO0FBQUE7Ozs7R0F6SUE7O0FBQUEsWUE4SUEsR0FBZSxTQUFDLGNBQUQsR0FBQTtTQUNQLElBQUEsTUFBQSxDQUFPLFdBQUEsQ0FBWSxjQUFBLEdBQWlCLENBQTdCLEVBQWdDLFNBQUEsQ0FBVSxDQUFWLEVBQWEsY0FBQSxHQUFpQixDQUE5QixDQUFoQyxFQUFrRSxTQUFBLENBQVUsQ0FBVixFQUFhLGNBQUEsR0FBaUIsQ0FBOUIsQ0FBbEUsQ0FBUCxFQURPO0FBQUEsQ0E5SWYsQ0FBQTs7QUFpSkE7QUFBQTs7Ozs7Ozs7R0FqSkE7O0FBQUEsT0EwSkEsR0FBVSxTQUFDLE1BQUQsRUFBUyxjQUFULEVBQXlCLFVBQXpCLEVBQXFDLGFBQXJDLEVBQW9ELEtBQXBELEdBQUE7QUFDTixNQUFBLFVBQUE7QUFBQSxFQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFBQSxFQUNBLENBQUEsR0FBSSxhQURKLENBQUE7QUFFQSxTQUFNLENBQUEsRUFBTixHQUFBO0FBQ0ksSUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLFlBQUEsQ0FBYSxjQUFiLENBQWIsQ0FBQSxDQURKO0VBQUEsQ0FGQTtBQUFBLEVBSUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFBLENBQWEsT0FBUSxDQUFBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWpCLENBQW1CLENBQUMsTUFBekMsQ0FBYixDQUpBLENBQUE7QUFBQSxFQUtBLFlBQUEsQ0FBYSxPQUFiLEVBQXNCLE1BQXRCLEVBQThCLGNBQTlCLEVBQThDLFVBQTlDLEVBQTBELEtBQTFELENBTEEsQ0FBQTtBQUFBLEVBTUEsV0FBQSxDQUFZLE9BQVosRUFBcUIsTUFBckIsRUFBNkIsY0FBN0IsQ0FOQSxDQUFBO1NBT0EsUUFSTTtBQUFBLENBMUpWLENBQUE7O0FBQUEsTUFvS00sQ0FBQyxPQUFQLEdBQWlCLE9BcEtqQixDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLGVBQVIsR0FBMEIsT0FBQSxDQUFRLDBCQUFSLENBQTFCLENBQUE7Ozs7QUNBQTtBQUFBOztHQUFBO0FBQUEsSUFBQSwrR0FBQTs7QUFBQSxZQUlBLEdBQWUsT0FBQSxDQUFRLGdDQUFSLENBSmYsQ0FBQTs7QUFBQTtBQU9pQixFQUFBLGFBQUUsTUFBRixFQUFXLE9BQVgsR0FBQTtBQUFxQixJQUFwQixJQUFDLENBQUEsU0FBQSxNQUFtQixDQUFBO0FBQUEsSUFBWCxJQUFDLENBQUEsVUFBQSxPQUFVLENBQXJCO0VBQUEsQ0FBYjs7YUFBQTs7SUFQSixDQUFBOztBQVNBO0FBQUE7Ozs7R0FUQTs7QUFBQSxXQWNBLEdBQWMsU0FBQyxNQUFELEdBQUE7U0FDVixNQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTtXQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQVQsRUFBYyxDQUFkLEVBREc7RUFBQSxDQUFkLEVBRUUsQ0FGRixFQURVO0FBQUEsQ0FkZCxDQUFBOztBQW1CQTtBQUFBOzs7O0dBbkJBOztBQUFBLGVBd0JBLEdBQWtCLFNBQUMsV0FBRCxHQUFBO1NBQXFCLElBQUEsR0FBQSxDQUFJLFlBQUEsQ0FBYSxXQUFiLENBQUosRUFBckI7QUFBQSxDQXhCbEIsQ0FBQTs7QUEwQkE7QUFBQTs7Ozs7O0dBMUJBOztBQUFBLGlCQWlDQSxHQUFvQixTQUFDLElBQUQsRUFBTyxTQUFQLEVBQWtCLFdBQWxCLEdBQUE7U0FDWixJQUFBLEdBQUEsQ0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsR0FBRCxFQUFNLENBQU4sR0FBQTtBQUNiLElBQUEsR0FBQSxHQUFTLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixHQUFuQixHQUE0QixHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLFNBQWxELEdBQWlFLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsU0FBN0YsQ0FBQTtBQUNBLElBQUEsSUFBMkIsR0FBQSxHQUFNLFdBQVksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWhEO0FBQUEsTUFBQSxHQUFBLEdBQU0sV0FBWSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBckIsQ0FBQTtLQURBO0FBRUEsSUFBQSxJQUEyQixHQUFBLEdBQU0sV0FBWSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBaEQ7QUFBQSxNQUFBLEdBQUEsR0FBTSxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFyQixDQUFBO0tBRkE7V0FHQSxJQUphO0VBQUEsQ0FBVCxDQUFKLEVBRFk7QUFBQSxDQWpDcEIsQ0FBQTs7QUF3Q0E7QUFBQTs7Ozs7R0F4Q0E7O0FBQUEsZUE4Q0EsR0FBa0IsU0FBQyxXQUFELEVBQWMsY0FBZCxHQUFBO0FBQ2QsTUFBQSxXQUFBO0FBQUEsRUFBQSxDQUFBLEdBQUksY0FBSixDQUFBO0FBQ0E7U0FBTSxDQUFBLEVBQU4sR0FBQTtBQUNJLGtCQUFBLGVBQUEsQ0FBZ0IsV0FBaEIsRUFBQSxDQURKO0VBQUEsQ0FBQTtrQkFGYztBQUFBLENBOUNsQixDQUFBOztBQW1EQTtBQUFBOzs7Ozs7O0dBbkRBOztBQUFBLGtCQTJEQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxZQUFULEVBQXVCLFNBQXZCLEVBQWtDLFdBQWxDLEdBQUE7QUFDakIsTUFBQSxvQkFBQTtBQUFBLEVBQUEsQ0FBQSxHQUFJLFNBQUosQ0FBQTtBQUFBLEVBQ0EsWUFBQSxHQUFlLEVBRGYsQ0FBQTtBQUVBLFNBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxJQUFBLEdBQUEsR0FBTSxpQkFBQSxDQUFrQixNQUFNLENBQUMsTUFBekIsRUFBaUMsU0FBakMsRUFBNEMsV0FBNUMsQ0FBTixDQUFBO0FBQUEsSUFDQSxHQUFHLENBQUMsT0FBSixHQUFjLFdBQUEsQ0FBWSxHQUFHLENBQUMsTUFBaEIsQ0FEZCxDQUFBO0FBQUEsSUFFQSxZQUFZLENBQUMsSUFBYixDQUFrQixHQUFsQixDQUZBLENBREo7RUFBQSxDQUZBO1NBTUEsQ0FBQyxZQUFZLENBQUMsSUFBYixDQUFrQixTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7V0FBVSxDQUFBLEdBQUksRUFBZDtFQUFBLENBQWxCLENBQUQsQ0FBb0MsQ0FBQSxDQUFBLEVBUG5CO0FBQUEsQ0EzRHJCLENBQUE7O0FBb0VBO0FBQUE7Ozs7Ozs7Ozs7O0dBcEVBOztBQUFBLE1BZ0ZBLEdBQVMsU0FBQyxPQUFELEVBQVUsV0FBVixFQUF1QixZQUF2QixFQUFxQyxhQUFyQyxFQUFvRCxVQUFwRCxFQUFnRSxTQUFoRSxFQUEyRSxTQUEzRSxFQUFzRixTQUF0RixHQUFBO0FBQ0wsTUFBQSw2Q0FBQTtBQUFBLEVBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUFBLEVBQ0EsQ0FBQSxHQUFJLFlBREosQ0FBQTtBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BRkosQ0FBQTtBQUFBLEVBR0EsVUFBQSxHQUFhLEVBSGIsQ0FBQTtBQUlBLFNBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxJQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGVBQUEsQ0FBZ0IsV0FBaEIsQ0FBaEIsQ0FBQSxDQURKO0VBQUEsQ0FKQTtBQU1BLFNBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDSSxJQUFBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFNBQUMsR0FBRCxHQUFBO2FBQVMsR0FBRyxDQUFDLE9BQUosR0FBYyxXQUFBLENBQVksR0FBRyxDQUFDLE1BQWhCLEVBQXZCO0lBQUEsQ0FBbkIsQ0FBQSxDQUFBO0FBQUEsSUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7YUFBVSxDQUFDLENBQUMsT0FBRixHQUFZLENBQUMsQ0FBQyxRQUF4QjtJQUFBLENBQWhCLENBREEsQ0FBQTtBQUVBLElBQUEsSUFBd0IsQ0FBQSxJQUFBLElBQVMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWQsR0FBd0IsSUFBSSxDQUFDLE9BQTlEO0FBQUEsTUFBQSxJQUFBLEdBQU8sVUFBVyxDQUFBLENBQUEsQ0FBbEIsQ0FBQTtLQUZBO0FBQUEsSUFHQSxPQUFBLEdBQVUsRUFIVixDQUFBO0FBQUEsSUFJQSxDQUFBLEdBQUksYUFKSixDQUFBO0FBS0EsV0FBTSxDQUFBLEVBQU4sR0FBQTtBQUNJLE1BQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixDQUFJLENBQUEsR0FBSSxVQUFQLEdBQXVCLFNBQXZCLEdBQXNDLFNBQXZDLENBQTNCLEVBQ1AsU0FETyxFQUNJLFdBREosQ0FBYixDQUFBLENBREo7SUFBQSxDQUxBO0FBQUEsSUFRQSxTQUFBLEdBQVksZUFBQSxDQUFnQixXQUFoQixFQUE4QixZQUFBLEdBQWUsYUFBN0MsQ0FSWixDQUFBO0FBQUEsSUFTQSxVQUFBLEdBQWEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFmLENBVGIsQ0FBQTtBQUFBLElBVUEsU0FBQSxHQUFZLFNBQUEsR0FBWSxJQVZ4QixDQURKO0VBQUEsQ0FOQTtTQWtCQSxLQW5CSztBQUFBLENBaEZULENBQUE7O0FBQUEsTUFxR00sQ0FBQyxPQUFQLEdBQWlCLE1BckdqQixDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLElBQVIsR0FBZSxPQUFBLENBQVEsZUFBUixDQUFmLENBQUE7Ozs7QUNBQSxJQUFBLEVBQUE7O0FBQUEsRUFBQSxHQUNJO0FBQUEsRUFBQSxPQUFBLEVBQVMsT0FBVDtDQURKLENBQUE7O0FBQUEsRUFHRSxDQUFDLEdBQUgsR0FBUyxPQUFBLENBQVEsb0JBQVIsQ0FIVCxDQUFBOztBQUFBLEVBSUUsQ0FBQyxFQUFILEdBQVEsT0FBQSxDQUFRLG1CQUFSLENBSlIsQ0FBQTs7QUFBQSxFQUtFLENBQUMsSUFBSCxHQUFVLE9BQUEsQ0FBUSxxQkFBUixDQUxWLENBQUE7O0FBQUEsTUFPTSxDQUFDLEVBQVAsR0FBWSxFQVBaLENBQUE7Ozs7OztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBTUEsR0FBWSxTQUFDLElBQUQsRUFBTyxNQUFQLEdBQUE7QUFDUixNQUFBLFFBQUE7QUFBQTtTQUFNLE1BQUEsRUFBTixHQUFBO0FBQ0ksa0JBQUEsS0FBQSxDQURKO0VBQUEsQ0FBQTtrQkFEUTtBQUFBLENBTlosQ0FBQTs7QUFBQSxNQVVNLENBQUMsT0FBUCxHQUFpQixTQVZqQixDQUFBOzs7O0FDQUEsT0FBTyxDQUFDLFNBQVIsR0FBb0IsT0FBQSxDQUFRLG9CQUFSLENBQXBCLENBQUE7O0FBQUEsT0FDTyxDQUFDLFlBQVIsR0FBdUIsT0FBQSxDQUFRLHVCQUFSLENBRHZCLENBQUE7Ozs7QUNBQTtBQUFBOzs7O0dBQUE7QUFBQSxJQUFBLFlBQUE7O0FBQUEsWUFLQSxHQUFlLFNBQUMsTUFBRCxHQUFBO1NBQVksTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEdBQUQsR0FBQTtXQUFTLEdBQUksQ0FBQSxDQUFBLENBQUosR0FBUyxDQUFDLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLEdBQUksQ0FBQSxDQUFBLENBQWQsQ0FBQSxHQUFvQixJQUFJLENBQUMsTUFBTCxDQUFBLENBQXJCLEVBQWxCO0VBQUEsQ0FBWCxFQUFaO0FBQUEsQ0FMZixDQUFBOztBQUFBLE1BT00sQ0FBQyxPQUFQLEdBQWlCLFlBUGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5uZXVyYWwgPSByZXF1aXJlICcuL25ldXJhbC9pbmRleC5jb2ZmZWUnXG5leHBvcnRzLnN3YXJtID0gcmVxdWlyZSAnLi9zd2FybS9pbmRleC5jb2ZmZWUnIiwicmFuZG9tVmVjdG9yID0gcmVxdWlyZSAnLi4vLi4vdXRpbC9yYW5kb21WZWN0b3IuY29mZmVlJ1xuZmlsbEFycmF5ID0gcmVxdWlyZSAnLi4vLi4vdXRpbC9maWxsQXJyYXkuY29mZmVlJ1xuXG5jbGFzcyBOZXVyb25cbiAgICBjb25zdHJ1Y3RvcjogKEB3ZWlnaHRzLCBAbGFzdERlbHRhLCBAZGVyaXYpIC0+XG5cbiMjIypcbiAqIEluaXRpYWxpemUgd2VpZ2h0c1xuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZXZWlnaHRzXG4gKiBAcmV0dXJuIHtbXX1cbiMjI1xuaW5pdFdlaWdodHMgPSAobnVtYmVyT2ZXZWlnaHRzKSAtPlxuICAgIGkgPSBudW1iZXJPZldlaWdodHNcbiAgICBtaW5tYXggPSBbXVxuICAgIHdoaWxlIGktLVxuICAgICAgICBtaW5tYXgucHVzaCBbLU1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCldXG4gICAgcmFuZG9tVmVjdG9yIG1pbm1heFxuXG4jIyMqXG4gKiBBY3RpdmF0ZVxuICogQHBhcmFtICB7W119IHdlaWdodHNcbiAqIEBwYXJhbSAge1tdfSB2ZWN0b3JcbiAqIEByZXR1cm4ge0Zsb2F0fVxuIyMjXG5hY3RpdmF0ZSA9ICh3ZWlnaHRzLCB2ZWN0b3IpIC0+XG4gICAgdmVjdG9yLnJlZHVjZSAocHJldiwgY3VyLCBpKSAtPlxuICAgICAgICBwcmV2ICs9IHdlaWdodHNbaV0gKiBjdXJcbiAgICAsIDAuMFxuXG4jIyMqXG4gKiBUcmFuc2ZlclxuICogQHBhcmFtICB7RmxvYXR9IGFjdGl2YXRpb25cbiAqIEByZXR1cm4ge0Zsb2F0fVxuIyMjXG50cmFuc2ZlciA9IChhY3RpdmF0aW9uKSAtPiAxLjAgLyAoMS4wICsgTWF0aC5leHAgLWFjdGl2YXRpb24pXG5cbiMjIypcbiAqIFRyYW5zZmVyIGRlcml2YXRpdmVcbiAqIEBwYXJhbSAge0Zsb2F0fSBvdXRwdXRcbiAqIEByZXR1cm4ge0Zsb2F0fVxuIyMjXG50cmFuc2ZlckRlcml2YXRpdmUgPSAob3V0cHV0KSAtPiBvdXRwdXQgKiAoMS4wIC0gb3V0cHV0KVxuXG4jIyMqXG4gKiBGb3J3YXJkIHByb3BhZ2F0ZVxuICogQHBhcmFtICB7W1tdXX0gbmV0d29ya1xuICogQHBhcmFtICB7W119IHZlY3RvclxuICogQHJldHVybiB7RmxvYXR9XG4jIyNcbmZvcndhcmRQcm9wYWdhdGUgPSAobmV0d29yaywgdmVjdG9yKSAtPlxuICAgIG5ldHdvcmsuZm9yRWFjaCAobGF5ZXIsIGkpIC0+XG4gICAgICAgIGlucHV0ID0gaWYgaSA9PSAwIHRoZW4gdmVjdG9yIGVsc2UgbmV0d29ya1tpIC0gMV0ubWFwIChuZXVyb24pIC0+IG5ldXJvbi5vdXRwdXRcbiAgICAgICAgbGF5ZXIuZm9yRWFjaCAobmV1cm9uKSAtPlxuICAgICAgICAgICAgbmV1cm9uLmFjdGl2YXRpb24gPSBhY3RpdmF0ZSBuZXVyb24ud2VpZ2h0cywgaW5wdXRcbiAgICAgICAgICAgIG5ldXJvbi5vdXRwdXQgPSB0cmFuc2ZlciBuZXVyb24uYWN0aXZhdGlvblxuICAgIG5ldHdvcmtbbmV0d29yay5sZW5ndGggLSAxXVswXS5vdXRwdXRcblxuIyMjKlxuICogQmFjayBwcm9wYXBhdGUgZXJyb3JcbiAqIEBwYXJhbSAge1tbXV19IG5ldHdvcmtcbiAqIEBwYXJhbSAge0Zsb2F0fSBleHBlY3RlZE91dHB1dFxuIyMjXG5iYWNrd2FyZFByb3BhZ2F0ZUVycm9yID0gKG5ldHdvcmssIGV4cGVjdGVkT3V0cHV0KSAtPlxuICAgIGkgPSBuZXR3b3JrLmxlbmd0aFxuICAgIHdoaWxlIGktLVxuICAgICAgICBpZiBpID09IG5ldHdvcmsubGVuZ3RoIC0gMVxuICAgICAgICAgICAgbmV1cm9uID0gbmV0d29ya1tpXVswXVxuICAgICAgICAgICAgZXJyb3IgPSBleHBlY3RlZE91dHB1dCAtIG5ldXJvbi5vdXRwdXRcbiAgICAgICAgICAgIG5ldXJvbi5kZWx0YSA9IGVycm9yICogdHJhbnNmZXJEZXJpdmF0aXZlIG5ldXJvbi5vdXRwdXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbmV0d29ya1tpXS5mb3JFYWNoIChuZXVyb24sIGopIC0+XG4gICAgICAgICAgICAgICAgbmV1cm9uLmRlbHRhID0gdHJhbnNmZXJEZXJpdmF0aXZlIG5ldXJvbi5vdXRwdXQgKlxuICAgICAgICAgICAgICAgICAgICBuZXR3b3JrW2kgKyAxXS5yZWR1Y2UgKHByZXYsIG5leHROZXVyb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ICs9IG5leHROZXVyb24ud2VpZ2h0c1tqXSAqIG5leHROZXVyb24uZGVsdGFcbiAgICAgICAgICAgICAgICAgICAgLCAwXG5cbiMjIypcbiAqIENhbGN1bGF0ZSBlcnJvciBkZXJpdmF0aXZlcyBmb3Igd2VpZ2h0c1xuICogQHBhcmFtICB7W1tdXX0gbmV0d29ya1xuICogQHBhcmFtICB7W119IHZlY3RvclxuIyMjXG5jYWxjdWxhdGVFcnJvckRlcml2YXRpdmVzRm9yV2VpZ2h0cyA9IChuZXR3b3JrLCB2ZWN0b3IpIC0+XG4gICAgbmV0d29yay5mb3JFYWNoIChsYXllciwgaSkgLT5cbiAgICAgICAgaW5wdXQgPSBpZiBpID09IDAgdGhlbiB2ZWN0b3IgZWxzZSBuZXR3b3JrW2kgLSAxXS5tYXAgKG5ldXJvbiwgaikgLT4gbmV0d29ya1tpIC0gMV1bal0ub3V0cHV0XG4gICAgICAgIGxheWVyLmZvckVhY2ggKG5ldXJvbikgLT5cbiAgICAgICAgICAgIGlucHV0LmZvckVhY2ggKHNpZ25hbCwgaikgLT5cbiAgICAgICAgICAgICAgICBuZXVyb24uZGVyaXZbal0gKz0gbmV1cm9uLmRlbHRhICogc2lnbmFsXG4gICAgICAgICAgICBuZXVyb24uZGVyaXZbbmV1cm9uLmRlcml2Lmxlbmd0aCAtIDFdICs9IG5ldXJvbi5kZWx0YVxuXG4jIyMqXG4gKiBVcGRhdGUgdGhlIHdlaWdodHNcbiAqIEBwYXJhbSAge1tbXV19IG5ldHdvcmtcbiAqIEBwYXJhbSAge0Zsb2F0fSBscmF0ZVxuICogQHBhcmFtICB7RmxvYXR9IG1vbWVudHVtXG4jIyNcbnVwZGF0ZVdlaWdodHMgPSAobmV0d29yaywgbHJhdGUsIG1vbWVudHVtKSAtPlxuICAgIG1vbWVudHVtID0gbW9tZW50dW0gfHwgMC44XG4gICAgbmV0d29yay5mb3JFYWNoIChsYXllcikgLT5cbiAgICAgICAgbGF5ZXIuZm9yRWFjaCAobmV1cm9uKSAtPlxuICAgICAgICAgICAgbmV1cm9uLndlaWdodHMuZm9yRWFjaCAod2VpZ2h0LCBpKSAtPlxuICAgICAgICAgICAgICAgIGRlbHRhID0gbHJhdGUgKiBuZXVyb24uZGVyaXZbaV0gKyBuZXVyb24ubGFzdERlbHRhW2ldICogbW9tZW50dW1cbiAgICAgICAgICAgICAgICBuZXVyb24ud2VpZ2h0c1tpXSArPSBkZWx0YVxuICAgICAgICAgICAgICAgIG5ldXJvbi5sYXN0RGVsdGFbaV0gPSBkZWx0YVxuICAgICAgICAgICAgICAgIG5ldXJvbi5kZXJpdltpXSA9IDAuMFxuXG4jIyMqXG4gKiBUcmFpbiB0aGUgbmV0d29ya1xuICogQHBhcmFtICB7W1tdXX0gbmV0d29ya1xuICogQHBhcmFtICB7W119IGRvbWFpblxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZJbnB1dHNcbiAqIEBwYXJhbSAge0ludGVnZXJ9IGl0ZXJhdGlvbnNcbiAqIEBwYXJhbSAge0Zsb2F0fSBscmF0ZVxuIyMjXG50cmFpbk5ldHdvcmsgPSAobmV0d29yaywgZG9tYWluLCBudW1iZXJPZklucHV0cywgaXRlcmF0aW9ucywgbHJhdGUpIC0+XG4gICAgaSA9IGl0ZXJhdGlvbnNcbiAgICB3aGlsZSBpLS1cbiAgICAgICAgZG9tYWluLmZvckVhY2ggKHBhdHRlcm4pIC0+XG4gICAgICAgICAgICBleHBlY3RlZCA9IHBhdHRlcm5bcGF0dGVybi5sZW5ndGggLTFdXG4gICAgICAgICAgICBvdXRwdXQgPSBmb3J3YXJkUHJvcGFnYXRlIG5ldHdvcmssIHBhdHRlcm5cbiAgICAgICAgICAgIGJhY2t3YXJkUHJvcGFnYXRlRXJyb3IgbmV0d29yaywgZXhwZWN0ZWRcbiAgICAgICAgICAgIGNhbGN1bGF0ZUVycm9yRGVyaXZhdGl2ZXNGb3JXZWlnaHRzIG5ldHdvcmssIHBhdHRlcm5cbiAgICAgICAgdXBkYXRlV2VpZ2h0cyBuZXR3b3JrLCBscmF0ZVxuXG4jIyMqXG4gKiBUZXN0IHRoZSBuZXR3b3JrXG4gKiBAcGFyYW0gIHtbW11dfSBuZXR3b3JrXG4gKiBAcGFyYW0gIHtbXX0gZG9tYWluXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBudW1iZXJPZklucHV0c1xuICogQHJldHVybiB7SW50ZWdlcn1cbiMjI1xudGVzdE5ldHdvcmsgPSAobmV0d29yaywgZG9tYWluLCBudW1iZXJPZklucHV0cykgLT5cbiAgICBjb3JyZWN0ID0gMFxuICAgIGRvbWFpbi5mb3JFYWNoIChwYXR0ZXJuKSAtPlxuICAgICAgICBvdXRwdXQgPSBmb3J3YXJkUHJvcGFnYXRlIG5ldHdvcmssIHBhdHRlcm5cbiAgICAgICAgY29ycmVjdCArPSAxIGlmIE1hdGgucm91bmQob3V0cHV0KSA9PSBwYXR0ZXJuW3BhdHRlcm4ubGVuZ3RoIC0gMV1cbiAgICBjb3JyZWN0XG5cbiMjIypcbiAqIENyZWF0ZSBhIG5ldXJvblxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZJbnB1dHNcbiAqIEByZXR1cm4ge05ldXJvbn1cbiMjI1xuY3JlYXRlTmV1cm9uID0gKG51bWJlck9mSW5wdXRzKSAtPlxuICAgIG5ldyBOZXVyb24gaW5pdFdlaWdodHMgbnVtYmVyT2ZJbnB1dHMgKyAxLCBmaWxsQXJyYXkoMCwgbnVtYmVyT2ZJbnB1dHMgKyAxKSwgZmlsbEFycmF5KDAsIG51bWJlck9mSW5wdXRzICsgMSlcblxuIyMjKlxuICogRXhlY3V0ZSBiYWNrIHByb3BhZ2F0aW9uXG4gKiBAcGFyYW0gIHtbXX0gZG9tYWluXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBudW1iZXJPZklucHV0c1xuICogQHBhcmFtICB7SW50ZWdlcn0gaXRlcmF0aW9uc1xuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZOb2Rlc1xuICogQHBhcmFtICB7RmxvYXR9IGxyYXRlXG4gKiBAcmV0dXJuIHtbW11dfVxuIyMjXG5leGVjdXRlID0gKGRvbWFpbiwgbnVtYmVyT2ZJbnB1dHMsIGl0ZXJhdGlvbnMsIG51bWJlck9mTm9kZXMsIGxyYXRlKSAtPlxuICAgIG5ldHdvcmsgPSBbXVxuICAgIGkgPSBudW1iZXJPZk5vZGVzXG4gICAgd2hpbGUgaS0tXG4gICAgICAgIG5ldHdvcmsucHVzaCBjcmVhdGVOZXVyb24gbnVtYmVyT2ZJbnB1dHNcbiAgICBuZXR3b3JrLnB1c2ggY3JlYXRlTmV1cm9uIG5ldHdvcmtbbmV0d29yay5sZW5ndGggLSAxXS5sZW5ndGhcbiAgICB0cmFpbk5ldHdvcmsgbmV0d29yaywgZG9tYWluLCBudW1iZXJPZklucHV0cywgaXRlcmF0aW9ucywgbHJhdGVcbiAgICB0ZXN0TmV0d29yayBuZXR3b3JrLCBkb21haW4sIG51bWJlck9mSW5wdXRzXG4gICAgbmV0d29ya1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWN1dGUiLCJleHBvcnRzLmJhY2tQcm9wYWdhdGlvbiA9IHJlcXVpcmUgJy4vYmFja1Byb3BhZ2F0aW9uLmNvZmZlZSciLCIjIyNcbiMgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CZWVzX2FsZ29yaXRobVxuIyMjXG5cbnJhbmRvbVZlY3RvciA9IHJlcXVpcmUgJy4uLy4uL3V0aWwvcmFuZG9tVmVjdG9yLmNvZmZlZSdcblxuY2xhc3MgQmVlXG4gICAgY29uc3RydWN0b3I6IChAdmVjdG9yLCBAZml0bmVzcykgLT5cblxuIyMjKlxuICogT2JqZWN0aXZlIGZ1bmN0aW9uXG4gKiBAcGFyYW0gIHtbXX0gdmVjdG9yXG4gKiBAcmV0dXJuIHtbXX1cbiMjI1xub2JqZWN0aXZlRm4gPSAodmVjdG9yKSAtPlxuICAgIHZlY3Rvci5yZWR1Y2UgKHByZXYsIGN1cikgLT5cbiAgICAgICAgcHJldiArIE1hdGgucG93KGN1ciwgMilcbiAgICAsIDBcblxuIyMjKlxuICogQ3JlYXRlIGEgcmFuZG9tIGJlZVxuICogQHBhcmFtICB7W1tdXX0gc2VhcmNoU3BhY2VcbiAqIEByZXR1cm4ge0JlZX1cbiMjI1xuY3JlYXRlUmFuZG9tQmVlID0gKHNlYXJjaFNwYWNlKSAtPiBuZXcgQmVlIHJhbmRvbVZlY3RvciBzZWFyY2hTcGFjZVxuXG4jIyMqXG4gKiBDcmVhdGUgYSBuZWlnaGJvciBiZWVcbiAqIEBwYXJhbSAge1tdfSBzaXRlXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBwYXRjaFNpemVcbiAqIEBwYXJhbSAge1tbXV19IHNlYXJjaFNwYWNlXG4gKiBAcmV0dXJuIHtCZWV9XG4jIyNcbmNyZWF0ZU5laWdoYm9yQmVlID0gKHNpdGUsIHBhdGNoU2l6ZSwgc2VhcmNoU3BhY2UpIC0+XG4gICAgbmV3IEJlZSBzaXRlLm1hcCAoY3VyLCBpKSAtPlxuICAgICAgICBjdXIgPSBpZiBNYXRoLnJhbmRvbSgpIDwgMC41IHRoZW4gY3VyICsgTWF0aC5yYW5kb20oKSAqIHBhdGNoU2l6ZSBlbHNlIGN1ciAtIE1hdGgucmFuZG9tKCkgKiBwYXRjaFNpemVcbiAgICAgICAgY3VyID0gc2VhcmNoU3BhY2VbaV1bMF0gaWYgY3VyIDwgc2VhcmNoU3BhY2VbaV1bMF1cbiAgICAgICAgY3VyID0gc2VhcmNoU3BhY2VbaV1bMV0gaWYgY3VyID4gc2VhcmNoU3BhY2VbaV1bMV1cbiAgICAgICAgY3VyXG5cbiMjIypcbiAqIENyZWF0ZSBzY291dCBiZWVzXG4gKiBAcGFyYW0gIHtbW11dfSBzZWFyY2hTcGFjZVxuICogQHBhcmFtICB7SW50ZWdlcn0gbnVtYmVyT2ZTY291dHNcbiAqIEByZXR1cm4ge0JlZVtdfVxuIyMjXG5jcmVhdGVTY291dEJlZXMgPSAoc2VhcmNoU3BhY2UsIG51bWJlck9mU2NvdXRzKSAtPlxuICAgIGkgPSBudW1iZXJPZlNjb3V0c1xuICAgIHdoaWxlIGktLVxuICAgICAgICBjcmVhdGVSYW5kb21CZWUgc2VhcmNoU3BhY2VcblxuIyMjKlxuICogU2VhcmNoIG5laWdoYm9yIGJlZXNcbiAqIEBwYXJhbSAge0JlZX0gcGFyZW50XG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBuZWlnaGJvclNpemVcbiAqIEBwYXJhbSAge0ludGVnZXJ9IHBhdGNoU2l6ZVxuICogQHBhcmFtICB7W1tdXX0gc2VhcmNoU3BhY2VcbiAqIEByZXR1cm4ge0JlZX1cbiMjI1xuc2VhcmNoTmVpZ2hib3JCZWVzID0gKHBhcmVudCwgbmVpZ2hib3JTaXplLCBwYXRjaFNpemUsIHNlYXJjaFNwYWNlKSAtPlxuICAgIGkgPSBwYXRjaFNpemVcbiAgICBuZWlnaGJvckJlZXMgPSBbXVxuICAgIHdoaWxlIGktLVxuICAgICAgICBiZWUgPSBjcmVhdGVOZWlnaGJvckJlZSBwYXJlbnQudmVjdG9yLCBwYXRjaFNpemUsIHNlYXJjaFNwYWNlXG4gICAgICAgIGJlZS5maXRuZXNzID0gb2JqZWN0aXZlRm4gYmVlLnZlY3RvclxuICAgICAgICBuZWlnaGJvckJlZXMucHVzaCBiZWVcbiAgICAobmVpZ2hib3JCZWVzLnNvcnQgKGEsIGIpIC0+IGEgLSBiKVswXVxuXG4jIyMqXG4gKiBTZWFyY2hcbiAqIEBwYXJhbSAge0ludGVnZXJ9IG1heEdlbnNcbiAqIEBwYXJhbSAge1tbXV19IHNlYXJjaFNwYWNlXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBudW1iZXJPZkJlZXNcbiAqIEBwYXJhbSAge0ludGVnZXJ9IG51bWJlck9mU2l0ZXNcbiAqIEBwYXJhbSAge0ludGVnZXJ9IGVsaXRlU2l0ZXNcbiAqIEBwYXJhbSAge0ludGVnZXJ9IHBhdGNoU2l6ZVxuICogQHBhcmFtICB7SW50ZWdlcn0gZWxpdGVCZWVzXG4gKiBAcGFyYW0gIHtJbnRlZ2VyfSBvdGhlckJlZXNcbiAqIEByZXR1cm4ge0JlZX1cbiMjI1xuc2VhcmNoID0gKG1heEdlbnMsIHNlYXJjaFNwYWNlLCBudW1iZXJPZkJlZXMsIG51bWJlck9mU2l0ZXMsIGVsaXRlU2l0ZXMsIHBhdGNoU2l6ZSwgZWxpdGVCZWVzLCBvdGhlckJlZXMpIC0+XG4gICAgYmVzdCA9IG51bGxcbiAgICBpID0gbnVtYmVyT2ZCZWVzXG4gICAgaiA9IG1heEdlbnNcbiAgICBwb3B1bGF0aW9uID0gW11cbiAgICB3aGlsZSBpLS1cbiAgICAgICAgcG9wdWxhdGlvbi5wdXNoIGNyZWF0ZVJhbmRvbUJlZSBzZWFyY2hTcGFjZVxuICAgIHdoaWxlIGotLVxuICAgICAgICBwb3B1bGF0aW9uLmZvckVhY2ggKGN1cikgLT4gY3VyLmZpdG5lc3MgPSBvYmplY3RpdmVGbiBjdXIudmVjdG9yXG4gICAgICAgIHBvcHVsYXRpb24uc29ydCAoYSwgYikgLT4gYS5maXRuZXNzIC0gYi5maXRuZXNzXG4gICAgICAgIGJlc3QgPSBwb3B1bGF0aW9uWzBdIGlmICFiZXN0IG9yIHBvcHVsYXRpb25bMF0uZml0bmVzcyA8IGJlc3QuZml0bmVzc1xuICAgICAgICBuZXh0R2VuID0gW11cbiAgICAgICAgayA9IG51bWJlck9mU2l0ZXNcbiAgICAgICAgd2hpbGUgay0tXG4gICAgICAgICAgICBuZXh0R2VuLnB1c2ggc2VhcmNoTmVpZ2hib3JCZWVzIHBhcmVudCwgKGlmIGkgPCBlbGl0ZVNpdGVzIHRoZW4gZWxpdGVCZWVzIGVsc2Ugb3RoZXJCZWVzKVxuICAgICAgICAgICAgICAgICwgcGF0Y2hTaXplLCBzZWFyY2hTcGFjZVxuICAgICAgICBzY291dEJlZXMgPSBjcmVhdGVTY291dEJlZXMgc2VhcmNoU3BhY2UsIChudW1iZXJPZkJlZXMgLSBudW1iZXJPZlNpdGVzKVxuICAgICAgICBwb3B1bGF0aW9uID0gbmV4dEdlbi5jb25jYXQgc2NvdXRCZWVzXG4gICAgICAgIHBhdGNoU2l6ZSA9IHBhdGNoU2l6ZSAqIDAuOTVcbiAgICBiZXN0XG5cbm1vZHVsZS5leHBvcnRzID0gc2VhcmNoIiwiZXhwb3J0cy5iZWVzID0gcmVxdWlyZSAnLi9iZWVzLmNvZmZlZSciLCJhaSA9XG4gICAgdmVyc2lvbjogJzAuMC4xJ1xuXG5haS5iaW8gPSByZXF1aXJlICcuL2Jpby9pbmRleC5jb2ZmZWUnXG5haS5tbCA9IHJlcXVpcmUgJy4vbWwvaW5kZXguY29mZmVlJ1xuYWkudXRpbCA9IHJlcXVpcmUgJy4vdXRpbC9pbmRleC5jb2ZmZWUnXG5cbmdsb2JhbC5haSA9IGFpIiwiXG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwxVnpaWEp6TDIxeWREWTBOamN2Ukc5amRXMWxiblJ6TDFCeWIycGxZM1J6TDJGcEwzTnlZeTl0YkM5cGJtUmxlQzVqYjJabVpXVWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl2VlhObGNuTXZiWEowTmpRMk55OUViMk4xYldWdWRITXZVSEp2YW1WamRITXZZV2t2YzNKakwyMXNMMmx1WkdWNExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGUFl5SXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaUpkZlE9PSIsIiMjIypcbiAqIEZpbGwgYW4gYXJyYXkgd2l0aCBhIHBhcnRpY3VsYXIgdmFsdWVcbiAqIEBwYXJhbSB7Kn0gZmlsbFxuICogQHBhcmFtIHtJbnRlZ2VyfSBsZW5ndGhcbiAqIEByZXR1cm4ge1tdfVxuICMjI1xuZmlsbEFycmF5ID0gKGZpbGwsIGxlbmd0aCkgLT5cbiAgICB3aGlsZSBsZW5ndGgtLVxuICAgICAgICBmaWxsXG5cbm1vZHVsZS5leHBvcnRzID0gZmlsbEFycmF5IiwiZXhwb3J0cy5maWxsQXJyYXkgPSByZXF1aXJlICcuL2ZpbGxBcnJheS5jb2ZmZWUnXG5leHBvcnRzLnJhbmRvbVZlY3RvciA9IHJlcXVpcmUgJy4vcmFuZG9tVmVjdG9yLmNvZmZlZSciLCIjIyMqXG4gKiBDcmVhdGUgYSByYW5kb20gdmVjdG9yXG4gKiBAcGFyYW0gIHtbW11dfSBtbSBtaW5tYXhcbiAqIEByZXR1cm4ge1tdfVxuIyMjXG5yYW5kb21WZWN0b3IgPSAobWlubWF4KSAtPiBtaW5tYXgubWFwIChjdXIpIC0+IGN1clswXSArICgoY3VyWzFdIC0gY3VyWzBdKSAqIE1hdGgucmFuZG9tKCkpXG5cbm1vZHVsZS5leHBvcnRzID0gcmFuZG9tVmVjdG9yIl19
